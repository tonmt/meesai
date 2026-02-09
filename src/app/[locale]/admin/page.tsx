import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAdminStats, getAdminUsers, getAdminBookings, getAdminTransactions } from '@/actions/admin'
import AdminDashboard from '@/components/admin/AdminDashboard'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function AdminPage({ params }: Props) {
    const { locale } = await params

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }
    if (session.user.role !== 'ADMIN') {
        redirect(`/${locale}`)
    }

    const [stats, users, bookingsData, txnData] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminBookings(),
        getAdminTransactions(),
    ])

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href={`/${locale}`} className="text-navy-600 hover:text-champagne-gold transition-colors">
                            ← {locale === 'lo' ? 'ໜ້າຫຼັກ' : 'Home'}
                        </a>
                        <span className="text-gray-300">|</span>
                        <h1 className="text-lg font-bold text-royal-navy">
                            {locale === 'lo' ? '⚙️ ແອັດມິນ' : '⚙️ Admin Panel'}
                        </h1>
                    </div>
                    <span className="text-sm text-navy-600">🔑 {session.user.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <AdminDashboard
                    stats={stats}
                    users={users}
                    bookings={bookingsData.bookings}
                    transactions={txnData.transactions}
                    locale={locale}
                />
            </div>
        </div>
    )
}
