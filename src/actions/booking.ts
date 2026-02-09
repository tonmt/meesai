'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import { createBooking, cancelBooking, checkAvailability, getSystemConfig } from '@/lib/booking'
import { prisma } from '@/lib/prisma'

// ─── Zod Schemas ───
const BookingSchema = z.object({
    assetId: z.string().min(1, 'ກະລຸນາເລືອກຊຸດ'),
    eventDate: z.string().transform(v => new Date(v)),
    pickupDate: z.string().transform(v => new Date(v)),
    returnDate: z.string().transform(v => new Date(v)),
    notes: z.string().optional(),
})

type BookingActionResult = {
    success: boolean
    error?: string
    bookingId?: string
    qrCode?: string
}

/**
 * Server Action: สร้าง booking ใหม่
 */
export async function createBookingAction(formData: FormData): Promise<BookingActionResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' }
    }

    const raw = {
        assetId: formData.get('assetId') as string,
        eventDate: formData.get('eventDate') as string,
        pickupDate: formData.get('pickupDate') as string,
        returnDate: formData.get('returnDate') as string,
        notes: formData.get('notes') as string || undefined,
    }

    const parsed = BookingSchema.safeParse(raw)
    if (!parsed.success) {
        return { success: false, error: parsed.error.issues[0].message }
    }

    const { assetId, eventDate, pickupDate, returnDate, notes } = parsed.data

    const asset = await prisma.itemAsset.findUnique({
        where: { id: assetId },
        include: { product: { select: { rentalPrice: true } } },
    })

    if (!asset) {
        return { success: false, error: 'ບໍ່ພົບຊຸດນີ້' }
    }

    const result = await createBooking({
        assetId,
        renterId: session.user.id,
        eventDate,
        pickupDate,
        returnDate,
        rentalFee: asset.product.rentalPrice,
        deposit: Math.round(asset.product.rentalPrice * 0.3),
        notes,
    })

    return result
}

/**
 * Server Action: ยกเลิก booking (with ownership check)
 */
export async function cancelBookingAction(bookingId: string): Promise<BookingActionResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' }
    }

    // Pass user role for authorization check in cancelBooking
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    })

    return cancelBooking(bookingId, session.user.id, user?.role || 'RENTER', 'User cancelled')
}

/**
 * Server Action: ตรวจ availability
 */
export async function checkAvailabilityAction(
    assetId: string,
    pickupDate: string,
    returnDate: string
): Promise<{ available: boolean; conflictCount: number }> {
    return checkAvailability(assetId, new Date(pickupDate), new Date(returnDate))
}

/**
 * Server Action: ดึง booking ของ user ปัจจุบัน
 */
export async function getMyBookings() {
    const session = await auth()
    if (!session?.user?.id) return []

    return prisma.booking.findMany({
        where: { renterId: session.user.id },
        include: {
            asset: {
                include: {
                    product: {
                        select: { titleLo: true, titleEn: true, images: true, size: true, color: true },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })
}

/**
 * Server Action: ดึง product detail + assets available
 */
export async function getProductDetail(productId: string) {
    return prisma.product.findUnique({
        where: { id: productId },
        include: {
            category: true,
            assets: {
                where: { status: 'AVAILABLE' },
                select: { id: true, assetCode: true, grade: true, condition: true },
            },
        },
    })
}

/**
 * Server Action: ดึง service fee percent จาก SystemConfig
 */
export async function getServiceFeePercent(): Promise<number> {
    const val = await getSystemConfig('SERVICE_FEE_PERCENT')
    return val ? parseInt(val, 10) : 15
}
