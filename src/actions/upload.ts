'use server'

import { auth } from '@/lib/auth'
import { uploadFile, generateProductImageKey, deleteFile, getPublicUrl } from '@/lib/minio'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const uploadSchema = z.object({
    productId: z.string().min(1, 'Product ID required'),
})

/**
 * Server Action: Upload product image to MinIO
 * Saves image URL to product.images array
 */
export async function uploadProductImage(formData: FormData) {
    const session = await auth()
    if (!session?.user) {
        return { error: 'Unauthorized' }
    }
    if (!['ADMIN', 'OWNER'].includes(session.user.role)) {
        return { error: 'Forbidden' }
    }

    const productId = formData.get('productId') as string
    const file = formData.get('file') as File

    // Validate input
    const validation = uploadSchema.safeParse({ productId })
    if (!validation.success) {
        return { error: validation.error.issues[0].message }
    }

    if (!file || !(file instanceof File)) {
        return { error: 'No file provided' }
    }

    if (file.size > MAX_FILE_SIZE) {
        return { error: 'File too large (max 5MB)' }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return { error: 'Invalid file type. Use JPEG, PNG, or WebP' }
    }

    try {
        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, images: true },
        })
        if (!product) {
            return { error: 'Product not found' }
        }

        // Read file buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to MinIO
        const key = generateProductImageKey(productId, file.name)
        await uploadFile(buffer, key, file.type)

        // Get public URL
        const imageUrl = getPublicUrl(key)

        // Update product images array
        await prisma.product.update({
            where: { id: productId },
            data: {
                images: [...product.images, imageUrl],
            },
        })

        return { success: true, url: imageUrl }
    } catch (error) {
        console.error('Upload error:', error)
        return { error: 'Upload failed. Please try again.' }
    }
}

/**
 * Server Action: Remove a product image
 */
export async function removeProductImage(productId: string, imageUrl: string) {
    const session = await auth()
    if (!session?.user) {
        return { error: 'Unauthorized' }
    }
    if (!['ADMIN', 'OWNER'].includes(session.user.role)) {
        return { error: 'Forbidden' }
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { images: true },
        })
        if (!product) {
            return { error: 'Product not found' }
        }

        // Extract key from URL
        const key = decodeURIComponent(imageUrl.replace('/api/images/', ''))

        // Delete from MinIO
        try {
            await deleteFile(key)
        } catch {
            // File may not exist in MinIO, continue to remove from DB
        }

        // Remove from product images
        const updatedImages = product.images.filter(img => img !== imageUrl)
        await prisma.product.update({
            where: { id: productId },
            data: { images: updatedImages },
        })

        return { success: true }
    } catch (error) {
        console.error('Remove image error:', error)
        return { error: 'Failed to remove image' }
    }
}
