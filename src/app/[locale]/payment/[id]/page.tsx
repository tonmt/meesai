import { getBookingForPayment } from '@/actions/payment'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PaymentConfirm from '@/components/booking/PaymentConfirm'

type Props = {
    params: Promise<{ locale: string; id: string }>
}

export default async function PaymentPage({ params }: Props) {
    const { locale, id } = await params

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }

    const booking = await getBookingForPayment(id)
    if (!booking) {
        redirect(`/${locale}/bookings`)
    }

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <a href={`/${locale}/bookings`} className="text-navy-600 hover:text-champagne-gold transition-colors">
                        ← {locale === 'lo' ? 'ກັບໄປລາຍການ' : 'Back to Bookings'}
                    </a>
                    <span className="text-gray-300">|</span>
                    <h1 className="text-lg font-bold text-royal-navy">
                        {locale === 'lo' ? 'ຊຳລະເງິນ' : 'Payment'}
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <PaymentConfirm booking={booking} locale={locale} />
            </div>
        </div>
    )
}
