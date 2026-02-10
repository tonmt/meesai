"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ═══════════════════════════════════════════════════
// HUB DASHBOARD STATS
// ═══════════════════════════════════════════════════

export async function getHubStats() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const [awaitingReceive, atHub, returnedToHub, cleaning, readyToShip] = await Promise.all([
        prisma.booking.count({ where: { status: "CONFIRMED" } }),  // ร้านส่งมา รอรับเข้า Hub
        prisma.booking.count({ where: { status: "AT_HUB" } }),
        prisma.booking.count({ where: { status: "RETURNED_TO_HUB" } }),
        prisma.booking.count({ where: { status: "CLEANING" } }),
        prisma.booking.count({ where: { status: "QC_CHECKING" } }),
    ]);

    return { awaitingReceive, atHub, returnedToHub, cleaning, readyToShip };
}

// ═══════════════════════════════════════════════════
// HUB BOOKINGS LIST
// ═══════════════════════════════════════════════════

export async function getHubBookings(tab: string = "incoming") {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const statusMap: Record<string, string[]> = {
        incoming: ["CONFIRMED"],
        atHub: ["AT_HUB"],
        returnedToHub: ["RETURNED_TO_HUB"],
        qc: ["QC_CHECKING"],
        cleaning: ["CLEANING"],
        all: [
            "CONFIRMED", "AT_HUB", "SHIPPING", "RETURNED",
            "RETURNED_TO_HUB", "QC_CHECKING", "CLEANING", "RETURNED_TO_SHOP",
        ],
    };

    const statuses = statusMap[tab] || statusMap.all;

    const bookings = await prisma.booking.findMany({
        where: { status: { in: statuses as never[] } },
        include: {
            renter: { select: { name: true, phone: true } },
            garment: {
                select: {
                    titleLo: true,
                    code: true,
                    shop: { select: { nameLo: true } },
                },
            },
        },
        orderBy: [{ pickupDate: "asc" }],
        take: 50,
    });

    return bookings;
}

import { HUB_QC_CHECKLIST } from "./constants";

// ═══════════════════════════════════════════════════
// HUB RECEIVE (ร้าน → Hub)
// ═══════════════════════════════════════════════════

export async function hubReceiveBooking(bookingId: string, checklist: string[]) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    // Validate checklist has all required items
    const missingItems = HUB_QC_CHECKLIST.filter(item => !checklist.includes(item));
    if (missingItems.length > 0) {
        return { error: `Missing checklist items: ${missingItems.join(", ")}` };
    }

    await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: "AT_HUB",
            hubChecklist: checklist,
            hubReceivedAt: new Date(),
        },
    });

    revalidatePath("/admin/hub");
    return { success: true };
}

// ═══════════════════════════════════════════════════
// HUB SEND OUT (Hub → ลูกค้า)
// ═══════════════════════════════════════════════════

export async function hubSendBooking(bookingId: string, trackingCode?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: "SHIPPING",
            hubSentAt: new Date(),
            shippedAt: new Date(),
            trackingCode: trackingCode || null,
        },
    });

    revalidatePath("/admin/hub");
    return { success: true };
}

// ═══════════════════════════════════════════════════
// HUB RECEIVE RETURN (ลูกค้าคืน → Hub)
// ═══════════════════════════════════════════════════

export async function hubReceiveReturn(bookingId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: "RETURNED_TO_HUB",
            returnedAt: new Date(),
        },
    });

    revalidatePath("/admin/hub");
    return { success: true };
}

// ═══════════════════════════════════════════════════
// HUB QC (ตรวจชุด → ส่งซักแห้ง หรือ แจ้ง Damage)
// ═══════════════════════════════════════════════════

export async function hubQCCheck(
    bookingId: string,
    result: "PASS" | "DAMAGE",
    damageNote?: string,
) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    if (result === "PASS") {
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "CLEANING",
                qcPassedAt: new Date(),
            },
        });
    } else {
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "DISPUTED",
                notes: damageNote || "Hub QC พบความเสียหาย",
            },
        });
    }

    revalidatePath("/admin/hub");
    return { success: true };
}

// ═══════════════════════════════════════════════════
// HUB CLEANING DONE → คืนร้าน
// ═══════════════════════════════════════════════════

export async function hubCleaningDone(bookingId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: "RETURNED_TO_SHOP",
        },
    });

    revalidatePath("/admin/hub");
    return { success: true };
}

// ═══════════════════════════════════════════════════
// HUB COMPLETE (ร้านรับคืนแล้ว → จบ)
// ═══════════════════════════════════════════════════

export async function hubComplete(bookingId: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: "COMPLETED",
        },
    });

    revalidatePath("/admin/hub");
    return { success: true };
}
