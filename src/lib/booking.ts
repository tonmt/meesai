/**
 * MeeSai Booking — Availability Check + Create
 *
 * Pillar 1: Concurrency Control
 * - prisma.$transaction() สำหรับ availability check + insert + FSM transition
 * - bufferEnd = returnDate + BUFFER_DAYS (from SystemConfig)
 * - @@index([assetId, pickupDate, bufferEnd]) สำหรับ fast query
 */

import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import type { Prisma } from '@prisma/client'

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

// ─── System Config Helpers ───

async function getBufferDays(): Promise<number> {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'BUFFER_DAYS' } })
    return config ? parseInt(config.value, 10) : 3
}

async function getServiceFeePercent(): Promise<number> {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'SERVICE_FEE_PERCENT' } })
    return config ? parseInt(config.value, 10) : 15
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
    const bufferDays = await getBufferDays()
    const bufferEnd = addDays(returnDate, bufferDays)

    const conflicts = await prisma.booking.count({
        where: {
            assetId,
            status: { in: ['PENDING', 'CONFIRMED', 'PICKED_UP'] },
            OR: [
                { pickupDate: { lte: bufferEnd }, bufferEnd: { gte: pickupDate } },
            ],
        },
    })

    return { available: conflicts === 0, conflictCount: conflicts }
}

/**
 * Create a booking with full concurrency control.
 * FSM transition is INSIDE $transaction to prevent race conditions.
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

    const bufferDays = await getBufferDays()
    const servicePercent = await getServiceFeePercent()
    const bufferEnd = addDays(returnDate, bufferDays)
    const serviceFee = Math.round(rentalFee * servicePercent / 100)
    const qrCode = `MSB-${nanoid(10)}`

    try {
        const result = await prisma.$transaction(async (tx) => {
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

            // 4. FSM Transition: AVAILABLE → RESERVED (INSIDE $transaction!)
            await tx.itemAsset.update({
                where: { id: assetId },
                data: { status: 'RESERVED' },
            })

            // 5. Audit log (Pillar 5)
            await tx.statusTransition.create({
                data: {
                    assetId,
                    fromState: 'AVAILABLE',
                    toState: 'RESERVED',
                    changedById: renterId,
                    reason: `Booking ${newBooking.id}`,
                },
            })

            return newBooking
        })

        return {
            success: true,
            bookingId: result.id,
            qrCode,
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່'
        return { success: false, error: message }
    }
}

/**
 * Cancel a booking and release the asset.
 * Authorization: only the renter who made the booking (or ADMIN) can cancel.
 */
export async function cancelBooking(
    bookingId: string,
    cancelledById: string,
    cancelledByRole: string,
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

        // Authorization Check (MUST #2)
        if (booking.renterId !== cancelledById && cancelledByRole !== 'ADMIN') {
            return { success: false, error: 'ທ່ານບໍ່ມີສິດຍົກເລີກການຈອງນີ້' }
        }

        if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
            return { success: false, error: 'ບໍ່ສາມາດຍົກເລີກການຈອງນີ້ໄດ້' }
        }

        // Cancel booking + release asset in $transaction
        await prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' },
            })

            // Get current asset status
            const asset = await tx.itemAsset.findUnique({
                where: { id: booking.assetId },
                select: { status: true },
            })

            if (asset && asset.status === 'RESERVED') {
                await tx.itemAsset.update({
                    where: { id: booking.assetId },
                    data: { status: 'AVAILABLE' },
                })

                await tx.statusTransition.create({
                    data: {
                        assetId: booking.assetId,
                        fromState: 'RESERVED',
                        toState: 'AVAILABLE',
                        changedById: cancelledById,
                        reason: reason || `Cancelled booking ${bookingId}`,
                    },
                })
            }
        })

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
 * Get system config value
 */
export async function getSystemConfig(key: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({ where: { key } })
    return config?.value ?? null
}
