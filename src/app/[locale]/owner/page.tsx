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
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href={`/${locale}`} className="text-navy-600 hover:text-champagne-gold transition-colors">
                            ← {locale === 'lo' ? 'ໜ້າຫຼັກ' : 'Home'}
                        </a>
                        <span className="text-gray-300">|</span>
                        <h1 className="text-lg font-bold text-royal-navy">
                            {locale === 'lo' ? '🏪 ຫ້ອງການເຈົ້າຂອງ' : '🏪 Owner Dashboard'}
                        </h1>
                    </div>
                    <span className="text-sm text-navy-600">{session.user.name}</span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
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
