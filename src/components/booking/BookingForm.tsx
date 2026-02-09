'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { createBookingAction, checkAvailabilityAction } from '@/actions/booking'

type Product = {
    id: string
    titleLo: string
    titleEn: string | null
    rentalPrice: number
    assets: { id: string; assetCode: string; grade: string; condition: string | null }[]
}

type Props = {
    product: Product
    locale: string
    userId: string
}

export default function BookingForm({ product, locale, userId }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(false)
    const [error, setError] = useState('')

    const [available, setAvailable] = useState<boolean | null>(null)
    const [selectedAsset, setSelectedAsset] = useState(product.assets[0]?.id || '')

    const serviceFee = Math.round(product.rentalPrice * 0.1)
    const deposit = Math.round(product.rentalPrice * 0.3)
    const total = product.rentalPrice + serviceFee + deposit

    // ─── Check Availability ───
    async function handleCheckAvailability(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setChecking(true)
        setAvailable(null)
        setError('')

        const form = new FormData(e.currentTarget)
        const pickupDate = form.get('pickupDate') as string
        const returnDate = form.get('returnDate') as string

        if (!pickupDate || !returnDate || !selectedAsset) {
            setError(locale === 'lo' ? 'ກະລຸນາເລືອກວັນ ແລະ ຊຸດ' : 'Please select dates and asset')
            setChecking(false)
            return
        }

        try {
            const result = await checkAvailabilityAction(selectedAsset, pickupDate, returnDate)
            setAvailable(result.available)
            if (!result.available) {
                setError(locale === 'lo' ? 'ຊຸດນີ້ຖືກຈອງແລ້ວໃນຊ່ວງເວລານີ້' : 'This item is already booked for these dates')
            }
        } catch {
            setError(locale === 'lo' ? 'ເກີດຂໍ້ຜິດພາດ' : 'Check failed')
        } finally {
            setChecking(false)
        }
    }

    // ─── Submit Booking ───
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!available) return
        setLoading(true)
        setError('')

        const form = new FormData(e.currentTarget)
        form.set('assetId', selectedAsset)

        try {
            const result = await createBookingAction(form)
            if (result.success && result.bookingId) {
                // Redirect to payment page
                router.push(`/${locale}/payment/${result.bookingId}`)
            } else {
                setError(result.error || 'ເກີດຂໍ້ຜິດພາດ')
            }
        } catch {
            setError(locale === 'lo' ? 'ເກີດຂໍ້ຜິດພາດ' : 'Booking failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass rounded-3xl p-8 border border-white/60 h-fit sticky top-20">
            <h3 className="text-xl font-bold text-royal-navy mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-champagne-gold" />
                {locale === 'lo' ? 'ຈອງຊຸດ' : 'Book This Item'}
            </h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={available ? handleSubmit : handleCheckAvailability} className="space-y-4">
                {/* Asset Selection (if multiple) */}
                {product.assets.length > 1 && (
                    <div>
                        <label className="block text-sm font-medium text-navy-600 mb-1.5">
                            {locale === 'lo' ? 'ເລືອກຊຸດ' : 'Select Item'}
                        </label>
                        <select
                            value={selectedAsset}
                            onChange={(e) => { setSelectedAsset(e.target.value); setAvailable(null) }}
                            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
                        >
                            {product.assets.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.assetCode} — Grade {a.grade}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Event Date */}
                <div>
                    <label className="block text-sm font-medium text-navy-600 mb-1.5">
                        {locale === 'lo' ? 'ວັນງານ' : 'Event Date'}
                    </label>
                    <input
                        name="eventDate"
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
                    />
                </div>

                {/* Pickup Date */}
                <div>
                    <label className="block text-sm font-medium text-navy-600 mb-1.5">
                        {locale === 'lo' ? 'ວັນຮັບຊຸດ' : 'Pickup Date'}
                    </label>
                    <input
                        name="pickupDate"
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        onChange={() => setAvailable(null)}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
                    />
                </div>

                {/* Return Date */}
                <div>
                    <label className="block text-sm font-medium text-navy-600 mb-1.5">
                        {locale === 'lo' ? 'ວັນສົ່ງຄືນ' : 'Return Date'}
                    </label>
                    <input
                        name="returnDate"
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        onChange={() => setAvailable(null)}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
                    />
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-navy-600 mb-1.5">
                        {locale === 'lo' ? 'ໝາຍເຫດ' : 'Notes'} <span className="text-gray-400">({locale === 'lo' ? 'ທາງເລືອກ' : 'optional'})</span>
                    </label>
                    <textarea
                        name="notes"
                        rows={2}
                        placeholder={locale === 'lo' ? 'ຕ້ອງການແກ້ໄຂ, ສົ່ງ delivery, etc.' : 'Any special requests...'}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 resize-none"
                    />
                </div>

                {/* Availability Status */}
                {available !== null && (
                    <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${available ? 'bg-emerald/10 text-emerald border border-emerald/20' : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                        {available ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {available
                            ? (locale === 'lo' ? 'ຊຸດຫວ່າງ! ກົດ "ຢືນຢັນ" ເພື່ອຈອງ' : 'Available! Click "Confirm" to book')
                            : (locale === 'lo' ? 'ຊຸດບໍ່ຫວ່າງ ກະລຸນາເລືອກວັນອື່ນ' : 'Not available, try other dates')
                        }
                    </div>
                )}

                {/* Price Breakdown */}
                <div className="bg-champagne-gold/5 rounded-xl p-4 space-y-2 border border-champagne-gold/10">
                    <div className="flex justify-between text-sm text-navy-600">
                        <span>{locale === 'lo' ? 'ຄ່າເຊົ່າ' : 'Rental Fee'}</span>
                        <span className="font-medium">{new Intl.NumberFormat('lo-LA').format(product.rentalPrice)} ₭</span>
                    </div>
                    <div className="flex justify-between text-sm text-navy-600">
                        <span>{locale === 'lo' ? 'ຄ່າບໍລິການ (10%)' : 'Service Fee (10%)'}</span>
                        <span>{new Intl.NumberFormat('lo-LA').format(serviceFee)} ₭</span>
                    </div>
                    <div className="flex justify-between text-sm text-navy-600">
                        <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {locale === 'lo' ? 'ມັດຈຳ (30%)' : 'Deposit (30%)'}
                        </span>
                        <span>{new Intl.NumberFormat('lo-LA').format(deposit)} ₭</span>
                    </div>
                    <div className="border-t border-champagne-gold/20 pt-2 mt-2 flex justify-between text-base font-bold text-royal-navy">
                        <span>{locale === 'lo' ? 'ລວມທັງໝົດ' : 'Total'}</span>
                        <span className="text-danger">{new Intl.NumberFormat('lo-LA').format(total)} ₭</span>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || checking}
                    className={`w-full py-3.5 font-bold rounded-xl text-base flex items-center justify-center gap-2 shadow-lg transition-all ${available
                        ? 'bg-champagne-gold text-royal-navy hover:bg-champagne-gold/90 shadow-champagne-gold/20'
                        : 'bg-royal-navy text-white hover:bg-royal-navy/90 shadow-royal-navy/20'
                        } disabled:opacity-60`}
                >
                    {(loading || checking) && <Loader2 className="w-4 h-4 animate-spin" />}
                    {available
                        ? (locale === 'lo' ? 'ຢືນຢັນການຈອງ' : 'Confirm Booking')
                        : (locale === 'lo' ? 'ກວດສອບຄວາມພ້ອມ' : 'Check Availability')
                    }
                </button>

                {/* Deposit Notice */}
                <p className="text-xs text-center text-navy-600/60">
                    <Shield className="w-3 h-3 inline mr-1" />
                    {locale === 'lo' ? 'ມັດຈຳຈະຄືນເມື່ອ QC ຜ່ານ' : 'Deposit refunded after QC approval'}
                </p>
            </form>
        </div>
    )
}
