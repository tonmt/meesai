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
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-royal-navy mb-4 flex items-center gap-2">
                    ⚙️ {locale === 'lo' ? 'ແອັດມິນ' : 'Admin Panel'}
                </h1>
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
