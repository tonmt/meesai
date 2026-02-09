'use server'

import { prisma } from '@/lib/prisma'

type BrowseFilters = {
    categoryId?: string
    size?: string
    minPrice?: number
    maxPrice?: number
    search?: string
}

/**
 * Server Action: ดึง products สำหรับ browse page (with pagination + filters)
 */
export async function browseProducts(
    page = 1,
    limit = 12,
    filters?: BrowseFilters
) {
    const where: Record<string, unknown> = {}

    if (filters?.categoryId) {
        where.categoryId = filters.categoryId
    }
    if (filters?.size) {
        where.size = filters.size
    }
    if (filters?.search) {
        where.OR = [
            { titleLo: { contains: filters.search, mode: 'insensitive' } },
            { titleEn: { contains: filters.search, mode: 'insensitive' } },
        ]
    }
    if (filters?.minPrice || filters?.maxPrice) {
        where.rentalPrice = {}
        if (filters.minPrice) (where.rentalPrice as Record<string, number>).gte = filters.minPrice
        if (filters.maxPrice) (where.rentalPrice as Record<string, number>).lte = filters.maxPrice
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: { select: { nameLo: true, nameEn: true } },
                _count: { select: { assets: { where: { status: 'AVAILABLE' } } } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    return {
        products,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    }
}

/**
 * Server Action: ดึง categories ทั้งหมด
 */
export async function getCategories() {
    return prisma.category.findMany({
        orderBy: { nameLo: 'asc' },
        include: {
            _count: { select: { products: true } },
        },
    })
}

/**
 * Server Action: ดึง sizes ทั้งหมดที่มี
 */
export async function getAvailableSizes() {
    const sizes = await prisma.product.findMany({
        where: {},
        select: { size: true },
        distinct: ['size'],
        orderBy: { size: 'asc' },
    })
    return sizes.map(s => s.size)
}

/**
 * Server Action: ดึง product detail + bookings calendar data
 */
export async function getProductFullDetail(productId: string) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            category: true,
            assets: {
                select: {
                    id: true,
                    assetCode: true,
                    grade: true,
                    condition: true,
                    status: true,
                    bookings: {
                        where: {
                            status: { in: ['PENDING', 'CONFIRMED', 'PICKED_UP'] },
                            returnDate: { gte: new Date() },
                        },
                        select: {
                            pickupDate: true,
                            returnDate: true,
                            bufferEnd: true,
                            status: true,
                        },
                        orderBy: { pickupDate: 'asc' },
                    },
                },
            },
        },
    })

    return product
}
