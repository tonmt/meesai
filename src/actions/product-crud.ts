'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// ─── Schemas ───────────────────────────────────────────────
const createProductSchema = z.object({
    titleLo: z.string().min(2, 'ชื่อลาว 2+ ตัวอักษร'),
    titleEn: z.string().optional(),
    description: z.string().optional(),
    rentalPrice: z.number().int().min(1000, 'ราคาเช่า ≥ 1,000₭'),
    buyPrice: z.number().int().optional(),
    size: z.string().min(1, 'ระบุไซส์'),
    color: z.string().optional(),
    brand: z.string().optional(),
    categoryId: z.string().min(1, 'เลือกหมวดหมู่'),
})

const updateProductSchema = createProductSchema.partial().extend({
    id: z.string().min(1),
})

// ─── List Products ─────────────────────────────────────────
export async function getAdminProducts(page = 1, limit = 20, search?: string) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') return { products: [], total: 0, totalPages: 0 }

    const where = search ? {
        OR: [
            { titleLo: { contains: search, mode: 'insensitive' as const } },
            { titleEn: { contains: search, mode: 'insensitive' as const } },
        ],
    } : {}

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: { select: { id: true, nameLo: true, nameEn: true } },
                _count: { select: { assets: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ])

    return { products, total, totalPages: Math.ceil(total / limit) }
}

// ─── Create Product ────────────────────────────────────────
export async function createProduct(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    const raw = {
        titleLo: formData.get('titleLo') as string,
        titleEn: (formData.get('titleEn') as string) || undefined,
        description: (formData.get('description') as string) || undefined,
        rentalPrice: parseInt(formData.get('rentalPrice') as string, 10),
        buyPrice: formData.get('buyPrice') ? parseInt(formData.get('buyPrice') as string, 10) : undefined,
        size: formData.get('size') as string,
        color: (formData.get('color') as string) || undefined,
        brand: (formData.get('brand') as string) || undefined,
        categoryId: formData.get('categoryId') as string,
    }

    const validation = createProductSchema.safeParse(raw)
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    try {
        const product = await prisma.product.create({
            data: {
                titleLo: validation.data.titleLo,
                titleEn: validation.data.titleEn || null,
                description: validation.data.description || null,
                rentalPrice: validation.data.rentalPrice,
                buyPrice: validation.data.buyPrice || null,
                size: validation.data.size,
                color: validation.data.color || null,
                brand: validation.data.brand || null,
                categoryId: validation.data.categoryId,
                images: [],
            },
        })
        revalidatePath('/[locale]/admin')
        revalidatePath('/[locale]/browse')
        return { success: true, productId: product.id }
    } catch (error) {
        console.error('Create product error:', error)
        return { error: 'Failed to create product' }
    }
}

// ─── Update Product ────────────────────────────────────────
export async function updateProduct(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    const raw = {
        id: formData.get('id') as string,
        titleLo: (formData.get('titleLo') as string) || undefined,
        titleEn: (formData.get('titleEn') as string) || undefined,
        description: (formData.get('description') as string) || undefined,
        rentalPrice: formData.get('rentalPrice') ? parseInt(formData.get('rentalPrice') as string, 10) : undefined,
        buyPrice: formData.get('buyPrice') ? parseInt(formData.get('buyPrice') as string, 10) : undefined,
        size: (formData.get('size') as string) || undefined,
        color: (formData.get('color') as string) || undefined,
        brand: (formData.get('brand') as string) || undefined,
        categoryId: (formData.get('categoryId') as string) || undefined,
    }

    const validation = updateProductSchema.safeParse(raw)
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    try {
        // Build update data, excluding undefined fields
        const updateData: Record<string, unknown> = {}
        if (validation.data.titleLo !== undefined) updateData.titleLo = validation.data.titleLo
        if (validation.data.titleEn !== undefined) updateData.titleEn = validation.data.titleEn || null
        if (validation.data.description !== undefined) updateData.description = validation.data.description || null
        if (validation.data.rentalPrice !== undefined) updateData.rentalPrice = validation.data.rentalPrice
        if (validation.data.buyPrice !== undefined) updateData.buyPrice = validation.data.buyPrice || null
        if (validation.data.size !== undefined) updateData.size = validation.data.size
        if (validation.data.color !== undefined) updateData.color = validation.data.color || null
        if (validation.data.brand !== undefined) updateData.brand = validation.data.brand || null
        if (validation.data.categoryId !== undefined) updateData.categoryId = validation.data.categoryId

        await prisma.product.update({
            where: { id: validation.data.id },
            data: updateData,
        })
        revalidatePath('/[locale]/admin')
        revalidatePath('/[locale]/browse')
        return { success: true }
    } catch (error) {
        console.error('Update product error:', error)
        return { error: 'Failed to update product' }
    }
}

// ─── Delete Product ────────────────────────────────────────
export async function deleteProduct(productId: string) {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return { error: 'Unauthorized' }
    }

    if (!productId) return { error: 'Product ID required' }

    try {
        // Check if product has active assets/bookings
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                _count: { select: { assets: true } },
            },
        })

        if (!product) return { error: 'Product not found' }

        if (product._count.assets > 0) {
            return { error: 'ບໍ່ສາມາດລຶບ — ສິນຄ້ານີ້ມີ assets ຢູ່ (Cannot delete — product has linked assets)' }
        }

        await prisma.product.delete({ where: { id: productId } })
        revalidatePath('/[locale]/admin')
        revalidatePath('/[locale]/browse')
        return { success: true }
    } catch (error) {
        console.error('Delete product error:', error)
        return { error: 'Failed to delete product' }
    }
}
