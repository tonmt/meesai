"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ══════════════════════════════════════════════
// Calculate Fees
// ══════════════════════════════════════════════
export async function calculateFees(garmentId: string, backupSize: boolean) {
    const garment = await prisma.garment.findUnique({
        where: { id: garmentId },
        select: { rentalPrice: true, deposit: true, backupSizeFee: true },
    });
    if (!garment) throw new Error("Garment not found");

    const rentalFee = garment.rentalPrice;
    const deliveryFee = 30000; // TODO: dynamic based on distance
    const laundryFee = 20000; // TODO: dynamic based on garment type
    const backupFee = backupSize ? garment.backupSizeFee : 0;
    const serviceFee = 0; // Platform fee (absorbed for now)
    const totalAmount = rentalFee + deliveryFee + laundryFee + backupFee + serviceFee;
    const holdAmount = garment.deposit;

    return { rentalFee, deliveryFee, laundryFee, backupFee, serviceFee, totalAmount, holdAmount };
}

// ══════════════════════════════════════════════
// Create Booking
// ══════════════════════════════════════════════
export async function createBooking(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const garmentId = formData.get("garmentId") as string;
    const pickupStr = formData.get("pickup") as string;
    const returnStr = formData.get("return") as string;
    const eventStr = formData.get("eventDate") as string;
    const backupSize = formData.get("backupSize") === "true";
    const notes = formData.get("notes") as string;

    if (!garmentId || !pickupStr || !returnStr) throw new Error("Missing required fields");

    const garment = await prisma.garment.findUnique({
        where: { id: garmentId },
        select: { id: true, rentalPrice: true, deposit: true, backupSizeFee: true, bufferDays: true, status: true },
    });

    if (!garment) throw new Error("Garment not found");
    if (garment.status !== "AVAILABLE") throw new Error("Garment not available");

    const pickupDate = new Date(pickupStr);
    const returnDate = new Date(returnStr);
    const eventDate = eventStr ? new Date(eventStr) : pickupDate;
    const bufferEnd = new Date(returnDate);
    bufferEnd.setDate(bufferEnd.getDate() + garment.bufferDays);

    // Check for booking overlap
    const overlap = await prisma.booking.count({
        where: {
            garmentId,
            status: { notIn: ["CANCELLED", "COMPLETED"] },
            pickupDate: { lte: returnDate },
            bufferEnd: { gte: pickupDate },
        },
    });
    if (overlap > 0) throw new Error("Garment already booked for these dates");

    // Calculate fees
    const fees = await calculateFees(garmentId, backupSize);

    // Create booking with payment deadline (30 minutes)
    const payDeadline = new Date();
    payDeadline.setMinutes(payDeadline.getMinutes() + 30);

    const booking = await prisma.booking.create({
        data: {
            eventDate,
            pickupDate,
            returnDate,
            bufferEnd,
            rentalFee: fees.rentalFee,
            depositFee: 0,
            serviceFee: fees.serviceFee,
            deliveryFee: fees.deliveryFee,
            laundryFee: fees.laundryFee,
            totalAmount: fees.totalAmount,
            holdAmount: fees.holdAmount,
            backupSizeRequested: backupSize,
            status: "AWAITING_PAYMENT",
            payDeadline,
            notes: notes || null,
            renterId: session.user.id,
            garmentId,
        },
    });

    // Lock the garment
    await prisma.garment.update({
        where: { id: garmentId },
        data: { status: "RESERVED" },
    });

    revalidatePath("/account/bookings");
    return { bookingId: booking.id, payDeadline: booking.payDeadline };
}

// ══════════════════════════════════════════════
// Upload Pre-Return Photos
// ══════════════════════════════════════════════
export async function uploadPreReturnPhotos(bookingId: string, photoUrls: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    await prisma.booking.update({
        where: { id: bookingId, renterId: session.user.id },
        data: { preReturnPhotos: photoUrls },
    });

    revalidatePath(`/account/bookings/${bookingId}`);
    return { success: true };
}
