import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/actions/profile'
import ProfilePanel from '@/components/account/ProfilePanel'

type Props = {
    params: Promise<{ locale: string }>
}

export default async function AccountPage({ params }: Props) {
    const { locale } = await params

    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }

    const profile = await getUserProfile()
    if (!profile) {
        redirect(`/${locale}/login`)
    }

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-xl font-bold text-royal-navy mb-6">
                    {locale === 'lo' ? '👤 ບັນຊີຂອງຂ້ອຍ' : '👤 My Account'}
                </h1>
                <ProfilePanel profile={profile} locale={locale} />
            </div>
        </div>
    )
}
