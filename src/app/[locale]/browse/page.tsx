import { browseProducts, getCategories, getAvailableSizes } from '@/actions/browse'
import Link from 'next/link'
import { Search, Filter, Package, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import BrowseFilters from '@/components/product/BrowseFilters'

type Props = {
    params: Promise<{ locale: string }>
    searchParams: Promise<{
        page?: string
        category?: string
        size?: string
        search?: string
        minPrice?: string
        maxPrice?: string
    }>
}

export default async function BrowsePage({ params, searchParams }: Props) {
    const { locale } = await params
    const sp = await searchParams

    const page = parseInt(sp.page || '1', 10)
    const filters = {
        categoryId: sp.category || undefined,
        size: sp.size || undefined,
        search: sp.search || undefined,
        minPrice: sp.minPrice ? parseInt(sp.minPrice, 10) : undefined,
        maxPrice: sp.maxPrice ? parseInt(sp.maxPrice, 10) : undefined,
    }

    const [result, categories, sizes] = await Promise.all([
        browseProducts(page, 12, filters),
        getCategories(),
        getAvailableSizes(),
    ])

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <a href={`/${locale}`} className="text-navy-600 hover:text-champagne-gold transition-colors flex items-center gap-1">
                            <ChevronLeft className="w-4 h-4" />
                            {locale === 'lo' ? 'ໜ້າຫຼັກ' : 'Home'}
                        </a>
                        <span className="text-gray-300">|</span>
                        <h1 className="text-lg font-bold text-royal-navy">
                            {locale === 'lo' ? 'ເບິ່ງຊຸດທັງໝົດ' : 'Browse All'}
                        </h1>
                    </div>
                    <span className="text-sm text-navy-600">
                        {result.total} {locale === 'lo' ? 'ລາຍການ' : 'items'}
                    </span>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Filters */}
                <BrowseFilters
                    categories={categories}
                    sizes={sizes}
                    locale={locale}
                    currentFilters={filters}
                />

                {/* Products Grid */}
                {result.products.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-royal-navy mb-2">
                            {locale === 'lo' ? 'ບໍ່ພົບສິນຄ້າ' : 'No items found'}
                        </h3>
                        <p className="text-navy-600 mb-6">
                            {locale === 'lo' ? 'ລອງປ່ຽນ filter ຫຼື ຄົ້ນຫາໃໝ່' : 'Try different filters or search terms'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                        {result.products.map(product => {
                            const availCount = product._count.assets

                            return (
                                <Link
                                    key={product.id}
                                    href={`/${locale}/product/${product.id}`}
                                    className="group glass rounded-2xl overflow-hidden border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Image */}
                                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                                        {product.images.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.titleLo}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package className="w-10 h-10" />
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-2 left-2">
                                            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-royal-navy text-[10px] font-bold rounded-full shadow">
                                                {locale === 'lo' ? product.category.nameLo : product.category.nameEn}
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${availCount > 0 ? 'bg-emerald/90 text-white' : 'bg-red-500/90 text-white'
                                                }`}>
                                                {availCount > 0 ? `${availCount} ✓` : (locale === 'lo' ? 'ເຕັມ' : 'Full')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm text-royal-navy truncate">
                                            {locale === 'lo' ? product.titleLo : (product.titleEn || product.titleLo)}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">{product.size}</span>
                                            {product.color && <span className="text-xs text-gray-400">· {product.color}</span>}
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-lg font-bold text-danger">
                                                {new Intl.NumberFormat('lo-LA').format(product.rentalPrice)}
                                            </span>
                                            <span className="text-xs text-navy-600">₭</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {result.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {page > 1 && (
                            <Link
                                href={`/${locale}/browse?page=${page - 1}${sp.category ? `&category=${sp.category}` : ''}${sp.size ? `&size=${sp.size}` : ''}${sp.search ? `&search=${sp.search}` : ''}`}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-navy-600 hover:border-champagne-gold transition-all flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {locale === 'lo' ? 'ກ່ອນ' : 'Prev'}
                            </Link>
                        )}

                        {Array.from({ length: result.totalPages }, (_, i) => (
                            <Link
                                key={i + 1}
                                href={`/${locale}/browse?page=${i + 1}${sp.category ? `&category=${sp.category}` : ''}${sp.size ? `&size=${sp.size}` : ''}${sp.search ? `&search=${sp.search}` : ''}`}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${page === i + 1
                                        ? 'bg-champagne-gold text-royal-navy shadow-md'
                                        : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                    }`}
                            >
                                {i + 1}
                            </Link>
                        ))}

                        {page < result.totalPages && (
                            <Link
                                href={`/${locale}/browse?page=${page + 1}${sp.category ? `&category=${sp.category}` : ''}${sp.size ? `&size=${sp.size}` : ''}${sp.search ? `&search=${sp.search}` : ''}`}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-navy-600 hover:border-champagne-gold transition-all flex items-center gap-1"
                            >
                                {locale === 'lo' ? 'ຖັດໄປ' : 'Next'}
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
