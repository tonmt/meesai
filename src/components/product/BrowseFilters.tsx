'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

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
    }
}

export default function BrowseFilters({ categories, sizes, locale, currentFilters }: Props) {
    const router = useRouter()
    const [searchValue, setSearchValue] = useState(currentFilters.search || '')
    const [showFilters, setShowFilters] = useState(false)

    function applyFilter(key: string, value: string | undefined) {
        const params = new URLSearchParams()
        const newFilters = { ...currentFilters, [key]: value }
        if (key !== 'page') params.delete('page') // Reset page

        if (newFilters.categoryId) params.set('category', newFilters.categoryId)
        if (newFilters.size) params.set('size', newFilters.size)
        if (newFilters.search) params.set('search', newFilters.search)
        if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice))
        if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice))

        router.push(`/${locale}/browse?${params.toString()}`)
    }

    function clearFilters() {
        setSearchValue('')
        router.push(`/${locale}/browse`)
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        applyFilter('search', searchValue || undefined)
    }

    const hasFilters = currentFilters.categoryId || currentFilters.size || currentFilters.search

    return (
        <div className="space-y-4">
            {/* Search + Toggle */}
            <div className="flex gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        placeholder={locale === 'lo' ? 'ຄົ້ນຫາຊຸດ...' : 'Search items...'}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
                    />
                </form>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5 ${showFilters || hasFilters
                            ? 'bg-champagne-gold text-royal-navy border-champagne-gold'
                            : 'bg-white border-gray-200 text-navy-600 hover:border-champagne-gold'
                        }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {locale === 'lo' ? 'ກັ່ນຕອງ' : 'Filter'}
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="glass rounded-2xl p-5 border border-white/60 space-y-4 animate-in slide-in-from-top duration-200">
                    {/* Categories */}
                    <div>
                        <label className="block text-xs font-medium text-navy-600 mb-2">
                            {locale === 'lo' ? 'ໝວດໝູ່' : 'Category'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => applyFilter('categoryId', undefined)}
                                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${!currentFilters.categoryId
                                        ? 'bg-champagne-gold text-royal-navy'
                                        : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                    }`}
                            >
                                {locale === 'lo' ? 'ທັງໝົດ' : 'All'}
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
                            {locale === 'lo' ? 'ໄຊສ໌' : 'Size'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => applyFilter('size', undefined)}
                                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${!currentFilters.size
                                        ? 'bg-champagne-gold text-royal-navy'
                                        : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                    }`}
                            >
                                {locale === 'lo' ? 'ທັງໝົດ' : 'All'}
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
