import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getOwnerAssets, getOwnerRevenueSummary, getOwnerRecentBookings } from '@/actions/owner'
import OwnerDashboard from '@/components/owner/OwnerDashboard'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function OwnerPage({ params }: Props) {
    const { locale } = await params

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }

    // Check role
    if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
        redirect(`/${locale}`)
    }

    const [assets, revenue, bookings] = await Promise.all([
        getOwnerAssets(),
        getOwnerRevenueSummary(),
        getOwnerRecentBookings(),
    ])

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-royal-navy mb-4 flex items-center gap-2">
                    🏪 {locale === 'lo' ? 'ຫ້ອງການເຈົ້າຂອງ' : 'Owner Dashboard'}
                </h1>
                <OwnerDashboard
                    assets={assets || []}
                    revenue={revenue}
                    bookings={bookings}
                    locale={locale}
                />
            </div>
        </div>
    )
}
