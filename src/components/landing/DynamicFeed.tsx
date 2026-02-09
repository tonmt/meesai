'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Heart, ArrowRight, Shirt, SlidersHorizontal, X, Lock } from 'lucide-react';
import { useState } from 'react';
import type { FeedProduct } from '@/actions/products';

type Category = {
    id: string;
    nameLo: string;
    nameEn: string;
    icon: string;
    slug: string;
};

type Props = {
    products: FeedProduct[];
    categories: Category[];
};

function formatPrice(price: number): string {
    return new Intl.NumberFormat('lo-LA').format(price);
}

export default function DynamicFeed({ products, categories }: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const [activeFilter, setActiveFilter] = useState('all');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const allCategory = { id: 'all', nameLo: 'ທັງໝົດ', nameEn: 'All', icon: '🔥', slug: 'all' };
    const allCategories = [allCategory, ...categories];

    const filteredProducts = activeFilter === 'all'
        ? products
        : products.filter(p => p.category.slug === activeFilter);

    return (
        <section className="py-16 px-4 bg-cream/50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-royal-navy" style={{ fontFamily: 'var(--font-serif-lao)' }}>
                        {t('feed.title')}
                    </h3>
                    <button className="flex items-center gap-1 text-champagne-gold hover:underline text-sm font-medium">
                        <span>{locale === 'lo' ? 'ເບິ່ງທັງໝົດ' : 'View All'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Mobile Filter Chips */}
                <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-4">
                    <button
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-royal-navy text-white rounded-full text-sm"
                        onClick={() => setMobileFilterOpen(true)}
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{locale === 'lo' ? 'ກັ່ນຕອງ' : 'Filter'}</span>
                    </button>
                    {allCategories.map(cat => (
                        <button
                            key={cat.slug}
                            onClick={() => setActiveFilter(cat.slug)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === cat.slug
                                ? 'bg-champagne-gold text-royal-navy'
                                : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                }`}
                        >
                            {cat.icon} {locale === 'lo' ? cat.nameLo : cat.nameEn}
                        </button>
                    ))}
                </div>

                {/* Desktop: Sidebar + Grid */}
                <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
                    {/* Desktop Sidebar Filter */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                            <h4 className="text-lg font-bold text-royal-navy">{locale === 'lo' ? 'ກັ່ນຕອງ' : 'Filters'}</h4>

                            {/* Category */}
                            <div>
                                <h5 className="text-sm font-semibold text-navy-600 mb-3">{locale === 'lo' ? 'ປະເພດ' : 'Category'}</h5>
                                <div className="space-y-2">
                                    {allCategories.map(cat => (
                                        <button
                                            key={cat.slug}
                                            onClick={() => setActiveFilter(cat.slug)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeFilter === cat.slug
                                                ? 'bg-champagne-gold/10 text-champagne-gold font-medium border border-champagne-gold/20'
                                                : 'text-navy-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {cat.icon} {locale === 'lo' ? cat.nameLo : cat.nameEn}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range — Coming Soon */}
                            <div className="opacity-50">
                                <h5 className="text-sm font-semibold text-navy-600 mb-2 flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" />
                                    {locale === 'lo' ? 'ຕົວກັ່ນຕອງເພີ່ມເຕີມ' : 'More Filters'}
                                </h5>
                                <p className="text-xs text-navy-600/60">
                                    {locale === 'lo' ? 'ຂະໜາດ, ລາຄາ — ເປີດໃຊ້ໃນ Sprint 4' : 'Size, Price — Coming in Sprint 4'}
                                </p>
                            </div>

                            {/* Product Count */}
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-sm text-navy-600">
                                    {locale === 'lo' ? `ພົບ ${filteredProducts.length} ລາຍການ` : `${filteredProducts.length} items found`}
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                        {filteredProducts.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-navy-600">{locale === 'lo' ? 'ບໍ່ພົບລາຍການ' : 'No items found'}</p>
                            </div>
                        ) : (
                            filteredProducts.map((item) => (
                                <div key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    {/* Image */}
                                    <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                        {item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={locale === 'lo' ? item.titleLo : (item.titleEn || item.titleLo)}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
                                                <Shirt className="w-12 h-12" />
                                                {item.brand && (
                                                    <span className="text-xs text-gray-400 font-medium">{item.brand}</span>
                                                )}
                                            </div>
                                        )}
                                        {/* Available Badge */}
                                        {item.availableCount > 0 && (
                                            <div className="absolute top-3 left-3">
                                                <span className="px-2.5 py-1 bg-emerald text-white text-[11px] font-bold rounded-full shadow-lg">
                                                    {t('feed.available')}
                                                </span>
                                            </div>
                                        )}
                                        {/* Wishlist */}
                                        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:text-danger transition-all shadow-sm sm:opacity-0 sm:group-hover:opacity-100">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                        {/* Size + Color */}
                                        <div className="absolute bottom-3 right-3 flex gap-1.5">
                                            {item.color && (
                                                <span className="px-2 py-1 bg-white/90 text-royal-navy text-xs rounded-lg">
                                                    {item.color}
                                                </span>
                                            )}
                                            <span className="px-2 py-1 bg-royal-navy/80 text-white text-xs font-bold rounded-lg">
                                                {item.size}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h4 className="text-sm lg:text-base font-semibold text-royal-navy line-clamp-2 mb-2 min-h-[2.5rem]">
                                            {locale === 'lo' ? item.titleLo : (item.titleEn || item.titleLo)}
                                        </h4>
                                        {item.buyPrice && (
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs text-gray-400 line-through">
                                                    {formatPrice(item.buyPrice)} {t('feed.currency')}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-lg font-bold text-danger">
                                                {formatPrice(item.rentalPrice)} {t('feed.currency')}
                                            </span>
                                        </div>
                                        <button
                                            disabled
                                            title={locale === 'lo' ? 'ເປີດໃຫ້ບໍລິການໃນ Sprint 4' : 'Coming in Sprint 4'}
                                            className="w-full mt-3 py-2 bg-royal-navy/50 text-white/70 text-sm font-medium rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                                        >
                                            <Lock className="w-3 h-3" />
                                            {t('feed.quick_book')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Mobile Filter Bottom Sheet */}
                {mobileFilterOpen && (
                    <div className="fixed inset-0 z-[60] lg:hidden">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFilterOpen(false)} />
                        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] overflow-y-auto animate-slide-in-up">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-bold text-royal-navy">{locale === 'lo' ? 'ກັ່ນຕອງ' : 'Filters'}</h4>
                                    <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-navy-600">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                {/* Category */}
                                <div className="mb-6">
                                    <h5 className="text-sm font-semibold text-navy-600 mb-3">{locale === 'lo' ? 'ປະເພດ' : 'Category'}</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {allCategories.map(cat => (
                                            <button
                                                key={cat.slug}
                                                onClick={() => setActiveFilter(cat.slug)}
                                                className={`px-4 py-2 rounded-full text-sm transition-all ${activeFilter === cat.slug
                                                    ? 'bg-champagne-gold text-royal-navy font-medium'
                                                    : 'bg-gray-50 border border-gray-200 text-navy-600'
                                                    }`}
                                            >
                                                {cat.icon} {locale === 'lo' ? cat.nameLo : cat.nameEn}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Coming Soon Note */}
                                <div className="mb-6 opacity-50">
                                    <p className="text-xs text-navy-600/60 flex items-center gap-1.5">
                                        <Lock className="w-3 h-3" />
                                        {locale === 'lo' ? 'ຕົວກັ່ນຕອງ ຂະໜາດ/ລາຄາ — Sprint 4' : 'Size/Price filters — Sprint 4'}
                                    </p>
                                </div>
                                {/* Apply */}
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="w-full py-3 bg-champagne-gold text-royal-navy font-bold rounded-xl text-base"
                                >
                                    {locale === 'lo' ? `ນຳໃຊ້ (${filteredProducts.length})` : `Apply (${filteredProducts.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
