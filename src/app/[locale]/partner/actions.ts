"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ══════════════════════════════════════════════
// PARTNER DASHBOARD
// ══════════════════════════════════════════════

/** ดึงข้อมูล Dashboard ร้านค้า */
export async function getPartnerDashboard(ownerId: string) {
    const shop = await prisma.shop.findUnique({
        where: { ownerId },
        include: { garments: { select: { id: true } } },
    });

    if (!shop) return null;

    const garmentIds = shop.garments.map((g) => g.id);

    // Income: completed bookings this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [monthlyIncome, todayIncome, pendingPayout] = await Promise.all([
        prisma.booking.aggregate({
            where: {
                garmentId: { in: garmentIds },
                status: "COMPLETED",
                updatedAt: { gte: startOfMonth },
            },
            _sum: { rentalFee: true },
        }),
        prisma.booking.aggregate({
            where: {
                garmentId: { in: garmentIds },
                status: "COMPLETED",
                updatedAt: { gte: startOfDay },
            },
            _sum: { rentalFee: true },
        }),
        prisma.booking.aggregate({
            where: {
                garmentId: { in: garmentIds },
                status: { in: ["COMPLETED", "RETURNED", "QC_CHECKING"] },
            },
            _sum: { rentalFee: true },
        }),
    ]);

    // To-do counts
    const [toShipCount, qcCheckCount] = await Promise.all([
        prisma.booking.count({
            where: { garmentId: { in: garmentIds }, status: "CONFIRMED" },
        }),
        prisma.booking.count({
            where: { garmentId: { in: garmentIds }, status: "RETURNED" },
        }),
    ]);

    return {
        shop,
        income: {
            today: todayIncome._sum.rentalFee || 0,
            month: monthlyIncome._sum.rentalFee || 0,
            pendingPayout: pendingPayout._sum.rentalFee || 0,
        },
        todo: {
            toShip: toShipCount,
            qcCheck: qcCheckCount,
        },
    };
}

// ══════════════════════════════════════════════
// PARTNER ORDERS
// ══════════════════════════════════════════════

/** ดึง orders ของร้านค้า */
export async function getPartnerOrders(
    ownerId: string,
    tab: string = "all",
) {
    const shop = await prisma.shop.findUnique({
        where: { ownerId },
        include: { garments: { select: { id: true } } },
    });

    if (!shop) return [];

    const garmentIds = shop.garments.map((g) => g.id);

    const statusMap: Record<string, string[]> = {
        toShip: ["CONFIRMED"],
        shipping: ["SHIPPING"],
        inUse: ["PICKED_UP", "IN_USE"],
        toReturn: ["AWAITING_RETURN", "RETURNED"],
        qcCheck: ["RETURNED", "QC_CHECKING"],
        completed: ["COMPLETED"],
        all: [],
    };

    const statuses = statusMap[tab] || [];
    const where: Record<string, unknown> = { garmentId: { in: garmentIds } };
    if (statuses.length > 0) {
        where.status = { in: statuses };
    }

    return prisma.booking.findMany({
        where,
        include: {
            garment: { include: { images: { take: 1 } } },
            renter: { select: { name: true, phone: true, avatar: true } },
        },
        orderBy: { updatedAt: "desc" },
    });
}

/** อัพเดทสถานะ order */
export async function updateOrderStatus(
    bookingId: string,
    newStatus: string,
    trackingCode?: string,
) {
    const data: Record<string, unknown> = { status: newStatus };

    if (newStatus === "SHIPPING" && trackingCode) {
        data.trackingCode = trackingCode;
        data.shippedAt = new Date();
    }
    if (newStatus === "QC_CHECKING") {
        data.returnedAt = new Date();
    }
    if (newStatus === "COMPLETED") {
        data.qcPassedAt = new Date();
    }

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data,
    });

    revalidatePath("/partner/orders");
    revalidatePath("/partner");
    return updated;
}

// ══════════════════════════════════════════════
// PARTNER INVENTORY
// ══════════════════════════════════════════════

/** ดึง inventory ของร้านค้า */
export async function getPartnerInventory(ownerId: string) {
    const shop = await prisma.shop.findUnique({
        where: { ownerId },
    });

    if (!shop) return [];

    return prisma.garment.findMany({
        where: { shopId: shop.id },
        include: {
            category: true,
            images: { take: 1 },
            bookings: {
                where: {
                    status: { notIn: ["CANCELLED", "COMPLETED"] },
                },
                orderBy: { pickupDate: "asc" },
                select: {
                    id: true,
                    pickupDate: true,
                    returnDate: true,
                    status: true,
                    renter: { select: { name: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

/** อัพเดทสถานะ garment */
export async function updateGarmentStatus(
    garmentId: string,
    status: "AVAILABLE" | "MAINTENANCE" | "RETIRED",
) {
    const updated = await prisma.garment.update({
        where: { id: garmentId },
        data: { status },
    });

    revalidatePath("/partner/inventory");
    return updated;
}

// ══════════════════════════════════════════════
// QC STATION
// ══════════════════════════════════════════════

/** Submit QC — ผ่าน (OK) หรือ แจ้งเสียหาย (Claim) */
export async function submitQC(
    bookingId: string,
    result: "PASS" | "DAMAGE",
    damageData?: {
        description: string;
        estimatedCost: number;
        damagePoints: string[];
    },
) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            garment: { select: { code: true, bufferDays: true } },
            renter: { select: { id: true } },
        },
    });

    if (!booking) throw new Error("ບໍ່ພົບລາຍການຈອງ");
    if (booking.status !== "RETURNED" && booking.status !== "QC_CHECKING") {
        throw new Error("ສະຖານະບໍ່ຖືກຕ້ອງສຳລັບ QC");
    }

    if (result === "PASS") {
        // QC ผ่าน → COMPLETED + unlock deposit + garment → MAINTENANCE (laundry)
        await prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: "COMPLETED",
                    qcPassedAt: new Date(),
                },
            });

            // Unlock deposit back to renter
            if (booking.holdAmount > 0) {
                const wallet = await tx.wallet.findUnique({
                    where: { userId: booking.renter.id },
                });
                if (wallet) {
                    await tx.wallet.update({
                        where: { id: wallet.id },
                        data: {
                            lockedBalance: { decrement: booking.holdAmount },
                            availableBalance: { increment: booking.holdAmount },
                        },
                    });
                    await tx.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            type: "UNLOCK",
                            amount: booking.holdAmount,
                            description: `ຄືນມັດຈຳ ${booking.garment.code} (QC ຜ່ານ)`,
                            reference: bookingId,
                        },
                    });
                }
            }

            // Garment → MAINTENANCE for laundry
            await tx.garment.update({
                where: { id: booking.garmentId },
                data: { status: "MAINTENANCE" },
            });
        });
    } else {
        // QC เสียหาย → DISPUTED + create DamageClaim
        if (!damageData?.description) throw new Error("ກະລຸນາລະບຸລາຍລະອຽດຄວາມເສຍຫາຍ");

        await prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: "DISPUTED" },
            });

            await tx.damageClaim.create({
                data: {
                    bookingId,
                    renterId: booking.renter.id,
                    description: `${damageData.damagePoints?.join(", ") || ""} — ${damageData.description}`,
                    estimatedCost: damageData.estimatedCost || 0,
                    status: "PENDING",
                },
            });

            // Garment → MAINTENANCE
            await tx.garment.update({
                where: { id: booking.garmentId },
                data: { status: "MAINTENANCE" },
            });
        });
    }

    revalidatePath("/partner/orders");
    revalidatePath(`/partner/qc/${bookingId}`);
    revalidatePath("/partner");
    return { success: true, result };
}
