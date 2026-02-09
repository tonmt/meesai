'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, Package, Users, ArrowDownCircle, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react'
import { requestPayoutAction } from '@/actions/owner'

type Asset = {
    id: string
    assetCode: string
    status: string
    grade: string
    condition: string | null
    totalRentals: number
    product: {
        titleLo: string
        titleEn: string | null
        rentalPrice: number
        images: string[]
        size: string
        category: { nameLo: string; nameEn: string }
    }
    _count: { bookings: number }
}

type Transaction = {
    id: string
    amount: number
    type: string
    note: string | null
    createdAt: Date
    booking: {
        id: string
        pickupDate: Date
        returnDate: Date
        renter: { name: string }
    } | null
}

type Revenue = {
    balance: number
    totalEarnings: number
    totalBookings: number
    pendingPayouts: number
    transactions: Transaction[]
} | null

type Booking = {
    id: string
    status: string
    pickupDate: Date
    returnDate: Date
    rentalFee: number
    serviceFee: number
    deposit: number
    asset: {
        assetCode: string
        product: { titleLo: string; titleEn: string | null; images: string[] }
    }
    renter: { name: string; phone: string }
}

type Props = {
    assets: Asset[]
    revenue: Revenue
    bookings: Booking[]
    locale: string
}

const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-emerald/10 text-emerald',
    RENTED: 'bg-blue-100 text-blue-600',
    MAINTENANCE: 'bg-amber-100 text-amber-600',
    RETIRED: 'bg-gray-100 text-gray-500',
    PENDING: 'bg-amber-100 text-amber-600',
    CONFIRMED: 'bg-blue-100 text-blue-600',
    PICKED_UP: 'bg-purple-100 text-purple-600',
    RETURNED: 'bg-emerald/10 text-emerald',
    QC_PASSED: 'bg-green-100 text-green-600',
    CANCELLED: 'bg-red-100 text-red-500',
}

const txnTypeLabels: Record<string, { lo: string; en: string; color: string }> = {
    RENTAL_PAYMENT: { lo: 'ຄ່າເຊົ່າ', en: 'Rental', color: 'text-emerald' },
    SERVICE_FEE: { lo: 'ຄ່າບໍລິການ', en: 'Service Fee', color: 'text-amber-500' },
    DEPOSIT: { lo: 'ມັດຈຳ', en: 'Deposit', color: 'text-blue-500' },
    DEPOSIT_REFUND: { lo: 'ຄືນມັດຈຳ', en: 'Refund', color: 'text-purple-500' },
    PAYOUT: { lo: 'ຖອນເງິນ', en: 'Payout', color: 'text-red-500' },
}

export default function OwnerDashboard({ assets, revenue, bookings, locale }: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'bookings' | 'wallet'>('overview')
    const [payoutAmount, setPayoutAmount] = useState('')
    const [payoutLoading, setPayoutLoading] = useState(false)
    const [payoutMsg, setPayoutMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const fmt = (n: number) => new Intl.NumberFormat('lo-LA').format(n)

    async function handlePayout() {
        const amount = parseInt(payoutAmount, 10)
        if (!amount || amount <= 0) return
        setPayoutLoading(true)
        setPayoutMsg(null)
        const result = await requestPayoutAction(amount)
        setPayoutLoading(false)
        if (result.success) {
            setPayoutMsg({ type: 'success', text: locale === 'lo' ? 'ສົ່ງຄຳຂໍຖອນເງິນແລ້ວ' : 'Payout request submitted' })
            setPayoutAmount('')
        } else {
            setPayoutMsg({ type: 'error', text: result.error || 'Error' })
        }
    }

    const tabs = [
        { key: 'overview' as const, label: locale === 'lo' ? 'ພາບລວມ' : 'Overview', icon: TrendingUp },
        { key: 'assets' as const, label: locale === 'lo' ? 'ຊຸດຂອງຂ້ອຍ' : 'My Items', icon: Package },
        { key: 'bookings' as const, label: locale === 'lo' ? 'ການຈອງ' : 'Bookings', icon: Users },
        { key: 'wallet' as const, label: locale === 'lo' ? 'ກະເປົາ' : 'Wallet', icon: Wallet },
    ]

    return (
        <div className="space-y-6">
            {/* Tab Bar */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                            ? 'bg-champagne-gold text-royal-navy shadow-md'
                            : 'bg-white/80 text-navy-600 hover:bg-white border border-gray-200'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* === OVERVIEW TAB === */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <p className="text-xs text-navy-600 mb-1">{locale === 'lo' ? 'ຍອດເງິນ' : 'Balance'}</p>
                            <p className="text-2xl font-bold text-emerald">{fmt(revenue?.balance || 0)} <span className="text-sm font-normal">₭</span></p>
                        </div>
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <p className="text-xs text-navy-600 mb-1">{locale === 'lo' ? 'ລາຍໄດ້ທັງໝົດ' : 'Total Earnings'}</p>
                            <p className="text-2xl font-bold text-champagne-gold">{fmt(revenue?.totalEarnings || 0)} <span className="text-sm font-normal">₭</span></p>
                        </div>
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <p className="text-xs text-navy-600 mb-1">{locale === 'lo' ? 'ຊຸດທັງໝົດ' : 'Total Items'}</p>
                            <p className="text-2xl font-bold text-royal-navy">{assets.length}</p>
                        </div>
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <p className="text-xs text-navy-600 mb-1">{locale === 'lo' ? 'ການຈອງ' : 'Bookings'}</p>
                            <p className="text-2xl font-bold text-royal-navy">{revenue?.totalBookings || 0}</p>
                        </div>
                    </div>

                    {/* Desktop: Two-column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Recent Bookings — wide */}
                        <div className="lg:col-span-3 glass rounded-2xl p-5 border border-white/60">
                            <h3 className="text-sm font-bold text-royal-navy mb-4">
                                {locale === 'lo' ? 'ການຈອງລ່າສຸດ' : 'Recent Bookings'}
                            </h3>
                            {bookings.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">
                                    {locale === 'lo' ? 'ยังບໍ່ມີການຈອງ' : 'No bookings yet'}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {bookings.slice(0, 5).map(b => (
                                        <div key={b.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {b.asset.product.images[0] ? (
                                                        <img src={b.asset.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-5 h-5 m-2.5 text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-royal-navy">
                                                        {locale === 'lo' ? b.asset.product.titleLo : (b.asset.product.titleEn || b.asset.product.titleLo)}
                                                    </p>
                                                    <p className="text-xs text-navy-600">{b.renter.name} · {b.asset.assetCode}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[b.status] || 'bg-gray-100 text-gray-500'}`}>
                                                    {b.status}
                                                </span>
                                                <p className="text-xs text-emerald font-medium mt-1">{fmt(b.rentalFee)} ₭</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Wallet Summary — narrow */}
                        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-white/60">
                            <h3 className="text-sm font-bold text-royal-navy mb-4">
                                {locale === 'lo' ? 'ກະເປົາເງິນ' : 'Wallet Summary'}
                            </h3>
                            <div className="bg-gradient-to-br from-royal-navy to-royal-navy/80 rounded-2xl p-4 text-white mb-4">
                                <p className="text-xs text-white/70">{locale === 'lo' ? 'ຍອດເງິນ' : 'Balance'}</p>
                                <p className="text-3xl font-bold mt-1">{fmt(revenue?.balance || 0)} <span className="text-sm font-normal text-white/70">₭</span></p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-navy-600">{locale === 'lo' ? 'ລາຍໄດ້ທັງໝົດ' : 'Total Earned'}</span>
                                    <span className="font-bold text-champagne-gold">{fmt(revenue?.totalEarnings || 0)} ₭</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-navy-600">{locale === 'lo' ? 'ລໍຖ້າຖອນ' : 'Pending Payouts'}</span>
                                    <span className="font-bold text-amber-500">{fmt(revenue?.pendingPayouts || 0)} ₭</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-navy-600">{locale === 'lo' ? 'ຈຳນວນຈອງ' : 'Total Bookings'}</span>
                                    <span className="font-bold text-royal-navy">{revenue?.totalBookings || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === ASSETS TAB === */}
            {activeTab === 'assets' && (
                <div className="space-y-4">
                    {assets.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-bold text-royal-navy">
                                {locale === 'lo' ? 'ยังບໍ່ມີຊຸດ' : 'No items yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {assets.map(asset => (
                                <div key={asset.id} className="glass rounded-2xl overflow-hidden border border-white/60">
                                    <div className="aspect-[4/3] bg-gray-100 relative">
                                        {asset.product.images[0] ? (
                                            <img src={asset.product.images[0]} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package className="w-10 h-10" />
                                            </div>
                                        )}
                                        <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[asset.status] || 'bg-gray-100'}`}>
                                            {asset.status}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-sm text-royal-navy truncate">
                                            {locale === 'lo' ? asset.product.titleLo : (asset.product.titleEn || asset.product.titleLo)}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-navy-600">
                                            <span className="font-mono">{asset.assetCode}</span>
                                            <span>·</span>
                                            <span>Grade {asset.grade}</span>
                                            <span>·</span>
                                            <span>{asset.product.size}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                            <span className="text-xs text-navy-600">{asset._count.bookings} {locale === 'lo' ? 'ຄັ້ງ' : 'bookings'}</span>
                                            <span className="text-sm font-bold text-danger">{fmt(asset.product.rentalPrice)} ₭</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* === BOOKINGS TAB === */}
            {activeTab === 'bookings' && (
                <>
                    {bookings.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-lg font-bold text-royal-navy">
                                {locale === 'lo' ? 'ยังບໍ່ມີການຈອງ' : 'No bookings yet'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block glass rounded-2xl border border-white/60 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-royal-navy/5 text-royal-navy text-xs">
                                                <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ສິນຄ້າ' : 'Product'}</th>
                                                <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ລະຫັດ' : 'Code'}</th>
                                                <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ຜູ້ເຊົ່າ' : 'Renter'}</th>
                                                <th className="text-center px-4 py-3 font-medium">{locale === 'lo' ? 'ວັນທີ' : 'Dates'}</th>
                                                <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ຄ່າເຊົ່າ' : 'Rental'}</th>
                                                <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ມັດຈຳ' : 'Deposit'}</th>
                                                <th className="text-center px-4 py-3 font-medium">{locale === 'lo' ? 'ສະຖານະ' : 'Status'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(b => (
                                                <tr key={b.id} className="border-t border-gray-100 hover:bg-white/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                {b.asset.product.images[0] ? (
                                                                    <img src={b.asset.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package className="w-4 h-4 m-2 text-gray-300" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-royal-navy text-xs truncate max-w-[120px]">
                                                                {locale === 'lo' ? b.asset.product.titleLo : (b.asset.product.titleEn || b.asset.product.titleLo)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-navy-600">{b.asset.assetCode}</td>
                                                    <td className="px-4 py-3 text-xs text-navy-600">
                                                        <p>{b.renter.name}</p>
                                                        <p className="text-gray-400 font-mono">{b.renter.phone}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-xs text-gray-400">
                                                        {new Date(b.pickupDate).toLocaleDateString('lo-LA')} → {new Date(b.returnDate).toLocaleDateString('lo-LA')}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-xs text-emerald">{fmt(b.rentalFee)} ₭</td>
                                                    <td className="px-4 py-3 text-right text-xs text-blue-500">{fmt(b.deposit)} ₭</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[b.status] || 'bg-gray-100'}`}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {bookings.map(b => (
                                    <div key={b.id} className="glass rounded-2xl p-4 border border-white/60">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {b.asset.product.images[0] ? (
                                                        <img src={b.asset.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-6 h-6 m-4 text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-royal-navy">
                                                        {locale === 'lo' ? b.asset.product.titleLo : (b.asset.product.titleEn || b.asset.product.titleLo)}
                                                    </p>
                                                    <p className="text-xs text-navy-600 mt-0.5">{b.asset.assetCode}</p>
                                                    <p className="text-xs text-gray-400 mt-1">👤 {b.renter.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        📅 {new Date(b.pickupDate).toLocaleDateString('lo-LA')} - {new Date(b.returnDate).toLocaleDateString('lo-LA')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[b.status] || 'bg-gray-100'}`}>
                                                    {b.status}
                                                </span>
                                                <p className="text-lg font-bold text-emerald mt-1">{fmt(b.rentalFee)} ₭</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* === WALLET TAB === */}
            {activeTab === 'wallet' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left: Balance + Payout */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Balance Card */}
                        <div className="bg-gradient-to-br from-royal-navy to-royal-navy/80 rounded-3xl p-6 text-white">
                            <p className="text-sm text-white/70">{locale === 'lo' ? 'ຍອດເງິນໃນກະເປົາ' : 'Wallet Balance'}</p>
                            <p className="text-4xl font-bold mt-2">{fmt(revenue?.balance || 0)} <span className="text-lg font-normal text-white/70">₭</span></p>
                            <div className="flex gap-4 mt-4 text-sm text-white/60">
                                <span>{locale === 'lo' ? 'ລາຍໄດ້ທັງໝົດ' : 'Total earned'}: {fmt(revenue?.totalEarnings || 0)} ₭</span>
                            </div>
                        </div>

                        {/* Payout Request */}
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <h3 className="text-sm font-bold text-royal-navy mb-3 flex items-center gap-1.5">
                                <ArrowDownCircle className="w-4 h-4 text-champagne-gold" />
                                {locale === 'lo' ? 'ຖອນເງິນ' : 'Request Payout'}
                            </h3>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                        placeholder={locale === 'lo' ? 'ຈຳນວນ (₭)' : 'Amount (₭)'}
                                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold"
                                    />
                                </div>
                                <button
                                    onClick={handlePayout}
                                    disabled={payoutLoading || !payoutAmount}
                                    className="px-6 py-3 bg-champagne-gold text-royal-navy font-bold text-sm rounded-xl hover:bg-champagne-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {payoutLoading ? '...' : (locale === 'lo' ? 'ຖອນ' : 'Withdraw')}
                                </button>
                            </div>
                            {payoutMsg && (
                                <p className={`text-sm mt-2 ${payoutMsg.type === 'success' ? 'text-emerald' : 'text-red-500'}`}>
                                    {payoutMsg.type === 'success' ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                                    {payoutMsg.text}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Transaction History */}
                    <div className="lg:col-span-3 glass rounded-2xl p-5 border border-white/60">
                        <h3 className="text-sm font-bold text-royal-navy mb-4 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-champagne-gold" />
                            {locale === 'lo' ? 'ປະຫວັດທຸລະກຳ' : 'Transaction History'}
                        </h3>
                        {(!revenue?.transactions || revenue.transactions.length === 0) ? (
                            <p className="text-sm text-gray-400 text-center py-6">
                                {locale === 'lo' ? 'ยังບໍ່ມີທຸລະກຳ' : 'No transactions yet'}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {revenue.transactions.map(txn => {
                                    const label = txnTypeLabels[txn.type] || { lo: txn.type, en: txn.type, color: 'text-gray-500' }
                                    return (
                                        <div key={txn.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                                            <div>
                                                <p className={`text-sm font-medium ${label.color}`}>
                                                    {locale === 'lo' ? label.lo : label.en}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {txn.booking
                                                        ? `${txn.booking.renter.name} · ${new Date(txn.booking.pickupDate).toLocaleDateString('lo-LA')}`
                                                        : txn.note
                                                    }
                                                </p>
                                                <p className="text-[10px] text-gray-300">{new Date(txn.createdAt).toLocaleString('lo-LA')}</p>
                                            </div>
                                            <p className={`text-sm font-bold ${txn.type === 'PAYOUT' ? 'text-red-500' : 'text-emerald'}`}>
                                                {txn.type === 'PAYOUT' ? '-' : '+'}{fmt(txn.amount)} ₭
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
