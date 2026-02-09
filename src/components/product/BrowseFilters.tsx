'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

type Category = {
    id: string
    nameLo: string
    nameEn: string
    _count: { products: number }
}

type Props = {
    categories: Category[]
    sizes: string[]
    locale: string
    currentFilters: {
        categoryId?: string
        size?: string
        search?: string
        minPrice?: number
        maxPrice?: number
        sort?: string
        availableOnly?: boolean
    }
}

export default function BrowseFilters({ categories, sizes, locale, currentFilters }: Props) {
    const router = useRouter()
    const t = useTranslations('browse')
    const [searchValue, setSearchValue] = useState(currentFilters.search || '')
    const [showFilters, setShowFilters] = useState(false)
    const [minPrice, setMinPrice] = useState(currentFilters.minPrice ? String(currentFilters.minPrice) : '')
    const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice ? String(currentFilters.maxPrice) : '')

    function applyFilter(key: string, value: string | undefined) {
        const params = new URLSearchParams()
        const newFilters = { ...currentFilters, [key]: value }
        if (key !== 'page') params.delete('page')

        if (newFilters.categoryId) params.set('category', newFilters.categoryId)
        if (newFilters.size) params.set('size', newFilters.size)
        if (newFilters.search) params.set('search', newFilters.search)
        if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice))
        if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice))
        if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort)
        if (newFilters.availableOnly) params.set('available', '1')

        router.push(`/${locale}/browse?${params.toString()}`)
    }

    function clearFilters() {
        setSearchValue('')
        setMinPrice('')
        setMaxPrice('')
        router.push(`/${locale}/browse`)
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        applyFilter('search', searchValue || undefined)
    }

    function handlePriceApply() {
        const params = new URLSearchParams()
        const newFilters = { ...currentFilters }
        if (minPrice) newFilters.minPrice = parseInt(minPrice, 10)
        else delete newFilters.minPrice
        if (maxPrice) newFilters.maxPrice = parseInt(maxPrice, 10)
        else delete newFilters.maxPrice

        if (newFilters.categoryId) params.set('category', newFilters.categoryId)
        if (newFilters.size) params.set('size', newFilters.size)
        if (newFilters.search) params.set('search', newFilters.search)
        if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice))
        if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice))
        if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort)
        if (newFilters.availableOnly) params.set('available', '1')

        router.push(`/${locale}/browse?${params.toString()}`)
    }

    const hasFilters = currentFilters.categoryId || currentFilters.size || currentFilters.search || currentFilters.minPrice || currentFilters.maxPrice || currentFilters.availableOnly

    return (
        <div className="space-y-4">
            {/* Search + Sort + Toggle */}
            <div className="flex gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        placeholder={t('no_items') === 'ບໍ່ພົບສິນຄ້າ' ? 'ຄົ້ນຫາຊຸດ...' : 'Search items...'}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
                    />
                </form>

                {/* Sort Dropdown */}
                <select
                    value={currentFilters.sort || 'newest'}
                    onChange={e => applyFilter('sort', e.target.value)}
                    className="px-3 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-navy-600 focus:outline-none focus:border-champagne-gold cursor-pointer"
                >
                    <option value="newest">{t('newest')}</option>
                    <option value="price_asc">{t('price_low')}</option>
                    <option value="price_desc">{t('price_high')}</option>
                </select>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5 ${showFilters || hasFilters
                        ? 'bg-champagne-gold text-royal-navy border-champagne-gold'
                        : 'bg-white border-gray-200 text-navy-600 hover:border-champagne-gold'
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {t('filter')}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="glass rounded-2xl p-5 border border-white/60 space-y-4 animate-in slide-in-from-top duration-200">
                    {/* Categories */}
                    <div>
                        <label className="block text-xs font-medium text-navy-600 mb-2">
                            {t('category')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => applyFilter('categoryId', undefined)}
                                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${!currentFilters.categoryId
                                    ? 'bg-champagne-gold text-royal-navy'
                                    : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                    }`}
                            >
                                {t('all_categories')}
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => applyFilter('categoryId', cat.id)}
                                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${currentFilters.categoryId === cat.id
                                        ? 'bg-champagne-gold text-royal-navy'
                                        : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                        }`}
                                >
                                    {locale === 'lo' ? cat.nameLo : cat.nameEn} ({cat._count.products})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sizes */}
                    <div>
                        <label className="block text-xs font-medium text-navy-600 mb-2">
                            {t('size')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => applyFilter('size', undefined)}
                                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${!currentFilters.size
                                    ? 'bg-champagne-gold text-royal-navy'
                                    : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                    }`}
                            >
                                {t('all_categories')}
                            </button>
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => applyFilter('size', size)}
                                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${currentFilters.size === size
                                        ? 'bg-champagne-gold text-royal-navy'
                                        : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <label className="block text-xs font-medium text-navy-600 mb-2">
                            {t('rental')} (₭)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                placeholder="Min"
                                className="w-28 px-3 py-2 bg-white/80 border border-gray-200 rounded-lg text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                            />
                            <span className="text-gray-400">—</span>
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                placeholder="Max"
                                className="w-28 px-3 py-2 bg-white/80 border border-gray-200 rounded-lg text-sm text-royal-navy focus:outline-none focus:border-champagne-gold"
                            />
                            <button
                                onClick={handlePriceApply}
                                className="px-3 py-2 bg-champagne-gold/10 text-champagne-gold text-xs font-bold rounded-lg hover:bg-champagne-gold hover:text-white transition-all"
                            >
                                OK
                            </button>
                        </div>
                    </div>

                    {/* Available Only Toggle */}
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!currentFilters.availableOnly}
                                onChange={e => applyFilter('availableOnly', e.target.checked ? '1' : undefined)}
                                className="w-4 h-4 rounded border-gray-300 text-champagne-gold focus:ring-champagne-gold/20"
                            />
                            <span className="text-sm text-navy-600">{t('show_available')}</span>
                        </label>
                    </div>

                    {/* Clear */}
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-red-500 flex items-center gap-1 hover:text-red-600 transition-colors"
                        >
                            <X className="w-3 h-3" />
                            {locale === 'lo' ? 'ລ້າງ filter' : 'Clear filters'}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
