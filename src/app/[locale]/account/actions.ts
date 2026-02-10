"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

// ══════════════════════════════════════════════
// ZOD SCHEMAS
// ══════════════════════════════════════════════

const userIdSchema = z.string().cuid().or(z.string().uuid());
const bookingIdSchema = z.string().cuid().or(z.string().uuid());
const garmentIdSchema = z.string().cuid().or(z.string().uuid());

const walletAmountSchema = z.number().positive("ຈຳນວນເງິນຕ້ອງຫຼາຍກວ່າ 0").max(100_000_000, "ຈຳນວນເງິນເກີນຂີດຈຳກັດ");
const extendDaysSchema = z.number().int().min(1, "ຂະຫຍາຍຕ່ຳສຸດ 1 ມື້").max(7, "ຂະຫຍາຍສູງສຸດ 7 ມື້");

const sizeProfileSchema = z.object({
    bust: z.number().positive().max(300).optional(),
    waist: z.number().positive().max(300).optional(),
    hip: z.number().positive().max(300).optional(),
    height: z.number().positive().max(300).optional(),
    weight: z.number().positive().max(500).optional(),
    notes: z.string().max(500).optional(),
});

// ══════════════════════════════════════════════
// WALLET ACTIONS
// ══════════════════════════════════════════════

/** ดึง/สร้าง Wallet สำหรับ user */
export async function getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
        where: { userId },
        include: {
            transactions: { orderBy: { createdAt: "desc" }, take: 10 },
        },
    });

    if (!wallet) {
        wallet = await prisma.wallet.create({
            data: { userId },
            include: {
                transactions: { orderBy: { createdAt: "desc" }, take: 10 },
            },
        });
    }

    return wallet;
}

/** เติมเงิน Wallet */
export async function topUpWallet(userId: string, amount: number) {
    userIdSchema.parse(userId);
    walletAmountSchema.parse(amount);
    rateLimit(`topup:${userId}`, 10);

    const wallet = await getOrCreateWallet(userId);

    const updated = await prisma.$transaction(async (tx) => {
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: "TOPUP",
                amount,
                description: `ເຕີມເງິນ ${amount.toLocaleString()} ₭`,
            },
        });

        return tx.wallet.update({
            where: { id: wallet.id },
            data: { availableBalance: { increment: amount } },
        });
    });

    revalidatePath("/account");
    revalidatePath("/account/wallet");
    return updated;
}

/** ถอนเงิน Wallet */
export async function withdrawWallet(userId: string, amount: number) {
    userIdSchema.parse(userId);
    walletAmountSchema.parse(amount);

    const wallet = await getOrCreateWallet(userId);
    if (wallet.availableBalance < amount) {
        throw new Error("ยอดเงินไม่เพียงพอ");
    }

    const updated = await prisma.$transaction(async (tx) => {
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: "WITHDRAW",
                amount,
                description: `ຖອນເງິນ ${amount.toLocaleString()} ₭`,
            },
        });

        return tx.wallet.update({
            where: { id: wallet.id },
            data: { availableBalance: { decrement: amount } },
        });
    });

    revalidatePath("/account");
    revalidatePath("/account/wallet");
    return updated;
}

/** ล็อกมัดจำ */
export async function lockDeposit(
    userId: string,
    amount: number,
    bookingId: string,
    garmentCode: string,
) {
    const wallet = await getOrCreateWallet(userId);
    if (wallet.availableBalance < amount) {
        throw new Error("ยอดเงินไม่เพียงพอสำหรับมัดจำ");
    }

    return prisma.$transaction(async (tx) => {
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: "LOCK",
                amount,
                description: `ກັນວົງເງິນມັດຈຳ ຊຸດ ${garmentCode}`,
                reference: bookingId,
            },
        });

        return tx.wallet.update({
            where: { id: wallet.id },
            data: {
                availableBalance: { decrement: amount },
                lockedBalance: { increment: amount },
            },
        });
    });
}

/** ปลดล็อกมัดจำ (QC ผ่าน) */
export async function unlockDeposit(
    userId: string,
    amount: number,
    bookingId: string,
    garmentCode: string,
) {
    const wallet = await getOrCreateWallet(userId);

    return prisma.$transaction(async (tx) => {
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: "UNLOCK",
                amount,
                description: `ປົດລ໋ອກມັດຈຳ ຊຸດ ${garmentCode} (QC ผ่าน)`,
                reference: bookingId,
            },
        });

        return tx.wallet.update({
            where: { id: wallet.id },
            data: {
                availableBalance: { increment: amount },
                lockedBalance: { decrement: amount },
            },
        });
    });
}

// ══════════════════════════════════════════════
// BOOKING ACTIONS
// ══════════════════════════════════════════════

/** ดึง bookings ตาม status category */
export async function getBookingsByStatus(userId: string, statusGroup: string) {
    const statusMap: Record<string, BookingStatusType[]> = {
        toPay: ["AWAITING_PAYMENT"],
        toReceive: ["CONFIRMED", "SHIPPING"],
        inUse: ["PICKED_UP", "IN_USE"],
        toReturn: ["AWAITING_RETURN"],
        toRate: ["COMPLETED"],
    };

    const statuses = statusMap[statusGroup] || [];

    return prisma.booking.findMany({
        where: { renterId: userId, status: { in: statuses } },
        include: {
            garment: { include: { images: { take: 1 }, shop: true } },
            review: true,
        },
        orderBy: { updatedAt: "desc" },
    });
}

type BookingStatusType =
    | "PENDING"
    | "AWAITING_PAYMENT"
    | "CONFIRMED"
    | "SHIPPING"
    | "PICKED_UP"
    | "IN_USE"
    | "AWAITING_RETURN"
    | "RETURNED"
    | "QC_CHECKING"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED";

/** นับ bookings แต่ละ status group */
export async function getBookingStatusCounts(userId: string) {
    const bookings = await prisma.booking.findMany({
        where: { renterId: userId },
        select: { status: true },
    });

    const counts = {
        toPay: 0,
        toReceive: 0,
        inUse: 0,
        toReturn: 0,
        toRate: 0,
    };

    for (const b of bookings) {
        if (b.status === "AWAITING_PAYMENT") counts.toPay++;
        else if (b.status === "CONFIRMED" || b.status === "SHIPPING") counts.toReceive++;
        else if (b.status === "PICKED_UP" || b.status === "IN_USE") counts.inUse++;
        else if (b.status === "AWAITING_RETURN") counts.toReturn++;
        else if (b.status === "COMPLETED") {
            // Check if has review
            const hasReview = await prisma.review.findFirst({
                where: { booking: { id: b.status } }, // will check below
            });
            if (!hasReview) counts.toRate++;
        }
    }

    // Fix toRate: count COMPLETED bookings without review
    const completedWithoutReview = await prisma.booking.count({
        where: {
            renterId: userId,
            status: "COMPLETED",
            review: null,
        },
    });
    counts.toRate = completedWithoutReview;

    return counts;
}

// ══════════════════════════════════════════════
// CANCEL BOOKING + REFUND POLICY
// ══════════════════════════════════════════════

/**
 * Refund Policy:
 *   - ยกเลิกก่อนวันรับ > 3 วัน  → คืน 100%
 *   - ยกเลิกก่อนวันรับ 1-3 วัน  → คืน 50%
 *   - ยกเลิกวันเดียวกับวันรับ    → ไม่คืน (0%)
 */
function calculateRefundPercent(pickupDate: Date): number {
    const now = new Date();
    const diffMs = pickupDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 3) return 100;
    if (diffDays >= 1) return 50;
    return 0;
}

/** ยกเลิกการจอง + คืนเงินตาม Refund Policy */
export async function cancelBooking(bookingId: string) {
    bookingIdSchema.parse(bookingId);
    const session = await auth();
    if (!session?.user?.id) throw new Error("ກະລຸນາເຂົ້າສູ່ລະບົບ");
    rateLimit(`cancel:${session.user.id}`, 3);

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { garment: true },
    });

    if (!booking) throw new Error("ບໍ່ພົບການຈອງ");
    if (booking.renterId !== session.user.id) throw new Error("ບໍ່ມີສິດຍົກເລີກ");

    const userId = session.user.id;

    // ห้ามยกเลิกถ้าชุดส่งแล้ว
    const cancellableStatuses = ["PENDING", "AWAITING_PAYMENT", "CONFIRMED"];
    if (!cancellableStatuses.includes(booking.status)) {
        throw new Error("ບໍ່ສາມາດຍົກເລີກໄດ້ໃນສະຖານະນີ້ (ຊຸດຖືກສົ່ງແລ້ວ)");
    }

    const refundPercent = calculateRefundPercent(booking.pickupDate);
    const refundAmount = Math.round(booking.totalAmount * (refundPercent / 100));

    await prisma.$transaction(async (tx) => {
        // 1. อัปเดตสถานะ booking → CANCELLED
        await tx.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
        });

        // 2. ปลดล็อกชุด → AVAILABLE (ถ้าชุดถูก RESERVED อยู่)
        if (booking.garment.status === "RESERVED") {
            await tx.garment.update({
                where: { id: booking.garmentId },
                data: { status: "AVAILABLE" },
            });
        }

        // 3. คืนเงินเข้า Wallet (ถ้ามี refund)
        if (refundAmount > 0) {
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });

            if (wallet) {
                await tx.walletTransaction.create({
                    data: {
                        walletId: wallet.id,
                        type: "REFUND",
                        amount: refundAmount,
                        description: `ຄືນເງິນ ${refundPercent}% ຈາກການຍົກເລີກ ຊຸດ ${booking.garment.code}`,
                        reference: bookingId,
                    },
                });

                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { availableBalance: { increment: refundAmount } },
                });
            }
        }

        // 4. ปลดล็อกมัดจำ (ถ้ามี)
        if (booking.holdAmount > 0) {
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });

            if (wallet && wallet.lockedBalance >= booking.holdAmount) {
                await tx.walletTransaction.create({
                    data: {
                        walletId: wallet.id,
                        type: "UNLOCK",
                        amount: booking.holdAmount,
                        description: `ປົດລ໋ອກມັດຈຳ ຊຸດ ${booking.garment.code} (ຍົກເລີກ)`,
                        reference: bookingId,
                    },
                });

                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: {
                        availableBalance: { increment: booking.holdAmount },
                        lockedBalance: { decrement: booking.holdAmount },
                    },
                });
            }
        }
    });

    revalidatePath("/account/bookings");
    revalidatePath("/browse");
    return { cancelled: true, refundPercent, refundAmount };
}

// ══════════════════════════════════════════════
// EXTEND RENTAL (with overlap check)
// ══════════════════════════════════════════════

/** ขอเช่าต่อ (Extend) — เช็คคิวชนก่อนเลื่อน */
export async function requestExtend(bookingId: string, extraDays: number) {
    bookingIdSchema.parse(bookingId);
    extendDaysSchema.parse(extraDays);
    const session = await auth();
    if (!session?.user?.id) throw new Error("ກະລຸນາເຂົ້າສູ່ລະບົບ");
    rateLimit(`extend:${session.user.id}`, 5);

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { garment: true },
    });

    if (!booking) throw new Error("ບໍ່ພົບການຈອງ");
    if (booking.renterId !== session.user.id) throw new Error("ບໍ່ມີສິດ");
    if (booking.status !== "IN_USE" && booking.status !== "PICKED_UP") {
        throw new Error("ບໍ່ສາມາດຂໍເຊົ່າຕໍ່ໄດ້ໃນສະຖານະນີ້");
    }

    // ── คำนวณวันใหม่ ──
    const newReturnDate = new Date(
        booking.returnDate.getTime() + extraDays * 24 * 60 * 60 * 1000,
    );
    const newBufferEnd = new Date(
        newReturnDate.getTime() + booking.garment.bufferDays * 24 * 60 * 60 * 1000,
    );

    // ── เช็คว่าชนกับ booking ถัดไปไหม ──
    const conflicting = await prisma.booking.count({
        where: {
            id: { not: bookingId }, // ไม่นับตัวเอง
            garmentId: booking.garmentId,
            status: { notIn: ["CANCELLED", "COMPLETED"] },
            pickupDate: { lte: newBufferEnd },
            bufferEnd: { gte: newReturnDate },
        },
    });

    if (conflicting > 0) {
        throw new Error(
            "ບໍ່ສາມາດຂະຫຍາຍໄດ້ — ຊຸດນີ້ມີຄິວຈອງຕໍ່ໄປແລ້ວ ກະລຸນາຄືນຕາມກຳໜົດ",
        );
    }

    // ── คำนวณค่าเช่าเพิ่ม (30% ต่อวัน) ──
    const dailyRate = Math.round(booking.garment.rentalPrice * 0.3);
    const extensionFee = dailyRate * extraDays;

    const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            extendedDays: { increment: extraDays },
            extensionFee: { increment: extensionFee },
            returnDate: newReturnDate,
            bufferEnd: newBufferEnd,
        },
    });

    revalidatePath("/account/bookings");
    return { updated, extensionFee, dailyRate, newReturnDate };
}

// ══════════════════════════════════════════════
// WISHLIST ACTIONS
// ══════════════════════════════════════════════

/** Toggle wishlist */
export async function toggleWishlist(userId: string, garmentId: string) {
    userIdSchema.parse(userId);
    garmentIdSchema.parse(garmentId);
    const existing = await prisma.wishlist.findUnique({
        where: { userId_garmentId: { userId, garmentId } },
    });

    if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });
        revalidatePath("/account/wishlist");
        return { added: false };
    }

    await prisma.wishlist.create({ data: { userId, garmentId } });
    revalidatePath("/account/wishlist");
    return { added: true };
}

/** ดึง wishlist */
export async function getWishlist(userId: string) {
    return prisma.wishlist.findMany({
        where: { userId },
        include: {
            garment: {
                include: { images: { take: 1 }, category: true, shop: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

// ══════════════════════════════════════════════
// SIZE PROFILE ACTIONS
// ══════════════════════════════════════════════

/** ดึง/สร้าง Size Profile */
export async function getSizeProfile(userId: string) {
    return prisma.sizeProfile.findUnique({ where: { userId } });
}

/** บันทึก Size Profile */
export async function saveSizeProfile(
    userId: string,
    data: {
        bust?: number;
        waist?: number;
        hip?: number;
        height?: number;
        weight?: number;
        notes?: string;
    },
) {
    userIdSchema.parse(userId);
    sizeProfileSchema.parse(data);
    const profile = await prisma.sizeProfile.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
    });

    revalidatePath("/account/size-profile");
    return profile;
}

// ══════════════════════════════════════════════
// PAYMENT ACTION (Wallet-based)
// ══════════════════════════════════════════════

const reviewSchema = z.object({
    rating: z.number().int().min(1, "ຄະແນນຕ່ຳສຸດ 1").max(5, "ຄະແນນສູງສຸດ 5"),
    comment: z.string().max(500, "ຄວາມເຫັນບໍ່ເກີນ 500 ຕົວອັກສອນ").optional(),
});

/** ชำระเงิน Booking ผ่าน Wallet */
export async function payBooking(bookingId: string) {
    bookingIdSchema.parse(bookingId);
    const session = await auth();
    if (!session?.user?.id) throw new Error("ກະລຸນາເຂົ້າສູ່ລະບົບ");
    rateLimit(`pay:${session.user.id}`, 5);

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId, renterId: session.user.id },
        include: { garment: { select: { code: true } } },
    });

    if (!booking) throw new Error("ບໍ່ພົບລາຍການຈອງ");
    if (booking.status !== "AWAITING_PAYMENT") throw new Error("ສະຖານະບໍ່ຖືກຕ້ອງ");

    // Check deadline
    if (booking.payDeadline && new Date() > booking.payDeadline) {
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
        });
        await prisma.garment.update({
            where: { id: booking.garmentId },
            data: { status: "AVAILABLE" },
        });
        throw new Error("ໝົດເວລາຊຳລະ ລາຍການຖືກຍົກເລີກອັດຕະໂນມັດ");
    }

    // Check wallet balance
    const wallet = await getOrCreateWallet(session.user.id);
    if (wallet.availableBalance < booking.totalAmount) {
        throw new Error(`ຍອດເງິນບໍ່ພຽງພໍ (ຕ້ອງການ ${booking.totalAmount.toLocaleString()} ₭, ມີ ${wallet.availableBalance.toLocaleString()} ₭)`);
    }

    // Execute payment in transaction
    await prisma.$transaction(async (tx) => {
        // 1. Deduct wallet
        await tx.wallet.update({
            where: { id: wallet.id },
            data: {
                availableBalance: { decrement: booking.totalAmount },
            },
        });

        // 2. Lock deposit (hold amount)
        if (booking.holdAmount > 0) {
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    lockedBalance: { increment: booking.holdAmount },
                },
            });
        }

        // 3. Create payment transaction
        await tx.walletTransaction.create({
            data: {
                walletId: wallet.id,
                type: "PAYMENT",
                amount: booking.totalAmount,
                description: `ຊຳລະຄ່າເຊົ່າ ${booking.garment.code}`,
                reference: bookingId,
            },
        });

        // 4. If deposit > 0, create lock transaction
        if (booking.holdAmount > 0) {
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: "LOCK",
                    amount: booking.holdAmount,
                    description: `ກັນວົງເງິນມັດຈຳ ${booking.garment.code}`,
                    reference: bookingId,
                },
            });
        }

        // 5. Update booking status
        await tx.booking.update({
            where: { id: bookingId },
            data: {
                status: "CONFIRMED",
                paidAt: new Date(),
            },
        });
    });

    revalidatePath("/account/bookings");
    revalidatePath(`/account/bookings/${bookingId}`);
    return { success: true };
}

// ══════════════════════════════════════════════
// REVIEW ACTION
// ══════════════════════════════════════════════

/** ส่งรีวิว */
export async function submitReview(
    bookingId: string,
    rating: number,
    comment?: string,
) {
    bookingIdSchema.parse(bookingId);
    reviewSchema.parse({ rating, comment });
    const session = await auth();
    if (!session?.user?.id) throw new Error("ກະລຸນາເຂົ້າສູ່ລະບົບ");
    rateLimit(`review:${session.user.id}`, 3);

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId, renterId: session.user.id },
        include: { review: true },
    });

    if (!booking) throw new Error("ບໍ່ພົບລາຍການຈອງ");
    if (booking.status !== "COMPLETED") throw new Error("ສາມາດຣີວິວໄດ້ຫຼັງສຳເລັດເທົ່ານັ້ນ");
    if (booking.review) throw new Error("ທ່ານໄດ້ຣີວິວແລ້ວ");

    await prisma.review.create({
        data: {
            bookingId,
            userId: session.user.id,
            rating,
            comment: comment || null,
        },
    });

    revalidatePath(`/account/bookings/${bookingId}`);
    revalidatePath("/account/bookings");
    return { success: true };
}
