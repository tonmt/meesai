/**
 * MeeSai Ledger — Double-Entry Transaction System
 *
 * Pillar 4: Double-Entry Ledger
 * - Wallet ไม่มี balance field → computed จาก Transaction
 * - Transaction เป็น append-only (ห้ามลบ/แก้)
 * - ทุก booking payment สร้าง 3 transactions:
 *   1. RENTAL_PAYMENT: Customer → Platform (rental fee)
 *   2. SERVICE_FEE: Platform keeps service portion
 *   3. DEPOSIT: Customer → Platform holding
 */

import { prisma } from '@/lib/prisma'
import type { TransactionType, Prisma } from '@prisma/client'

/**
 * Get wallet balance (computed from transactions)
 * Balance = SUM(incoming) - SUM(outgoing)
 */
export async function getWalletBalance(walletId: string): Promise<number> {
    const [incoming, outgoing] = await Promise.all([
        prisma.transaction.aggregate({
            where: { destWalletId: walletId },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { sourceWalletId: walletId },
            _sum: { amount: true },
        }),
    ])

    return (incoming._sum.amount || 0) - (outgoing._sum.amount || 0)
}

/**
 * Get or create wallet for a user
 */
export async function getOrCreateWallet(userId: string): Promise<string> {
    const existing = await prisma.wallet.findUnique({ where: { userId } })
    if (existing) return existing.id

    const wallet = await prisma.wallet.create({ data: { userId } })
    return wallet.id
}

/**
 * Record a payment for a booking.
 * Creates 3 transactions atomically:
 * 1. RENTAL_PAYMENT → Owner wallet
 * 2. SERVICE_FEE → Platform (no dest wallet)
 * 3. DEPOSIT → Platform holding (no dest wallet)
 */
export async function recordBookingPayment(
    bookingId: string,
    tx?: Prisma.TransactionClient
): Promise<{ success: boolean; error?: string }> {
    const client = tx || prisma

    try {
        const booking = await client.booking.findUnique({
            where: { id: bookingId },
            include: {
                asset: {
                    select: { ownerId: true },
                },
            },
        })

        if (!booking) {
            return { success: false, error: 'ບໍ່ພົບການຈອງ' }
        }

        // Get owner wallet
        const ownerWallet = await client.wallet.findUnique({
            where: { userId: booking.asset.ownerId },
        })

        if (!ownerWallet) {
            return { success: false, error: 'ເຈົ້າຂອງຊຸດບໍ່ມີ wallet' }
        }

        // 1. RENTAL_PAYMENT: External → Owner (100% of rental fee goes to owner)
        await client.transaction.create({
            data: {
                amount: booking.rentalFee,
                type: 'RENTAL_PAYMENT',
                destWalletId: ownerWallet.id,
                bookingId,
                note: `ຄ່າເຊົ່າ Booking ${bookingId.slice(-6)}`,
            },
        })

        // 2. SERVICE_FEE: External → Platform (no wallet, platform revenue)
        await client.transaction.create({
            data: {
                amount: booking.serviceFee,
                type: 'SERVICE_FEE',
                bookingId,
                note: `ຄ່າບໍລິການ ${booking.serviceFee.toLocaleString()} ₭`,
            },
        })

        // 3. DEPOSIT: External → Platform holding
        if (booking.deposit > 0) {
            await client.transaction.create({
                data: {
                    amount: booking.deposit,
                    type: 'DEPOSIT',
                    bookingId,
                    note: `ມັດຈຳ ${booking.deposit.toLocaleString()} ₭`,
                },
            })
        }

        return { success: true }
    } catch (error) {
        console.error('Record payment error:', error)
        return { success: false, error: 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກການຈ່າຍ' }
    }
}

/**
 * Refund deposit after QC passes
 */
export async function refundDeposit(
    bookingId: string,
    tx?: Prisma.TransactionClient
): Promise<{ success: boolean; error?: string }> {
    const client = tx || prisma

    const booking = await client.booking.findUnique({
        where: { id: bookingId },
        select: { id: true, deposit: true },
    })

    if (!booking || booking.deposit <= 0) {
        return { success: false, error: 'ບໍ່ມີມັດຈຳໃຫ້ຄືນ' }
    }

    await client.transaction.create({
        data: {
            amount: booking.deposit,
            type: 'DEPOSIT_REFUND',
            bookingId,
            note: `ຄືນມັດຈຳ Booking ${bookingId.slice(-6)}`,
        },
    })

    return { success: true }
}

/**
 * Get transaction history for a booking
 */
export async function getBookingTransactions(bookingId: string) {
    return prisma.transaction.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'asc' },
    })
}

/**
 * Get wallet transaction history
 */
export async function getWalletTransactions(walletId: string, take = 20) {
    return prisma.transaction.findMany({
        where: {
            OR: [
                { sourceWalletId: walletId },
                { destWalletId: walletId },
            ],
        },
        include: { booking: { select: { id: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        take,
    })
}
