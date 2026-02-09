'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Shield, CheckCircle2, Loader2, QrCode, CalendarDays, AlertCircle } from 'lucide-react'
import { confirmPaymentAction } from '@/actions/payment'

type BookingData = {
    id: string
    eventDate: Date
    pickupDate: Date
    returnDate: Date
    rentalFee: number
    serviceFee: number
    deposit: number
    status: string
    qrCode: string | null
    qrDataUrl: string | null
    asset: {
        assetCode: string
        product: {
            titleLo: string
            titleEn: string | null
            images: string[]
            size: string
            color: string | null
        }
    }
    transactions: { id: string; type: string; amount: number; createdAt: Date }[]
}

type Props = {
    booking: BookingData
    locale: string
}

function formatDate(date: Date, locale: string): string {
    return new Date(date).toLocaleDateString(locale === 'lo' ? 'lo-LA' : 'en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('lo-LA').format(price)
}

export default function PaymentConfirm({ booking, locale }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [confirmed, setConfirmed] = useState(booking.status !== 'PENDING')
    const total = booking.rentalFee + booking.serviceFee + booking.deposit

    async function handleConfirmPayment() {
        setLoading(true)
        setError('')
        try {
            const result = await confirmPaymentAction(booking.id)
            if (result.success) {
                setConfirmed(true)
            } else {
                setError(result.error || 'ເກີດຂໍ້ຜິດພາດ')
            }
        } catch {
            setError(locale === 'lo' ? 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່' : 'Payment failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Product Card */}
            <div className="glass rounded-2xl overflow-hidden border border-white/60">
                <div className="flex">
                    <div className="w-28 h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                        {booking.asset.product.images.length > 0 ? (
                            <img src={booking.asset.product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <CreditCard className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                    <div className="p-4 flex-1">
                        <h2 className="font-bold text-royal-navy text-lg">
                            {locale === 'lo' ? booking.asset.product.titleLo : (booking.asset.product.titleEn || booking.asset.product.titleLo)}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">{booking.asset.assetCode}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-royal-navy/10 text-royal-navy text-xs rounded-full">{booking.asset.product.size}</span>
                            {booking.asset.product.color && (
                                <span className="px-2 py-0.5 bg-champagne-gold/10 text-champagne-gold text-xs rounded-full">{booking.asset.product.color}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-navy-600">
                            <CalendarDays className="w-3.5 h-3.5 text-champagne-gold" />
                            {formatDate(booking.pickupDate, locale)} → {formatDate(booking.returnDate, locale)}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code */}
            {booking.qrDataUrl && (
                <div className="glass rounded-2xl p-6 border border-white/60 text-center">
                    <h3 className="text-sm font-medium text-navy-600 mb-3 flex items-center justify-center gap-1.5">
                        <QrCode className="w-4 h-4 text-champagne-gold" />
                        {locale === 'lo' ? 'QR Code ສຳລັບຮັບຊຸດ' : 'QR Code for Pickup'}
                    </h3>
                    <img
                        src={booking.qrDataUrl}
                        alt="Booking QR Code"
                        className="w-48 h-48 mx-auto rounded-xl shadow-lg"
                    />
                    <p className="text-xs text-gray-400 mt-2 font-mono">{booking.qrCode}</p>
                </div>
            )}

            {/* Price Breakdown */}
            <div className="glass rounded-2xl p-6 border border-white/60">
                <h3 className="text-sm font-medium text-royal-navy mb-4 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-champagne-gold" />
                    {locale === 'lo' ? 'ລາຍລະອຽດຄ່າໃຊ້ຈ່າຍ' : 'Payment Details'}
                </h3>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-navy-600">{locale === 'lo' ? 'ຄ່າເຊົ່າ' : 'Rental Fee'}</span>
                        <span className="font-medium text-royal-navy">{formatPrice(booking.rentalFee)} ₭</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-navy-600">{locale === 'lo' ? 'ຄ່າບໍລິການ' : 'Service Fee'}</span>
                        <span className="text-royal-navy">{formatPrice(booking.serviceFee)} ₭</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-navy-600 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {locale === 'lo' ? 'ມັດຈຳ (ຄືນໄດ້)' : 'Deposit (refundable)'}
                        </span>
                        <span className="text-royal-navy">{formatPrice(booking.deposit)} ₭</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold">
                        <span className="text-royal-navy">{locale === 'lo' ? 'ລວມທັງໝົດ' : 'Total'}</span>
                        <span className="text-danger">{formatPrice(total)} ₭</span>
                    </div>
                </div>
            </div>

            {/* Payment Status */}
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {confirmed ? (
                <div className="glass rounded-2xl p-6 border border-emerald/20 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-royal-navy mb-1">
                        {locale === 'lo' ? 'ຊຳລະສຳເລັດ!' : 'Payment Confirmed!'}
                    </h3>
                    <p className="text-sm text-navy-600 mb-4">
                        {locale === 'lo' ? 'ກະລຸນາມາຮັບຊຸດຕາມວັນທີ່ນັດ' : 'Please pick up your item on the scheduled date'}
                    </p>

                    {/* Transaction Log */}
                    {booking.transactions.length > 0 && (
                        <div className="bg-white/50 rounded-xl p-4 mt-4 text-left">
                            <h4 className="text-xs font-medium text-gray-400 mb-2">
                                {locale === 'lo' ? 'ລາຍການທຸລະກຳ' : 'Transaction Log'}
                            </h4>
                            {booking.transactions.map(tx => (
                                <div key={tx.id} className="flex justify-between text-xs text-navy-600 py-1 border-b border-gray-100 last:border-0">
                                    <span>{tx.type.replace(/_/g, ' ')}</span>
                                    <span className="font-mono">{formatPrice(tx.amount)} ₭</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => router.push(`/${locale}/bookings`)}
                            className="flex-1 py-3 bg-champagne-gold text-royal-navy font-bold rounded-xl hover:bg-champagne-gold/90 transition-all"
                        >
                            {locale === 'lo' ? 'ເບິ່ງລາຍການຈອງ' : 'View Bookings'}
                        </button>
                        <button
                            onClick={() => router.push(`/${locale}`)}
                            className="flex-1 py-3 bg-white border border-gray-200 text-navy-600 font-medium rounded-xl hover:border-champagne-gold transition-all"
                        >
                            {locale === 'lo' ? 'ກັບໜ້າຫຼັກ' : 'Home'}
                        </button>
                    </div>
                </div>
            ) : (
                /* Confirm Payment Button */
                <div className="space-y-3">
                    <div className="glass rounded-2xl p-4 border border-champagne-gold/20">
                        <p className="text-sm text-navy-600 text-center">
                            {locale === 'lo'
                                ? 'ກົດ "ຢືນຢັນຊຳລະ" ເພື່ອບັນທຶກການຈ່າຍເງິນ ແລະ lock ຊຸດ'
                                : 'Click "Confirm Payment" to record payment and lock the item'
                            }
                        </p>
                    </div>

                    <button
                        onClick={handleConfirmPayment}
                        disabled={loading}
                        className="w-full py-4 bg-champagne-gold text-royal-navy font-bold rounded-xl text-lg flex items-center justify-center gap-2 shadow-xl shadow-champagne-gold/20 hover:bg-champagne-gold/90 transition-all disabled:opacity-60"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {locale === 'lo' ? 'ຢືນຢັນຊຳລະ' : 'Confirm Payment'}
                    </button>

                    <p className="text-xs text-center text-navy-600/60">
                        <Shield className="w-3 h-3 inline mr-1" />
                        {locale === 'lo'
                            ? 'ການຊຳລະຈະຖືກບັນທຶກໃນລະບົບ Ledger ແບບ Append-only'
                            : 'Payment recorded as append-only ledger transaction'
                        }
                    </p>
                </div>
            )}
        </div>
    )
}
