'use client'

import { CalendarDays, Package, Clock, CheckCircle2, XCircle, AlertTriangle, MapPin } from 'lucide-react'
import { cancelBookingAction } from '@/actions/booking'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Booking = {
    id: string
    eventDate: Date
    pickupDate: Date
    returnDate: Date
    rentalFee: number
    serviceFee: number
    deposit: number
    status: string
    qrCode: string | null
    createdAt: Date
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
}

type Props = {
    bookings: Booking[]
    locale: string
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock; label: { lo: string; en: string } }> = {
    PENDING: { color: 'text-amber-500 bg-amber-50 border-amber-200', icon: Clock, label: { lo: 'ລໍຖ້າຊຳລະ', en: 'Pending' } },
    CONFIRMED: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2, label: { lo: 'ຢືນຢັນແລ້ວ', en: 'Confirmed' } },
    PICKED_UP: { color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Package, label: { lo: 'ຮັບຊຸດແລ້ວ', en: 'Picked Up' } },
    RETURNED: { color: 'text-teal-600 bg-teal-50 border-teal-200', icon: MapPin, label: { lo: 'ສົ່ງຄືນແລ້ວ', en: 'Returned' } },
    COMPLETED: { color: 'text-emerald bg-emerald/10 border-emerald/20', icon: CheckCircle2, label: { lo: 'ສຳເລັດ', en: 'Completed' } },
    CANCELLED: { color: 'text-gray-400 bg-gray-50 border-gray-200', icon: XCircle, label: { lo: 'ຍົກເລີກ', en: 'Cancelled' } },
    DISPUTED: { color: 'text-red-500 bg-red-50 border-red-200', icon: AlertTriangle, label: { lo: 'ມີຂໍ້ຂັດແຍ້ງ', en: 'Disputed' } },
}

function formatDate(date: Date, locale: string): string {
    return new Date(date).toLocaleDateString(locale === 'lo' ? 'lo-LA' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('lo-LA').format(price)
}

export default function MyBookingsList({ bookings, locale }: Props) {
    const router = useRouter()
    const [cancelling, setCancelling] = useState<string | null>(null)

    async function handleCancel(bookingId: string) {
        if (!confirm(locale === 'lo' ? 'ທ່ານແນ່ໃຈບໍ ທີ່ຈະຍົກເລີກ?' : 'Are you sure you want to cancel?')) return
        setCancelling(bookingId)
        try {
            const result = await cancelBookingAction(bookingId)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || 'Error')
            }
        } finally {
            setCancelling(null)
        }
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-20">
                <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-royal-navy mb-2">
                    {locale === 'lo' ? 'ຍັງບໍ່ມີການຈອງ' : 'No Bookings Yet'}
                </h3>
                <p className="text-navy-600 mb-6">
                    {locale === 'lo' ? 'ເລືອກຊຸດທີ່ຖືກໃຈ ແລະ ຈອງເລີຍ!' : 'Browse our collection and book your first outfit!'}
                </p>
                <a
                    href={`/${locale}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-champagne-gold text-royal-navy font-bold rounded-xl hover:bg-champagne-gold/90 transition-all"
                >
                    {locale === 'lo' ? 'ເບິ່ງຊຸດ' : 'Browse Items'}
                </a>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-navy-600 mb-2">
                {bookings.length} {locale === 'lo' ? 'ລາຍການ' : 'bookings'}
            </p>

            {bookings.map((booking) => {
                const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
                const StatusIcon = config.icon
                const total = booking.rentalFee + booking.serviceFee + booking.deposit
                const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status)

                return (
                    <div key={booking.id} className="glass rounded-2xl overflow-hidden border border-white/60 hover:shadow-lg transition-all">
                        <div className="flex flex-col sm:flex-row">
                            {/* Image */}
                            <div className="w-full sm:w-32 h-40 sm:h-auto bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                                {booking.asset.product.images.length > 0 ? (
                                    <img
                                        src={booking.asset.product.images[0]}
                                        alt={booking.asset.product.titleLo}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Package className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-royal-navy">
                                            {locale === 'lo' ? booking.asset.product.titleLo : (booking.asset.product.titleEn || booking.asset.product.titleLo)}
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{booking.asset.assetCode}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {locale === 'lo' ? config.label.lo : config.label.en}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-600 mb-3">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays className="w-3.5 h-3.5 text-champagne-gold" />
                                        {formatDate(booking.pickupDate, locale)} → {formatDate(booking.returnDate, locale)}
                                    </span>
                                    <span>
                                        {booking.asset.product.size} {booking.asset.product.color ? `· ${booking.asset.product.color}` : ''}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-base font-bold text-danger">
                                        {formatPrice(total)} ₭
                                    </span>
                                    <div className="flex gap-2">
                                        {booking.qrCode && booking.status !== 'CANCELLED' && (
                                            <span className="text-xs text-gray-400 font-mono">{booking.qrCode}</span>
                                        )}
                                        {canCancel && (
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                disabled={cancelling === booking.id}
                                                className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-all"
                                            >
                                                {cancelling === booking.id
                                                    ? (locale === 'lo' ? 'ກຳລັງຍົກເລີກ...' : 'Cancelling...')
                                                    : (locale === 'lo' ? 'ຍົກເລີກ' : 'Cancel')
                                                }
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
