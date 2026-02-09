import { getProductDetail } from '@/actions/booking'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BookingForm from '@/components/booking/BookingForm'

type Props = {
    params: Promise<{ locale: string; id: string }>
}

export default async function BookingPage({ params }: Props) {
    const { locale, id } = await params

    // Auth guard
    const session = await auth()
    if (!session?.user) {
        redirect(`/${locale}/login`)
    }

    // Get product detail
    const product = await getProductDetail(id)
    if (!product) {
        redirect(`/${locale}`)
    }

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
                    <a href={`/${locale}`} className="text-navy-600 hover:text-champagne-gold transition-colors">
                        ← {locale === 'lo' ? 'ກັບຄືນ' : 'Back'}
                    </a>
                    <span className="text-gray-300">|</span>
                    <h1 className="text-lg font-bold text-royal-navy truncate">
                        {locale === 'lo' ? product.titleLo : (product.titleEn || product.titleLo)}
                    </h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="space-y-4">
                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-xl">
                            {product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.titleLo}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="glass rounded-2xl p-6 border border-white/60">
                            <h2 className="text-xl font-bold text-royal-navy mb-3">
                                {locale === 'lo' ? product.titleLo : (product.titleEn || product.titleLo)}
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 bg-royal-navy/10 text-royal-navy text-sm rounded-full font-medium">
                                    {product.size}
                                </span>
                                {product.color && (
                                    <span className="px-3 py-1 bg-champagne-gold/10 text-champagne-gold text-sm rounded-full font-medium">
                                        {product.color}
                                    </span>
                                )}
                                {product.brand && (
                                    <span className="px-3 py-1 bg-gray-100 text-navy-600 text-sm rounded-full">
                                        {product.brand}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-emerald/10 text-emerald text-sm rounded-full font-medium">
                                    {locale === 'lo' ? product.category.nameLo : product.category.nameEn}
                                </span>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-danger">
                                        {new Intl.NumberFormat('lo-LA').format(product.rentalPrice)}
                                    </span>
                                    <span className="text-sm text-navy-600">₭ / {locale === 'lo' ? 'ຄັ້ງ' : 'time'}</span>
                                </div>
                                {product.buyPrice && (
                                    <p className="text-sm text-gray-400 line-through mt-1">
                                        {locale === 'lo' ? 'ມູນຄ່າ' : 'Value'}: {new Intl.NumberFormat('lo-LA').format(product.buyPrice)} ₭
                                    </p>
                                )}
                            </div>

                            {/* Available Assets */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-navy-600">
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald mr-2" />
                                    {product.assets.length} {locale === 'lo' ? 'ຕົວພ້ອມເຊົ່າ' : 'available'}
                                    {product.assets.map(a => (
                                        <span key={a.id} className="ml-2 text-xs text-gray-400">
                                            Grade {a.grade}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <BookingForm
                        product={product}
                        locale={locale}
                        userId={session.user.id}
                    />
                </div>
            </div>
        </div>
    )
}
