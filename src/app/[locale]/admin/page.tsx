import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAdminStats, getAdminUsers, getAdminBookings, getAdminTransactions } from '@/actions/admin'
import { getAdminProducts } from '@/actions/product-crud'
import { getCategories } from '@/actions/browse'
import AdminDashboard from '@/components/admin/AdminDashboard'
import { getTranslations } from 'next-intl/server'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function AdminPage({ params }: Props) {
    const { locale } = await params
    const t = await getTranslations('admin')

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }
    if (session.user.role !== 'ADMIN') {
        redirect(`/${locale}`)
    }

    const [stats, users, bookingsData, txnData, productsData, categories] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminBookings(),
        getAdminTransactions(),
        getAdminProducts(),
        getCategories(),
    ])

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-royal-navy mb-4 flex items-center gap-2">
                    ⚙️ {t('title')}
                </h1>
                <AdminDashboard
                    stats={stats}
                    users={users}
                    bookings={bookingsData.bookings}
                    transactions={txnData.transactions}
                    products={productsData.products}
                    productTotal={productsData.total}
                    categories={categories}
                    locale={locale}
                />
            </div>
        </div>
    )
}

