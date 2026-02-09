'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { recordBookingPayment, getWalletBalance, getBookingTransactions } from '@/lib/ledger'
import { generateQRCodeDataURL } from '@/lib/qrcode'

/**
 * Server Action: ยืนยันการชำระเงิน (PENDING → CONFIRMED)
 * Creates 3 ledger transactions atomically
 */
export async function confirmPaymentAction(bookingId: string): Promise<{
    success: boolean
    error?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' }
    }

    try {
        // Validate booking ownership + status
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { id: true, status: true, renterId: true },
        })

        if (!booking) {
            return { success: false, error: 'ບໍ່ພົບການຈອງ' }
        }
        if (booking.renterId !== session.user.id) {
            return { success: false, error: 'ທ່ານບໍ່ມີສິດຊຳລະການຈອງນີ້' }
        }
        if (booking.status !== 'PENDING') {
            return { success: false, error: 'ການຈອງນີ້ຊຳລະແລ້ວ ຫຼື ຖືກຍົກເລີກ' }
        }

        // Record payment + update booking status in $transaction
        await prisma.$transaction(async (tx) => {
            // 1. Record 3 ledger transactions
            const paymentResult = await recordBookingPayment(bookingId, tx)
            if (!paymentResult.success) {
                throw new Error(paymentResult.error)
            }

            // 2. Update booking status → CONFIRMED
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'CONFIRMED' },
            })
        })

        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'ເກີດຂໍ້ຜິດພາດ'
        return { success: false, error: message }
    }
}

/**
 * Server Action: ดึง booking detail สำหรับ payment page
 */
export async function getBookingForPayment(bookingId: string) {
    const session = await auth()
    if (!session?.user?.id) return null

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            asset: {
                include: {
                    product: {
                        select: { titleLo: true, titleEn: true, images: true, size: true, color: true },
                    },
                },
            },
        },
    })

    if (!booking || booking.renterId !== session.user.id) return null

    // Generate QR code image
    const qrDataUrl = booking.qrCode
        ? await generateQRCodeDataURL(booking.qrCode)
        : null

    // Get transactions if already paid
    const transactions = await getBookingTransactions(bookingId)

    return {
        ...booking,
        qrDataUrl,
        transactions,
    }
}

/**
 * Server Action: ดึงยอดเงินใน wallet
 */
export async function getMyWalletBalance(): Promise<number> {
    const session = await auth()
    if (!session?.user?.id) return 0

    const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
    })

    if (!wallet) return 0

    return getWalletBalance(wallet.id)
}
