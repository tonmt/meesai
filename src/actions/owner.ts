'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getWalletBalance } from '@/lib/ledger'

/**
 * Owner Dashboard: ดึงสินค้าทั้งหมดของ Owner
 */
export async function getOwnerAssets() {
    const session = await auth()
    if (!session?.user?.id) return null

    const assets = await prisma.itemAsset.findMany({
        where: { ownerId: session.user.id },
        include: {
            product: {
                select: {
                    titleLo: true,
                    titleEn: true,
                    rentalPrice: true,
                    images: true,
                    size: true,
                    category: { select: { nameLo: true, nameEn: true } },
                },
            },
            _count: {
                select: { bookings: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return assets
}

/**
 * Owner Dashboard: ดึงสรุปรายได้
 */
export async function getOwnerRevenueSummary() {
    const session = await auth()
    if (!session?.user?.id) return null

    // Total earnings = SUM of RENTAL_PAYMENT transactions to owner's wallet
    const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
    })

    // Wallet balance (computed from walletId, not userId)
    const balance = wallet ? await getWalletBalance(wallet.id) : 0

    let totalEarnings = 0
    let totalBookings = 0
    let pendingPayouts = 0
    const transactions: {
        id: string
        amount: number
        type: string
        note: string | null
        createdAt: Date
        booking: {
            id: string
            pickupDate: Date
            returnDate: Date
            renter: { name: string }
        } | null
    }[] = []

    if (wallet) {
        // Total earnings
        const earningsResult = await prisma.transaction.aggregate({
            where: {
                destWalletId: wallet.id,
                type: 'RENTAL_PAYMENT',
            },
            _sum: { amount: true },
        })
        totalEarnings = earningsResult._sum.amount || 0

        // Total bookings for owner's assets
        totalBookings = await prisma.booking.count({
            where: {
                asset: { ownerId: session.user.id },
                status: { in: ['CONFIRMED', 'PICKED_UP', 'RETURNED', 'COMPLETED'] },
            },
        })

        // Pending payouts
        const pendingResult = await prisma.payout.aggregate({
            where: {
                walletId: wallet.id,
                status: 'PENDING',
            },
            _sum: { amount: true },
        })
        pendingPayouts = pendingResult._sum.amount || 0

        // Recent transactions
        const recentTxns = await prisma.transaction.findMany({
            where: { destWalletId: wallet.id },
            include: {
                booking: {
                    select: {
                        id: true,
                        pickupDate: true,
                        returnDate: true,
                        renter: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
        })
        transactions.push(...recentTxns)
    }

    return {
        balance,
        totalEarnings,
        totalBookings,
        pendingPayouts,
        transactions,
    }
}

/**
 * Owner Dashboard: ดึง bookings ล่าสุดสำหรับสินค้าของ Owner
 */
export async function getOwnerRecentBookings() {
    const session = await auth()
    if (!session?.user?.id) return []

    return prisma.booking.findMany({
        where: {
            asset: { ownerId: session.user.id },
        },
        include: {
            asset: {
                select: {
                    assetCode: true,
                    product: { select: { titleLo: true, titleEn: true, images: true } },
                },
            },
            renter: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })
}

/**
 * Owner: ขอถอนเงิน (Payout Request)
 */
export async function requestPayoutAction(amount: number): Promise<{
    success: boolean
    error?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' }
    }

    if (amount <= 0) {
        return { success: false, error: 'ຈຳນວນເງິນບໍ່ຖືກຕ້ອງ' }
    }

    // Get wallet first, then check balance
    const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
    })
    if (!wallet) {
        return { success: false, error: 'ບໍ່ພົບ Wallet' }
    }

    const balance = await getWalletBalance(wallet.id)
    if (amount > balance) {
        return { success: false, error: 'ຍອດເງິນບໍ່ພຽງພໍ' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Create payout record
            await tx.payout.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    status: 'PENDING',
                },
            })

            // Create outgoing transaction (debit from wallet)
            await tx.transaction.create({
                data: {
                    amount,
                    type: 'PAYOUT',
                    sourceWalletId: wallet.id,
                    note: `ຖອນເງິນ ${amount.toLocaleString()} ₭`,
                },
            })
        })

        return { success: true }
    } catch (error) {
        console.error('Payout request error:', error)
        return { success: false, error: 'ເກີດຂໍ້ຜິດພາດ' }
    }
}
