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
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-royal-navy">
                        {locale === 'lo' ? 'ເບິ່ງຊຸດທັງໝົດ' : 'Browse All'}
                    </h1>
                    <span className="text-sm text-navy-600">
                        {result.total} {locale === 'lo' ? 'ລາຍການ' : 'items'}
                    </span>
                </div>
                {/* Filters */}
                <BrowseFilters
                    categories={categories}
                    sizes={sizes}
                    locale={locale}
                    currentFilters={filters}
                />

                {/* Products */}
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
                    <>
                        {/* === Desktop: Rich List View === */}
                        <div className="hidden md:block mt-6 glass rounded-2xl border border-white/60 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-royal-navy/5 text-royal-navy text-xs">
                                            <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ສິນຄ້າ' : 'Product'}</th>
                                            <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ໝວດໝູ່' : 'Category'}</th>
                                            <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ໄຊສ໌' : 'Size'}</th>
                                            <th className="text-left px-4 py-3 font-medium">{locale === 'lo' ? 'ສີ' : 'Color'}</th>
                                            <th className="text-right px-4 py-3 font-medium">{locale === 'lo' ? 'ຄ່າເຊົ່າ' : 'Rental'}</th>
                                            <th className="text-center px-4 py-3 font-medium">{locale === 'lo' ? 'ສະຖານະ' : 'Status'}</th>
                                            <th className="text-center px-4 py-3 font-medium"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.products.map(product => {
                                            const availCount = product._count.assets
                                            return (
                                                <tr key={product.id} className="border-t border-gray-100 hover:bg-white/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <Link href={`/${locale}/product/${product.id}`} className="flex items-center gap-3 group">
                                                            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                                                                {product.images[0] ? (
                                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                                ) : (
                                                                    <Package className="w-6 h-6 m-4 text-gray-300" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-royal-navy group-hover:text-champagne-gold transition-colors">
                                                                    {locale === 'lo' ? product.titleLo : (product.titleEn || product.titleLo)}
                                                                </p>
                                                                {product.brand && <p className="text-xs text-gray-400">{product.brand}</p>}
                                                            </div>
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-0.5 bg-royal-navy/5 text-royal-navy text-xs font-medium rounded-full">
                                                            {locale === 'lo' ? product.category.nameLo : product.category.nameEn}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-navy-600">{product.size}</td>
                                                    <td className="px-4 py-3 text-navy-600">{product.color || '—'}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="text-lg font-bold text-danger">{new Intl.NumberFormat('lo-LA').format(product.rentalPrice)}</span>
                                                        <span className="text-xs text-navy-600 ml-1">₭</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${availCount > 0 ? 'bg-emerald/10 text-emerald' : 'bg-red-50 text-red-500'}`}>
                                                            {availCount > 0 ? `${availCount} ${locale === 'lo' ? 'ພ້ອມ' : 'avail'}` : (locale === 'lo' ? 'ເຕັມ' : 'Full')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Link
                                                            href={`/${locale}/product/${product.id}`}
                                                            className="px-4 py-1.5 bg-champagne-gold/10 text-champagne-gold text-xs font-bold rounded-lg hover:bg-champagne-gold hover:text-white transition-all"
                                                        >
                                                            {locale === 'lo' ? 'ເບິ່ງ' : 'View'}
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* === Mobile: Card Grid === */}
                        <div className="md:hidden grid grid-cols-2 gap-3 mt-6">
                            {result.products.map(product => {
                                const availCount = product._count.assets
                                return (
                                    <Link
                                        key={product.id}
                                        href={`/${locale}/product/${product.id}`}
                                        className="group glass rounded-2xl overflow-hidden border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                                            {product.images.length > 0 ? (
                                                <img src={product.images[0]} alt={product.titleLo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-10 h-10" /></div>
                                            )}
                                            <div className="absolute top-2 left-2">
                                                <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-royal-navy text-[10px] font-bold rounded-full shadow">
                                                    {locale === 'lo' ? product.category.nameLo : product.category.nameEn}
                                                </span>
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${availCount > 0 ? 'bg-emerald/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                                    {availCount > 0 ? `${availCount} ✓` : (locale === 'lo' ? 'ເຕັມ' : 'Full')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-bold text-sm text-royal-navy truncate">
                                                {locale === 'lo' ? product.titleLo : (product.titleEn || product.titleLo)}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">{product.size}</span>
                                                {product.color && <span className="text-xs text-gray-400">· {product.color}</span>}
                                            </div>
                                            <div className="flex items-baseline gap-1 mt-2">
                                                <span className="text-lg font-bold text-danger">{new Intl.NumberFormat('lo-LA').format(product.rentalPrice)}</span>
                                                <span className="text-xs text-navy-600">₭</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </>
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
