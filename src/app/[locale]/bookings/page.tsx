import { getMyBookings } from '@/actions/booking'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MyBookingsList from '@/components/booking/MyBookingsList'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function MyBookingsPage({ params }: Props) {
    const { locale } = await params

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }

    const bookings = await getMyBookings()

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
                    <a href={`/${locale}`} className="text-navy-600 hover:text-champagne-gold transition-colors">
                        ← {locale === 'lo' ? 'ກັບຄືນ' : 'Back'}
                    </a>
                    <span className="text-gray-300">|</span>
                    <h1 className="text-lg font-bold text-royal-navy">
                        {locale === 'lo' ? 'ການຈອງຂອງຂ້ອຍ' : 'My Bookings'}
                    </h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <MyBookingsList bookings={bookings} locale={locale} />
            </div>
        </div>
    )
}
