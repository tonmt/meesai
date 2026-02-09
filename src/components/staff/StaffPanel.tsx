'use client'

import { useState, useTransition } from 'react'
import { Search, Package, ArrowRightCircle, ArrowLeftCircle, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { lookupAssetByCode, staffCheckOutAction, staffCheckInAction } from '@/actions/staff'

type TodayBooking = {
    id: string
    status: string
    pickupDate: Date
    returnDate: Date
    rentalFee: number
    deposit: number
    renter: { name: string; phone: string }
    asset: {
        assetCode: string
        barcode: string | null
        product: { titleLo: string; titleEn: string | null; images: string[]; size: string }
    }
}

type LookedUpAsset = {
    id: string
    assetCode: string
    status: string
    grade: string
    product: { titleLo: string; titleEn: string | null; images: string[]; size: string }
    owner: { name: string }
    bookings: {
        id: string
        status: string
        pickupDate: Date
        returnDate: Date
        renter: { name: string; phone: string }
    }[]
} | null

type Props = {
    todayBookings: TodayBooking[]
    locale: string
    staffName: string
}

const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-blue-100 text-blue-600',
    PICKED_UP: 'bg-purple-100 text-purple-600',
    RETURNED: 'bg-emerald/10 text-emerald',
    COMPLETED: 'bg-green-100 text-green-600',
    CANCELLED: 'bg-red-100 text-red-500',
}

export default function StaffPanel({ todayBookings, locale, staffName }: Props) {
    const [searchCode, setSearchCode] = useState('')
    const [lookedUp, setLookedUp] = useState<LookedUpAsset>(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<'scan' | 'today'>('today')

    // Search asset by code
    async function handleSearch() {
        if (!searchCode.trim()) return
        setSearchLoading(true)
        setLookedUp(null)
        setActionResult(null)
        const result = await lookupAssetByCode(searchCode.trim())
        setLookedUp(result)
        setSearchLoading(false)
        if (!result) {
            setActionResult({ type: 'error', text: locale === 'lo' ? 'ບໍ່ພົບຊຸດ' : 'Item not found' })
        }
    }

    // Check-out (send to customer)
    function handleCheckOut(bookingId: string, assetId: string) {
        startTransition(async () => {
            setActionResult(null)
            const result = await staffCheckOutAction(bookingId, assetId)
            if (result.success) {
                setActionResult({ type: 'success', text: locale === 'lo' ? '✅ ສົ່ງມອບສຳເລັດ' : '✅ Check-out complete' })
                setLookedUp(null)
            } else {
                setActionResult({ type: 'error', text: result.error || 'Error' })
            }
        })
    }

    // Check-in (receive from customer)
    function handleCheckIn(bookingId: string, assetId: string, condition: 'GOOD' | 'DAMAGED') {
        startTransition(async () => {
            setActionResult(null)
            const result = await staffCheckInAction(bookingId, assetId, condition)
            if (result.success) {
                setActionResult({
                    type: 'success',
                    text: condition === 'GOOD'
                        ? (locale === 'lo' ? '✅ ຮັບຄືນ + ຄືນມັດຈຳແລ້ວ' : '✅ Checked in + Deposit refunded')
                        : (locale === 'lo' ? '⚠️ ຮັບຄືน — ລາຍງານຄວາມເສຍຫາຍ' : '⚠️ Checked in — Damage reported')
                })
                setLookedUp(null)
            } else {
                setActionResult({ type: 'error', text: result.error || 'Error' })
            }
        })
    }

    const fmt = (n: number) => new Intl.NumberFormat('lo-LA').format(n)

    const checkOuts = todayBookings.filter(b => b.status === 'CONFIRMED')
    const checkIns = todayBookings.filter(b => b.status === 'PICKED_UP')

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('today')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'today'
                            ? 'bg-royal-navy text-white shadow-md'
                            : 'bg-white/80 text-navy-600 hover:bg-white border border-gray-200'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    {locale === 'lo' ? 'ມື້ນີ້' : "Today's Schedule"} ({todayBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('scan')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'scan'
                            ? 'bg-royal-navy text-white shadow-md'
                            : 'bg-white/80 text-navy-600 hover:bg-white border border-gray-200'
                        }`}
                >
                    <Search className="w-4 h-4" />
                    {locale === 'lo' ? 'ຊອກຫາ' : 'Lookup'}
                </button>
            </div>

            {/* Action Result Toast */}
            {actionResult && (
                <div className={`p-4 rounded-xl text-sm font-medium ${actionResult.type === 'success' ? 'bg-emerald/10 text-emerald border border-emerald/30' : 'bg-red-50 text-red-500 border border-red-200'
                    }`}>
                    {actionResult.text}
                </div>
            )}

            {/* === SCAN/LOOKUP TAB === */}
            {activeTab === 'scan' && (
                <div className="space-y-4">
                    {/* Barcode Search */}
                    <div className="glass rounded-2xl p-5 border border-white/60">
                        <h3 className="text-sm font-bold text-royal-navy mb-3 flex items-center gap-1.5">
                            <Search className="w-4 h-4 text-champagne-gold" />
                            {locale === 'lo' ? 'ຊອກລະຫັດຊຸດ / Barcode' : 'Asset Code / Barcode Lookup'}
                        </h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={searchCode}
                                onChange={e => setSearchCode(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                placeholder={locale === 'lo' ? 'ພິມລະຫັດ ຫຼື scan barcode...' : 'Enter code or scan barcode...'}
                                className="flex-1 px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold font-mono"
                                autoFocus
                            />
                            <button
                                onClick={handleSearch}
                                disabled={searchLoading}
                                className="px-6 py-3 bg-royal-navy text-white font-bold text-sm rounded-xl hover:bg-royal-navy/90 disabled:opacity-50 transition-all"
                            >
                                {searchLoading ? '...' : (locale === 'lo' ? 'ຊອກ' : 'Search')}
                            </button>
                        </div>
                    </div>

                    {/* Lookup Result */}
                    {lookedUp && (
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                    {lookedUp.product.images[0] ? (
                                        <img src={lookedUp.product.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-8 h-8 m-6 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-royal-navy">
                                        {locale === 'lo' ? lookedUp.product.titleLo : (lookedUp.product.titleEn || lookedUp.product.titleLo)}
                                    </h4>
                                    <p className="text-xs text-navy-600 mt-0.5">
                                        <span className="font-mono">{lookedUp.assetCode}</span> · Grade {lookedUp.grade} · {lookedUp.product.size}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">{locale === 'lo' ? 'ເຈົ້າຂອງ' : 'Owner'}: {lookedUp.owner.name}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[lookedUp.status] || 'bg-gray-100 text-gray-500'}`}>
                                        {lookedUp.status}
                                    </span>
                                </div>
                            </div>

                            {/* Active booking → Action buttons */}
                            {lookedUp.bookings.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    {lookedUp.bookings.map(b => (
                                        <div key={b.id} className="space-y-3">
                                            <div className="p-3 bg-white/50 rounded-xl border border-gray-100">
                                                <p className="text-sm text-royal-navy font-medium flex items-center gap-1.5">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[b.status] || 'bg-gray-100'}`}>{b.status}</span>
                                                    {b.renter.name} · {b.renter.phone}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    📅 {new Date(b.pickupDate).toLocaleDateString('lo-LA')} → {new Date(b.returnDate).toLocaleDateString('lo-LA')}
                                                </p>
                                            </div>

                                            {/* Check-out button (CONFIRMED → PICKED_UP) */}
                                            {b.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleCheckOut(b.id, lookedUp!.id)}
                                                    disabled={isPending}
                                                    className="w-full py-3 bg-emerald text-white font-bold text-sm rounded-xl hover:bg-emerald/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <ArrowRightCircle className="w-5 h-5" />
                                                    {isPending ? '...' : (locale === 'lo' ? 'ສົ່ງມອບ (Check-out)' : 'Check-out to Customer')}
                                                </button>
                                            )}

                                            {/* Check-in buttons (PICKED_UP → RETURNED) */}
                                            {b.status === 'PICKED_UP' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => handleCheckIn(b.id, lookedUp!.id, 'GOOD')}
                                                        disabled={isPending}
                                                        className="py-3 bg-emerald text-white font-bold text-sm rounded-xl hover:bg-emerald/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        {isPending ? '...' : (locale === 'lo' ? 'ສົມບູນ' : 'Good')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleCheckIn(b.id, lookedUp!.id, 'DAMAGED')}
                                                        disabled={isPending}
                                                        className="py-3 bg-amber-500 text-white font-bold text-sm rounded-xl hover:bg-amber-500/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <AlertTriangle className="w-4 h-4" />
                                                        {isPending ? '...' : (locale === 'lo' ? 'ເສຍຫາຍ' : 'Damaged')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* No active booking */}
                            {lookedUp.bookings.length === 0 && (
                                <p className="mt-4 text-sm text-gray-400 text-center py-3">
                                    {locale === 'lo' ? 'ບໍ່ມີການຈອງທີ່ active' : 'No active booking for this item'}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* === TODAY'S SCHEDULE TAB === */}
            {activeTab === 'today' && (
                <div className="space-y-6">
                    {/* Check-outs */}
                    <div className="glass rounded-2xl p-5 border border-white/60">
                        <h3 className="text-sm font-bold text-royal-navy mb-4 flex items-center gap-2">
                            <ArrowRightCircle className="w-4 h-4 text-emerald" />
                            {locale === 'lo' ? 'ສົ່ງມອບ (Check-out)' : 'Check-out Today'} ({checkOuts.length})
                        </h3>
                        {checkOuts.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">
                                {locale === 'lo' ? 'ບໍ່ມີການສົ່ງມອບ' : 'No check-outs scheduled'}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {checkOuts.map(b => (
                                    <div key={b.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {b.asset.product.images[0] ? (
                                                    <img src={b.asset.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-5 h-5 m-3.5 text-gray-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-royal-navy">
                                                    {locale === 'lo' ? b.asset.product.titleLo : (b.asset.product.titleEn || b.asset.product.titleLo)}
                                                </p>
                                                <p className="text-xs text-navy-600">{b.asset.assetCode} · {b.asset.product.size}</p>
                                                <p className="text-xs text-gray-400">👤 {b.renter.name} · {b.renter.phone}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCheckOut(b.id, b.asset.assetCode)}
                                            disabled={isPending}
                                            className="px-4 py-2 bg-emerald text-white font-bold text-xs rounded-lg hover:bg-emerald/90 disabled:opacity-50 transition-all"
                                        >
                                            {isPending ? '...' : (locale === 'lo' ? 'ສົ່ງ' : 'Out')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Check-ins */}
                    <div className="glass rounded-2xl p-5 border border-white/60">
                        <h3 className="text-sm font-bold text-royal-navy mb-4 flex items-center gap-2">
                            <ArrowLeftCircle className="w-4 h-4 text-blue-500" />
                            {locale === 'lo' ? 'ຮັບຄືນ (Check-in)' : 'Check-in Today'} ({checkIns.length})
                        </h3>
                        {checkIns.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">
                                {locale === 'lo' ? 'ບໍ່ມີການຮັບຄືນ' : 'No check-ins scheduled'}
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {checkIns.map(b => (
                                    <div key={b.id} className="p-3 bg-white/50 rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {b.asset.product.images[0] ? (
                                                        <img src={b.asset.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 m-3.5 text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-royal-navy">
                                                        {locale === 'lo' ? b.asset.product.titleLo : (b.asset.product.titleEn || b.asset.product.titleLo)}
                                                    </p>
                                                    <p className="text-xs text-navy-600">{b.asset.assetCode}</p>
                                                    <p className="text-xs text-gray-400">👤 {b.renter.name} · {locale === 'lo' ? 'ມັດຈຳ' : 'Dep'}: {fmt(b.deposit)} ₭</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveTab('scan')
                                                        setSearchCode(b.asset.assetCode)
                                                        // Trigger lookup
                                                        setTimeout(() => handleSearch(), 100)
                                                    }}
                                                    className="px-3 py-2 bg-blue-500 text-white font-bold text-xs rounded-lg hover:bg-blue-500/90 transition-all"
                                                >
                                                    {locale === 'lo' ? 'ຮັບ' : 'In'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Empty state */}
                    {todayBookings.length === 0 && (
                        <div className="text-center py-16">
                            <CheckCircle className="w-16 h-16 text-emerald/30 mx-auto mb-4" />
                            <p className="text-lg font-bold text-royal-navy">
                                {locale === 'lo' ? 'ວ່າງ! ບໍ່ມີນັດໝາຍ' : 'All clear! No appointments today'}
                            </p>
                            <p className="text-sm text-navy-600 mt-1">
                                {locale === 'lo' ? 'ໃຊ້ tab ຊອກຫາ ເພື່ອ scan ລະຫັດ' : 'Use Lookup tab to scan asset codes'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
