'use client'

import { useState } from 'react'
import { BarChart3, Users, Package, CreditCard, Clock, CheckCircle, TrendingUp, ShoppingBag } from 'lucide-react'

type Stats = {
    totalUsers: number
    totalProducts: number
    totalAssets: number
    totalBookings: number
    pendingBookings: number
    confirmedBookings: number
    platformRevenue: number
} | null

type User = {
    id: string
    name: string
    phone: string
    role: string
    createdAt: Date
    _count: { assets: number; bookings: number }
}

type AdminBooking = {
    id: string
    status: string
    pickupDate: Date
    returnDate: Date
    rentalFee: number
    serviceFee: number
    deposit: number
    createdAt: Date
    renter: { name: string; phone: string }
    asset: {
        assetCode: string
        owner: { name: string }
        product: { titleLo: string; titleEn: string | null; images: string[] }
    }
}

type AdminTxn = {
    id: string
    amount: number
    type: string
    note: string | null
    createdAt: Date
    booking: {
        id: string
        renter: { name: string }
        asset: { assetCode: string; owner: { name: string } }
    } | null
    destWallet: { user: { name: string } } | null
}

type Props = {
    stats: Stats
    users: User[]
    bookings: AdminBooking[]
    transactions: AdminTxn[]
    locale: string
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-600',
    CONFIRMED: 'bg-blue-100 text-blue-600',
    PICKED_UP: 'bg-purple-100 text-purple-600',
    RETURNED: 'bg-emerald/10 text-emerald',
    CANCELLED: 'bg-red-100 text-red-500',
    QC_PASSED: 'bg-green-100 text-green-600',
}

const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-600',
    OWNER: 'bg-champagne-gold/20 text-champagne-gold',
    RENTER: 'bg-blue-100 text-blue-600',
    STAFF: 'bg-purple-100 text-purple-600',
}

const txnColors: Record<string, string> = {
    RENTAL_PAYMENT: 'text-emerald',
    SERVICE_FEE: 'text-champagne-gold',
    DEPOSIT: 'text-blue-500',
    DEPOSIT_REFUND: 'text-purple-500',
    PAYOUT: 'text-red-500',
}

export default function AdminDashboard({ stats, users, bookings, transactions, locale }: Props) {
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'bookings' | 'revenue'>('stats')
    const fmt = (n: number) => new Intl.NumberFormat('lo-LA').format(n)

    const tabs = [
        { key: 'stats' as const, label: locale === 'lo' ? 'ພາບລວມ' : 'Overview', icon: BarChart3 },
        { key: 'users' as const, label: locale === 'lo' ? 'ຜູ້ໃຊ້' : 'Users', icon: Users },
        { key: 'bookings' as const, label: locale === 'lo' ? 'ການຈອງ' : 'Bookings', icon: ShoppingBag },
        { key: 'revenue' as const, label: locale === 'lo' ? 'ລາຍໄດ້' : 'Revenue', icon: CreditCard },
    ]

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                            ? 'bg-royal-navy text-white shadow-md'
                            : 'bg-white/80 text-navy-600 hover:bg-white border border-gray-200'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* === STATS TAB === */}
            {activeTab === 'stats' && stats && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={TrendingUp} label={locale === 'lo' ? 'ລາຍໄດ້ Platform' : 'Platform Revenue'} value={`${fmt(stats.platformRevenue)} ₭`} color="text-champagne-gold" />
                        <StatCard icon={Users} label={locale === 'lo' ? 'ຜູ້ໃຊ້ທັງໝົດ' : 'Total Users'} value={String(stats.totalUsers)} color="text-royal-navy" />
                        <StatCard icon={Package} label={locale === 'lo' ? 'ສິນຄ້າ / ຊຸດ' : 'Products / Items'} value={`${stats.totalProducts} / ${stats.totalAssets}`} color="text-emerald" />
                        <StatCard icon={ShoppingBag} label={locale === 'lo' ? 'ການຈອງທັງໝົດ' : 'Total Bookings'} value={String(stats.totalBookings)} color="text-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass rounded-2xl p-5 border border-white/60 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs text-navy-600">{locale === 'lo' ? 'ລໍຖ້າຊຳລະ' : 'Pending'}</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.pendingBookings}</p>
                            </div>
                        </div>
                        <div className="glass rounded-2xl p-5 border border-white/60 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald" />
                            </div>
                            <div>
                                <p className="text-xs text-navy-600">{locale === 'lo' ? 'ຢືນຢັນແລ້ວ' : 'Confirmed'}</p>
                                <p className="text-2xl font-bold text-emerald">{stats.confirmedBookings}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === USERS TAB === */}
            {activeTab === 'users' && (
                <div className="glass rounded-2xl border border-white/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-royal-navy/5 text-royal-navy text-xs">
                                    <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ຊື່' : 'Name'}</th>
                                    <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ເບີ' : 'Phone'}</th>
                                    <th className="text-center px-4 py-3 font-medium">{locale === 'lo' ? 'ບົດບາດ' : 'Role'}</th>
                                    <th className="text-center px-4 py-3 font-medium">{locale === 'lo' ? 'ຊຸດ' : 'Items'}</th>
                                    <th className="text-center px-4 py-3 font-medium">{locale === 'lo' ? 'ຈອງ' : 'Bookings'}</th>
                                    <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ເຂົ້າລະບົບ' : 'Joined'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-t border-gray-100 hover:bg-white/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-royal-navy">{u.name}</td>
                                        <td className="px-4 py-3 text-navy-600 font-mono text-xs">{u.phone}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${roleColors[u.role] || 'bg-gray-100'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-navy-600">{u._count.assets}</td>
                                        <td className="px-4 py-3 text-center text-navy-600">{u._count.bookings}</td>
                                        <td className="px-4 py-3 text-right text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('lo-LA')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* === BOOKINGS TAB === */}
            {activeTab === 'bookings' && (
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
                                        <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ເຈົ້າຂອງ' : 'Owner'}</th>
                                        <th className="text-center px-4 py-3 font-medium">{locale === 'lo' ? 'ວັນທີ' : 'Dates'}</th>
                                        <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ຄ່າເຊົ່າ' : 'Rental'}</th>
                                        <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ຄ່າບໍລິການ' : 'Fee'}</th>
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
                                            <td className="px-4 py-3 text-xs text-navy-600">{b.asset.owner.name}</td>
                                            <td className="px-4 py-3 text-center text-xs text-gray-400">
                                                {new Date(b.pickupDate).toLocaleDateString('lo-LA')} → {new Date(b.returnDate).toLocaleDateString('lo-LA')}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-xs text-royal-navy">{fmt(b.rentalFee)} ₭</td>
                                            <td className="px-4 py-3 text-right text-xs text-champagne-gold">{fmt(b.serviceFee)} ₭</td>
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
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                            {b.asset.product.images[0] ? (
                                                <img src={b.asset.product.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-5 h-5 m-3.5 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-royal-navy">
                                                {locale === 'lo' ? b.asset.product.titleLo : (b.asset.product.titleEn || b.asset.product.titleLo)}
                                            </p>
                                            <p className="text-xs text-navy-600">{b.asset.assetCode} · {b.asset.owner.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">👤 {b.renter.name}</p>
                                            <p className="text-xs text-gray-400">
                                                📅 {new Date(b.pickupDate).toLocaleDateString('lo-LA')} → {new Date(b.returnDate).toLocaleDateString('lo-LA')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${statusColors[b.status] || 'bg-gray-100'}`}>
                                            {b.status}
                                        </span>
                                        <p className="text-sm font-bold text-royal-navy mt-1">{fmt(b.rentalFee + b.serviceFee + b.deposit)} ₭</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* === REVENUE TAB === */}
            {activeTab === 'revenue' && (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-royal-navy to-royal-navy/80 rounded-3xl p-6 text-white">
                        <p className="text-sm text-white/70">{locale === 'lo' ? 'ລາຍໄດ້ Platform (Service Fee)' : 'Platform Revenue (Service Fees)'}</p>
                        <p className="text-4xl font-bold mt-2">{fmt(stats?.platformRevenue || 0)} <span className="text-lg font-normal text-white/70">₭</span></p>
                    </div>

                    <div className="glass rounded-2xl border border-white/60 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-royal-navy/5 text-royal-navy text-xs">
                                        <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ປະເພດ' : 'Type'}</th>
                                        <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ລາຍລະອຽດ' : 'Details'}</th>
                                        <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ຈຳນວນ' : 'Amount'}</th>
                                        <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ວັນທີ' : 'Date'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(txn => (
                                        <tr key={txn.id} className="border-t border-gray-100 hover:bg-white/50 transition-colors">
                                            <td className={`px-4 py-3 font-medium text-xs ${txnColors[txn.type] || 'text-gray-500'}`}>
                                                {txn.type}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-navy-600">
                                                {txn.booking
                                                    ? `${txn.booking.renter.name} → ${txn.booking.asset.owner.name} (${txn.booking.asset.assetCode})`
                                                    : (txn.note || '-')
                                                }
                                            </td>
                                            <td className={`px-4 py-3 text-right font-bold text-sm ${txnColors[txn.type] || 'text-gray-500'}`}>
                                                {fmt(txn.amount)} ₭
                                            </td>
                                            <td className="px-4 py-3 text-right text-xs text-gray-400">
                                                {new Date(txn.createdAt).toLocaleString('lo-LA')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
    return (
        <div className="glass rounded-2xl p-5 border border-white/60">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-navy-600 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
            </div>
        </div>
    )
}
