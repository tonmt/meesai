import { getMyBookings } from '@/actions/booking'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MyBookingsList from '@/components/booking/MyBookingsList'
import { getTranslations } from 'next-intl/server'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function MyBookingsPage({ params }: Props) {
    const { locale } = await params
    const t = await getTranslations('bookings_page')

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }

    const bookings = await getMyBookings()

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-royal-navy mb-4">
                    {t('title')}
                </h1>
                <MyBookingsList bookings={bookings} locale={locale} />
            </div>
        </div>
    )
}
