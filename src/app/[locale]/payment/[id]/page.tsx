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
            <div className="max-w-3xl mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-royal-navy mb-6">
                    {locale === 'lo' ? 'ຊຳລະເງິນ' : 'Payment'}
                </h1>
                <PaymentConfirm booking={booking} locale={locale} />
            </div>
        </div>
    )
}
