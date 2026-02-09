/**
 * MeeSai Booking — Availability Check + Create
 *
 * Pillar 1: Concurrency Control
 * - prisma.$transaction() สำหรับ availability check + insert
 * - bufferEnd = returnDate + BUFFER_DAYS
 * - @@index([assetId, pickupDate, bufferEnd]) สำหรับ fast query
 */

import { prisma } from '@/lib/prisma'
import { transitionAssetStatus } from '@/lib/fsm'
import { nanoid } from 'nanoid'

const BUFFER_DAYS = 2  // วันพักชุด (ซักอบรีด) หลังคืน
const SERVICE_FEE_PERCENT = 10  // 10% ของค่าเช่า

export type BookingInput = {
    assetId: string
    renterId: string
    eventDate: Date
    pickupDate: Date
    returnDate: Date
    rentalFee: number
    deposit?: number
    notes?: string
}

export type BookingResult = {
    success: boolean
    error?: string
    bookingId?: string
    qrCode?: string
}

/**
 * Check if an asset is available for a given date range.
 * Considers buffer time between bookings.
 */
export async function checkAvailability(
    assetId: string,
    pickupDate: Date,
    returnDate: Date
): Promise<{ available: boolean; conflictCount: number }> {
    const bufferEnd = addDays(returnDate, BUFFER_DAYS)

    // ค้นหา booking ที่ overlap กับช่วงที่ต้องการ
    const conflicts = await prisma.booking.count({
        where: {
            assetId,
            status: { in: ['PENDING', 'CONFIRMED', 'PICKED_UP'] },
            OR: [
                // Case 1: booking เดิมเริ่มก่อนและจบหลังเราเริ่ม
                { pickupDate: { lte: bufferEnd }, bufferEnd: { gte: pickupDate } },
            ],
        },
    })

    return { available: conflicts === 0, conflictCount: conflicts }
}

/**
 * Create a booking with full concurrency control.
 * Uses $transaction to prevent double booking.
 */
export async function createBooking(input: BookingInput): Promise<BookingResult> {
    const { assetId, renterId, eventDate, pickupDate, returnDate, rentalFee, deposit = 0, notes } = input

    // Validate dates
    if (pickupDate >= returnDate) {
        return { success: false, error: 'ວັນຮັບຊຸດຕ້ອງກ່ອນວັນສົ່ງຄືນ' }
    }
    if (pickupDate < new Date()) {
        return { success: false, error: 'ບໍ່ສາມາດຈອງໃນອະດີດໄດ້' }
    }

    const bufferEnd = addDays(returnDate, BUFFER_DAYS)
    const serviceFee = Math.round(rentalFee * SERVICE_FEE_PERCENT / 100)
    const qrCode = `MSB-${nanoid(10)}`

    try {
        const booking = await prisma.$transaction(async (tx) => {
            // 1. Check asset exists and is AVAILABLE
            const asset = await tx.itemAsset.findUnique({
                where: { id: assetId },
                select: { id: true, status: true, ownerId: true },
            })

            if (!asset) {
                throw new Error('ບໍ່ພົບຊຸດນີ້ໃນລະບົບ')
            }
            if (asset.status !== 'AVAILABLE') {
                throw new Error('ຊຸດນີ້ບໍ່ພ້ອມໃຫ້ເຊົ່າ')
            }

            // 2. Double booking check (within transaction)
            const conflicts = await tx.booking.count({
                where: {
                    assetId,
                    status: { in: ['PENDING', 'CONFIRMED', 'PICKED_UP'] },
                    pickupDate: { lte: bufferEnd },
                    bufferEnd: { gte: pickupDate },
                },
            })

            if (conflicts > 0) {
                throw new Error('ຊຸດນີ້ຖືກຈອງແລ້ວໃນຊ່ວງເວລານີ້')
            }

            // 3. Create booking
            const newBooking = await tx.booking.create({
                data: {
                    eventDate,
                    pickupDate,
                    returnDate,
                    bufferEnd,
                    rentalFee,
                    serviceFee,
                    deposit,
                    qrCode,
                    notes,
                    renterId,
                    assetId,
                    status: 'PENDING',
                },
            })

            return newBooking
        })

        // 4. Transition asset → RESERVED (outside main transaction for FSM audit)
        await transitionAssetStatus(assetId, 'RESERVED', renterId, `Booking ${booking.id}`)

        return {
            success: true,
            bookingId: booking.id,
            qrCode,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່'
        return { success: false, error: message }
    }
}

/**
 * Cancel a booking and release the asset.
 */
export async function cancelBooking(
    bookingId: string,
    cancelledById: string,
    reason?: string
): Promise<BookingResult> {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { id: true, status: true, assetId: true, renterId: true },
        })

        if (!booking) {
            return { success: false, error: 'ບໍ່ພົບການຈອງ' }
        }

        if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
            return { success: false, error: 'ບໍ່ສາມາດຍົກເລີກການຈອງນີ້ໄດ້' }
        }

        // Update booking status
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CANCELLED' },
        })

        // Release asset → AVAILABLE
        await transitionAssetStatus(booking.assetId, 'AVAILABLE', cancelledById, reason || `Cancelled booking ${bookingId}`)

        return { success: true, bookingId }
    } catch (error) {
        console.error('Cancel booking error:', error)
        return { success: false, error: 'ເກີດຂໍ້ຜິດພາດ' }
    }
}

// ─── Helpers ───

function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

/**
 * Get system config value (e.g., BUFFER_DAYS, SERVICE_FEE_PERCENT)
 */
export async function getSystemConfig(key: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({ where: { key } })
    return config?.value ?? null
}
