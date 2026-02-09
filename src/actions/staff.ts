'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

/**
 * Staff: Lookup asset by barcode/assetCode
 */
export async function lookupAssetByCode(code: string) {
    const session = await auth()
    if (!session?.user?.id || !['STAFF', 'ADMIN'].includes(session.user.role)) return null

    const asset = await prisma.itemAsset.findFirst({
        where: {
            OR: [
                { assetCode: { equals: code, mode: 'insensitive' } },
                { barcode: code },
            ],
        },
        include: {
            product: {
                select: { titleLo: true, titleEn: true, images: true, size: true },
            },
            owner: { select: { name: true } },
            bookings: {
                where: {
                    status: { in: ['CONFIRMED', 'PICKED_UP'] },
                },
                include: {
                    renter: { select: { name: true, phone: true } },
                },
                orderBy: { pickupDate: 'asc' },
                take: 1,
            },
        },
    })

    return asset
}

/**
 * Staff: Check-out (ส่งมอบชุดให้ลูกค้า)
 * Booking: CONFIRMED → PICKED_UP
 * Asset: AVAILABLE → RESERVED → PICKED_UP (via inline transition)
 */
export async function staffCheckOutAction(
    bookingId: string,
    assetId: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user?.id || !['STAFF', 'ADMIN'].includes(session.user.role)) {
        return { success: false, error: 'ບໍ່ມີສິດ' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Validate booking
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
            })

            if (!booking || booking.assetId !== assetId) {
                throw new Error('ບໍ່ພົບການຈອງ')
            }
            if (booking.status !== 'CONFIRMED') {
                throw new Error(`ສະຖານະບໍ່ຖືກຕ້ອງ: ${booking.status}`)
            }

            // 2. Update booking → PICKED_UP
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'PICKED_UP' },
            })

            // 3. Get asset and transition to PICKED_UP
            const asset = await tx.itemAsset.findUnique({
                where: { id: assetId },
                select: { status: true },
            })

            if (!asset) throw new Error('ບໍ່ພົບຊຸດ')

            await tx.itemAsset.update({
                where: { id: assetId },
                data: { status: 'PICKED_UP' },
            })

            // 4. Log status transition (Pillar 2: FSM Audit)
            await tx.statusTransition.create({
                data: {
                    assetId,
                    fromState: asset.status,
                    toState: 'PICKED_UP',
                    changedById: session.user!.id,
                    reason: 'Staff check-out',
                },
            })

            // 5. Evidence log (Pillar 5: Audit Trail)
            await tx.evidenceLog.create({
                data: {
                    type: 'CHECK_OUT',
                    notes: notes || `ส่งมอบโดย ${session.user!.name}`,
                    assetId,
                    bookingId,
                    recordedById: session.user!.id,
                },
            })
        })

        return { success: true }
    } catch (error) {
        console.error('Check-out error:', error)
        return { success: false, error: error instanceof Error ? error.message : 'ເກີດຂໍ້ຜິດພາດ' }
    }
}

/**
 * Staff: Check-in (รับคืนชุดจากลูกค้า)
 * Booking: PICKED_UP → RETURNED (→ COMPLETED if GOOD)
 * Asset: PICKED_UP → RETURNED → MAINTENANCE/AVAILABLE
 */
export async function staffCheckInAction(
    bookingId: string,
    assetId: string,
    condition: 'GOOD' | 'DAMAGED',
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user?.id || !['STAFF', 'ADMIN'].includes(session.user.role)) {
        return { success: false, error: 'ບໍ່ມີສິດ' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Validate booking
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                select: { id: true, status: true, assetId: true, deposit: true },
            })

            if (!booking || booking.assetId !== assetId) {
                throw new Error('ບໍ່ພົບການຈອງ')
            }
            if (booking.status !== 'PICKED_UP') {
                throw new Error(`ສະຖານະບໍ່ຖືກຕ້ອງ: ${booking.status}`)
            }

            // 2. Update booking → RETURNED
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'RETURNED' },
            })

            // 3. Get asset current state
            const asset = await tx.itemAsset.findUnique({
                where: { id: assetId },
                select: { status: true },
            })
            if (!asset) throw new Error('ບໍ່ພົບຊຸດ')

            // 4. Transition asset → RETURNED first
            await tx.itemAsset.update({ where: { id: assetId }, data: { status: 'RETURNED' } })
            await tx.statusTransition.create({
                data: {
                    assetId,
                    fromState: asset.status,
                    toState: 'RETURNED',
                    changedById: session.user!.id,
                    reason: `Check-in: ${condition}`,
                },
            })

            // 5. Evidence log
            await tx.evidenceLog.create({
                data: {
                    type: 'CHECK_IN',
                    notes: notes || `รับคืนโดย ${session.user!.name} - สภาพ: ${condition}`,
                    assetId,
                    bookingId,
                    recordedById: session.user!.id,
                },
            })

            // 6a. GOOD → Complete booking + refund deposit + asset → AVAILABLE
            if (condition === 'GOOD') {
                await tx.booking.update({
                    where: { id: bookingId },
                    data: { status: 'COMPLETED' },
                })

                // Asset: RETURNED → AVAILABLE (skip QC for GOOD)
                await tx.itemAsset.update({ where: { id: assetId }, data: { status: 'AVAILABLE' } })
                await tx.statusTransition.create({
                    data: {
                        assetId,
                        fromState: 'RETURNED',
                        toState: 'AVAILABLE',
                        changedById: session.user!.id,
                        reason: 'QC passed (GOOD condition)',
                    },
                })

                // Refund deposit
                if (booking.deposit > 0) {
                    await tx.transaction.create({
                        data: {
                            amount: booking.deposit,
                            type: 'DEPOSIT_REFUND',
                            bookingId,
                            note: `ຄືນມັດຈຳ Booking ${bookingId.slice(-6)}`,
                        },
                    })
                }

                // Increment rental count
                await tx.itemAsset.update({
                    where: { id: assetId },
                    data: { totalRentals: { increment: 1 } },
                })
            }

            // 6b. DAMAGED → Asset → MAINTENANCE + damage report
            if (condition === 'DAMAGED') {
                await tx.itemAsset.update({ where: { id: assetId }, data: { status: 'MAINTENANCE' } })
                await tx.statusTransition.create({
                    data: {
                        assetId,
                        fromState: 'RETURNED',
                        toState: 'MAINTENANCE',
                        changedById: session.user!.id,
                        reason: 'Damage reported during check-in',
                    },
                })
                await tx.evidenceLog.create({
                    data: {
                        type: 'DAMAGE_REPORT',
                        notes: notes || 'รายงานความเสียหาย',
                        assetId,
                        bookingId,
                        recordedById: session.user!.id,
                    },
                })
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Check-in error:', error)
        return { success: false, error: error instanceof Error ? error.message : 'ເກີດຂໍ້ຜິດພາດ' }
    }
}

/**
 * Staff: Get today's scheduled bookings for check-in/out
 */
export async function getStaffTodayBookings() {
    const session = await auth()
    if (!session?.user?.id || !['STAFF', 'ADMIN'].includes(session.user.role)) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return prisma.booking.findMany({
        where: {
            OR: [
                // Due for check-out today (pick up)
                {
                    status: 'CONFIRMED',
                    pickupDate: { gte: today, lt: tomorrow },
                },
                // Due for check-in today (return)
                {
                    status: 'PICKED_UP',
                    returnDate: { gte: today, lt: tomorrow },
                },
                // Currently active (picked up, not returned yet)
                {
                    status: 'PICKED_UP',
                },
            ],
        },
        include: {
            renter: { select: { name: true, phone: true } },
            asset: {
                select: {
                    assetCode: true,
                    barcode: true,
                    product: { select: { titleLo: true, titleEn: true, images: true, size: true } },
                },
            },
        },
        orderBy: { pickupDate: 'asc' },
    })
}
