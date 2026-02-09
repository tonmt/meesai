'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Heart, ArrowRight, Shirt, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

const MOCK_ITEMS = [
    { id: '1', titleLo: 'ຊຸດລາຕຣີ Versace ສີດຳ', titleEn: 'Versace Black Evening Gown', buyPrice: 12000000, rentalPrice: 800000, size: 'M', available: true },
    { id: '2', titleLo: 'ຊຸດໄໝລາວ ສີທອງ Premium', titleEn: 'Gold Premium Lao Silk', buyPrice: 8000000, rentalPrice: 500000, size: 'S', available: true },
    { id: '3', titleLo: 'ສູດ Hugo Boss ສີກົມ', titleEn: 'Hugo Boss Navy Suit', buyPrice: 15000000, rentalPrice: 1200000, size: 'L', available: true },
    { id: '4', titleLo: 'ຊຸດເພື່ອນເຈົ້າສາວ ສີຊົມພູ', titleEn: 'Pink Bridesmaid Dress', buyPrice: 5000000, rentalPrice: 350000, size: 'M', available: true },
    { id: '5', titleLo: 'ຊຸດໄໝລາວ ສີແດງມົງຄຸນ', titleEn: 'Red Auspicious Lao Silk', buyPrice: 6500000, rentalPrice: 450000, size: 'L', available: false },
    { id: '6', titleLo: 'ທັກຊິໂດ້ Armani ສີດຳ', titleEn: 'Armani Black Tuxedo', buyPrice: 20000000, rentalPrice: 1500000, size: 'M', available: true },
];

function formatPrice(price: number): string {
    return new Intl.NumberFormat('lo-LA').format(price);
}

const FILTER_CATEGORIES = [
    { key: 'all', labelLo: 'ທັງໝົດ', labelEn: 'All' },
    { key: 'dress', labelLo: 'ຊຸດກະໂປ່ງ', labelEn: 'Dresses' },
    { key: 'suit', labelLo: 'ຊຸດສູດ', labelEn: 'Suits' },
    { key: 'silk', labelLo: 'ຊຸດໄໝ', labelEn: 'Silk' },
    { key: 'accessories', labelLo: 'ເຄື່ອງປະດັບ', labelEn: 'Accessories' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

export default function DynamicFeed() {
    const t = useTranslations();
    const locale = useLocale();
    const [activeFilter, setActiveFilter] = useState('all');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
                    {FILTER_CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveFilter(cat.key)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === cat.key
                                ? 'bg-champagne-gold text-royal-navy'
                                : 'bg-white border border-gray-200 text-navy-600 hover:border-champagne-gold'
                                }`}
                        >
                            {locale === 'lo' ? cat.labelLo : cat.labelEn}
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
                                    {FILTER_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.key}
                                            onClick={() => setActiveFilter(cat.key)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeFilter === cat.key
                                                ? 'bg-champagne-gold/10 text-champagne-gold font-medium border border-champagne-gold/20'
                                                : 'text-navy-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {locale === 'lo' ? cat.labelLo : cat.labelEn}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <h5 className="text-sm font-semibold text-navy-600 mb-3">{locale === 'lo' ? 'ຂະໜາດ' : 'Size'}</h5>
                                <div className="flex flex-wrap gap-2">
                                    {SIZES.map(s => (
                                        <button key={s} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy-600 hover:border-champagne-gold hover:text-champagne-gold transition-all">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h5 className="text-sm font-semibold text-navy-600 mb-3">{locale === 'lo' ? 'ລາຄາເຊົ່າ' : 'Rental Price'}</h5>
                                <div className="space-y-2">
                                    {[
                                        { label: '< 500,000 ₭', value: '0-500000' },
                                        { label: '500K - 1M ₭', value: '500000-1000000' },
                                        { label: '> 1,000,000 ₭', value: '1000000+' },
                                    ].map(range => (
                                        <button key={range.value} className="w-full text-left px-3 py-2 rounded-lg text-sm text-navy-600 hover:bg-gray-50 transition-all">
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                        {MOCK_ITEMS.filter(i => i.available).map((item) => (
                            <div key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                {/* Image */}
                                <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                        <Shirt className="w-16 h-16" />
                                    </div>
                                    {/* Available Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 bg-emerald text-white text-[11px] font-bold rounded-full shadow-lg">
                                            {t('feed.available')}
                                        </span>
                                    </div>
                                    {/* Wishlist — visible on touch, hover on desktop */}
                                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:text-danger transition-all shadow-sm sm:opacity-0 sm:group-hover:opacity-100">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                    {/* Size */}
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-royal-navy/80 text-white text-xs font-bold rounded-lg">
                                        {item.size}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h4 className="text-sm lg:text-base font-semibold text-royal-navy line-clamp-2 mb-2 min-h-[2.5rem]">
                                        {locale === 'lo' ? item.titleLo : item.titleEn}
                                    </h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs text-gray-400 line-through">
                                            {formatPrice(item.buyPrice)} {t('feed.currency')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-lg font-bold text-danger">
                                            {formatPrice(item.rentalPrice)} {t('feed.currency')}
                                        </span>
                                    </div>
                                    <button className="w-full mt-3 py-2 bg-royal-navy text-white text-sm font-medium rounded-xl hover:bg-champagne-gold hover:text-royal-navy transition-all duration-300">
                                        {t('feed.quick_book')}
                                    </button>
                                </div>
                            </div>
                        ))}
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
                                        {FILTER_CATEGORIES.map(cat => (
                                            <button
                                                key={cat.key}
                                                onClick={() => setActiveFilter(cat.key)}
                                                className={`px-4 py-2 rounded-full text-sm transition-all ${activeFilter === cat.key
                                                    ? 'bg-champagne-gold text-royal-navy font-medium'
                                                    : 'bg-gray-50 border border-gray-200 text-navy-600'
                                                    }`}
                                            >
                                                {locale === 'lo' ? cat.labelLo : cat.labelEn}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Size */}
                                <div className="mb-6">
                                    <h5 className="text-sm font-semibold text-navy-600 mb-3">{locale === 'lo' ? 'ຂະໜາດ' : 'Size'}</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {SIZES.map(s => (
                                            <button key={s} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-navy-600">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Apply */}
                                <button
                                    onClick={() => setMobileFilterOpen(false)}
                                    className="w-full py-3 bg-champagne-gold text-royal-navy font-bold rounded-xl text-base"
                                >
                                    {locale === 'lo' ? 'ນຳໃຊ້' : 'Apply'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
