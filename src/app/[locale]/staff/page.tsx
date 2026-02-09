import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getStaffTodayBookings } from '@/actions/staff'
import StaffPanel from '@/components/staff/StaffPanel'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function StaffPage({ params }: Props) {
    const { locale } = await params

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }
    if (!['STAFF', 'ADMIN'].includes(session.user.role)) {
        redirect(`/${locale}`)
    }

    const todayBookings = await getStaffTodayBookings()

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-royal-navy mb-4 flex items-center gap-2">
                    📋 {locale === 'lo' ? 'ປະຈຳການ' : 'Staff Panel'}
                </h1>
                <StaffPanel
                    todayBookings={todayBookings}
                    locale={locale}
                    staffName={session.user.name || 'Staff'}
                />
            </div>
        </div>
    )
}
