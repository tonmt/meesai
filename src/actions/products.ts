'use server'

import { prisma } from '@/lib/prisma'

export type FeedProduct = {
    id: string
    titleLo: string
    titleEn: string | null
    images: string[]
    rentalPrice: number
    buyPrice: number | null
    size: string
    color: string | null
    brand: string | null
    category: {
        nameLo: string
        nameEn: string
        slug: string
    }
    availableCount: number
}

export async function getFeedProducts(categorySlug?: string): Promise<FeedProduct[]> {
    const where = categorySlug ? { category: { slug: categorySlug } } : {}

    const products = await prisma.product.findMany({
        where,
        include: {
            category: { select: { nameLo: true, nameEn: true, slug: true } },
            assets: {
                where: { status: 'AVAILABLE' },
                select: { id: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })

    return products.map((p) => ({
        id: p.id,
        titleLo: p.titleLo,
        titleEn: p.titleEn,
        images: p.images,
        rentalPrice: p.rentalPrice,
        buyPrice: p.buyPrice,
        size: p.size,
        color: p.color,
        brand: p.brand,
        category: p.category,
        availableCount: p.assets.length,
    }))
}

export async function getCategories() {
    return prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
            id: true,
            nameLo: true,
            nameEn: true,
            icon: true,
            slug: true,
        },
    })
}
