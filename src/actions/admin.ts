'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

/**
 * Admin: ดึง dashboard stats
 */
export async function getAdminStats() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return null

    const [
        totalUsers,
        totalProducts,
        totalAssets,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalRevenue,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.itemAsset.count(),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.booking.count({ where: { status: 'CONFIRMED' } }),
        prisma.transaction.aggregate({
            where: { type: 'SERVICE_FEE' },
            _sum: { amount: true },
        }),
    ])

    return {
        totalUsers,
        totalProducts,
        totalAssets,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        platformRevenue: totalRevenue._sum.amount || 0,
    }
}

/**
 * Admin: ดึง users ทั้งหมด
 */
export async function getAdminUsers() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return []

    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            createdAt: true,
            _count: {
                select: {
                    assets: true,
                    bookings: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })
}

/**
 * Admin: ดึง bookings ทั้งหมด (with pagination)
 */
export async function getAdminBookings(page = 1, limit = 20) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return { bookings: [], total: 0 }

    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            include: {
                renter: { select: { name: true, phone: true } },
                asset: {
                    select: {
                        assetCode: true,
                        owner: { select: { name: true } },
                        product: { select: { titleLo: true, titleEn: true, images: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.booking.count(),
    ])

    return { bookings, total }
}

/**
 * Admin: ดึง transactions ทั้งหมด (revenue log)
 */
export async function getAdminTransactions(page = 1, limit = 20) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return { transactions: [], total: 0 }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            include: {
                booking: {
                    select: {
                        id: true,
                        renter: { select: { name: true } },
                        asset: { select: { assetCode: true, owner: { select: { name: true } } } },
                    },
                },
                destWallet: { select: { user: { select: { name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.transaction.count(),
    ])

    return { transactions, total }
}
