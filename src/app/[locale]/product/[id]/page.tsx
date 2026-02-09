import { getProductFullDetail } from '@/actions/browse'
import { redirect } from 'next/navigation'
import { Star, Shield, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import AvailabilityCalendar from '@/components/product/AvailabilityCalendar'
import Link from 'next/link'

type Props = {
    params: Promise<{ locale: string; id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
    const { locale, id } = await params

    const product = await getProductFullDetail(id)
    if (!product) {
        redirect(`/${locale}/browse`)
    }

    const availableAssets = product.assets.filter(a => a.status === 'AVAILABLE')
    // Collect all bookings across assets for calendar
    const allBookings = product.assets.flatMap(a =>
        a.bookings.map(b => ({
            pickupDate: b.pickupDate,
            returnDate: b.returnDate,
            bufferEnd: b.bufferEnd,
            status: b.status,
        }))
    )

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href={`/${locale}/browse`} className="text-navy-600 hover:text-champagne-gold transition-colors flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" />
                            {locale === 'lo' ? 'ກັບຄືນ' : 'Back'}
                        </a>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-gray-400">
                            {locale === 'lo' ? product.category.nameLo : product.category.nameEn}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden shadow-xl relative group">
                            {product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.titleLo}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Shield className="w-24 h-24" />
                                </div>
                            )}

                            {/* Top badges */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-royal-navy text-xs font-bold rounded-full shadow">
                                    {locale === 'lo' ? product.category.nameLo : product.category.nameEn}
                                </span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full shadow ${availableAssets.length > 0
                                    ? 'bg-emerald/90 text-white'
                                    : 'bg-red-500/90 text-white'
                                    }`}>
                                    {availableAssets.length > 0
                                        ? (locale === 'lo' ? 'ຫວ່າງ' : 'Available')
                                        : (locale === 'lo' ? 'ເຕັມ' : 'All Booked')
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Thumbnail Grid (if multiple images) */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.slice(0, 4).map((img, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${i === 0 ? 'border-champagne-gold shadow-md' : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-6">
                        {/* Title + Price */}
                        <div>
                            <h1 className="text-3xl font-bold text-royal-navy mb-2">
                                {locale === 'lo' ? product.titleLo : (product.titleEn || product.titleLo)}
                            </h1>
                            {product.description && (
                                <p className="text-navy-600 text-sm leading-relaxed">
                                    {product.description}
                                </p>
                            )}

                            <div className="flex items-baseline gap-3 mt-4">
                                <span className="text-4xl font-bold text-danger">
                                    {new Intl.NumberFormat('lo-LA').format(product.rentalPrice)}
                                </span>
                                <span className="text-lg text-navy-600">₭ / {locale === 'lo' ? 'ຄັ້ງ' : 'rental'}</span>
                            </div>
                            {product.buyPrice && (
                                <p className="text-sm text-gray-400 mt-1">
                                    {locale === 'lo' ? 'ມູນຄ່າ' : 'Original value'}: <span className="line-through">{new Intl.NumberFormat('lo-LA').format(product.buyPrice)} ₭</span>
                                </p>
                            )}
                        </div>

                        {/* Specs */}
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <h3 className="text-sm font-bold text-royal-navy mb-3">
                                {locale === 'lo' ? 'ລາຍລະອຽດ' : 'Details'}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-royal-navy/5 rounded-xl p-3 text-center">
                                    <p className="text-xs text-navy-600">{locale === 'lo' ? 'ໄຊສ໌' : 'Size'}</p>
                                    <p className="text-lg font-bold text-royal-navy">{product.size}</p>
                                </div>
                                {product.color && (
                                    <div className="bg-champagne-gold/5 rounded-xl p-3 text-center">
                                        <p className="text-xs text-navy-600">{locale === 'lo' ? 'ສີ' : 'Color'}</p>
                                        <p className="text-lg font-bold text-champagne-gold">{product.color}</p>
                                    </div>
                                )}
                                {product.brand && (
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-xs text-navy-600">{locale === 'lo' ? 'ແບຣນ' : 'Brand'}</p>
                                        <p className="text-lg font-bold text-navy-600">{product.brand}</p>
                                    </div>
                                )}
                                <div className="bg-emerald/5 rounded-xl p-3 text-center">
                                    <p className="text-xs text-navy-600">{locale === 'lo' ? 'ພ້ອມເຊົ່າ' : 'Available'}</p>
                                    <p className="text-lg font-bold text-emerald">{availableAssets.length} / {product.assets.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Asset Grades */}
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <h3 className="text-sm font-bold text-royal-navy mb-3">
                                {locale === 'lo' ? 'ຊຸດທີ່ມີ' : 'Available Items'}
                            </h3>
                            <div className="space-y-2">
                                {product.assets.map(asset => (
                                    <div key={asset.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${asset.status === 'AVAILABLE' ? 'bg-emerald' : 'bg-amber-400'}`} />
                                            <span className="text-sm font-mono text-navy-600">{asset.assetCode}</span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${asset.grade === 'A' ? 'bg-amber-100 text-amber-700' :
                                                asset.grade === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                Grade {asset.grade}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-medium ${asset.status === 'AVAILABLE' ? 'text-emerald' : 'text-amber-500'}`}>
                                            {asset.status === 'AVAILABLE'
                                                ? (locale === 'lo' ? 'ພ້ອມ' : 'Ready')
                                                : (locale === 'lo' ? 'ຈອງແລ້ວ' : 'Reserved')
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Availability Calendar */}
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <AvailabilityCalendar bookings={allBookings} locale={locale} />
                        </div>

                        {/* Book Button */}
                        <Link
                            href={`/${locale}/booking/${product.id}`}
                            className={`block w-full py-4 text-center font-bold rounded-xl text-lg shadow-xl transition-all ${availableAssets.length > 0
                                ? 'bg-champagne-gold text-royal-navy hover:bg-champagne-gold/90 shadow-champagne-gold/20'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                                }`}
                        >
                            {availableAssets.length > 0
                                ? (locale === 'lo' ? 'ຈອງດຽວນີ້' : 'Book Now')
                                : (locale === 'lo' ? 'ເຕັມແລ້ວ' : 'Fully Booked')
                            }
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
