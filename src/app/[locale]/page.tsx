'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
    Search, Heart, ShoppingBag, User, Globe, ChevronDown,
    Sparkles, Clock, Truck, Star, ArrowRight,
    Home, MessageCircle, CalendarDays,
    Gem, Shirt, PartyPopper, Crown, Snowflake, Watch
} from 'lucide-react';
import { useState } from 'react';

// ─── Mock Data ───
const MOCK_ITEMS = [
    { id: '1', titleLo: 'ຊຸດລາຕຣີ Versace ສີດຳ', titleEn: 'Versace Black Evening Gown', buyPrice: 12000000, rentalPrice: 800000, size: 'M', image: '/items/dress-1.jpg', available: true },
    { id: '2', titleLo: 'ຊຸດໄໝລາວ ສີທອງ Premium', titleEn: 'Gold Premium Lao Silk', buyPrice: 8000000, rentalPrice: 500000, size: 'S', image: '/items/dress-2.jpg', available: true },
    { id: '3', titleLo: 'ສູດ Hugo Boss ສີກົມ', titleEn: 'Hugo Boss Navy Suit', buyPrice: 15000000, rentalPrice: 1200000, size: 'L', image: '/items/suit-1.jpg', available: true },
    { id: '4', titleLo: 'ຊຸດເພື່ອນເຈົ້າສາວ ສີຊົມພູ', titleEn: 'Pink Bridesmaid Dress', buyPrice: 5000000, rentalPrice: 350000, size: 'M', image: '/items/dress-3.jpg', available: true },
    { id: '5', titleLo: 'ຊຸດໄໝລາວ ສີແດງມົງຄຸນ', titleEn: 'Red Auspicious Lao Silk', buyPrice: 6500000, rentalPrice: 450000, size: 'L', image: '/items/dress-4.jpg', available: false },
    { id: '6', titleLo: 'ທັກຊິໂດ້ Armani ສີດຳ', titleEn: 'Armani Black Tuxedo', buyPrice: 20000000, rentalPrice: 1500000, size: 'M', image: '/items/suit-2.jpg', available: true },
];

const OCCASIONS = [
    { key: 'wedding', icon: Gem, color: 'from-pink-500 to-rose-400' },
    { key: 'traditional', icon: Crown, color: 'from-amber-500 to-yellow-400' },
    { key: 'gala', icon: PartyPopper, color: 'from-purple-500 to-indigo-400' },
    { key: 'mens', icon: Shirt, color: 'from-blue-500 to-cyan-400' },
    { key: 'winter', icon: Snowflake, color: 'from-sky-400 to-blue-300' },
    { key: 'accessories', icon: Watch, color: 'from-emerald-500 to-green-400' },
];

function formatPrice(price: number): string {
    return new Intl.NumberFormat('lo-LA').format(price);
}

// ─── Section 1: Sticky Header ───
function StickyHeader() {
    const t = useTranslations();
    const locale = useLocale();
    const otherLocale = locale === 'lo' ? 'en' : 'lo';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold">
                        <span className="text-gold-gradient font-[var(--font-serif-lao)]">ມີໃສ່</span>
                        <span className="text-white/50 text-[10px] block leading-tight tracking-wider">{t('footer.tagline')}</span>
                    </h1>
                </div>

                {/* Search Bar - Hidden on mobile */}
                <div className="hidden md:flex flex-1 max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder={t('nav.search_placeholder')}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-full text-white/80 text-sm placeholder:text-white/30 focus:outline-none focus:border-champagne-gold/50 focus:bg-white/15 transition-all"
                        />
                    </div>
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-1 md:gap-3">
                    <Link href="/" locale={otherLocale} className="flex items-center gap-1 px-2 py-1.5 text-xs text-white/60 hover:text-champagne-gold transition-colors">
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">{otherLocale.toUpperCase()}</span>
                    </Link>
                    <button className="p-2 text-white/60 hover:text-champagne-gold transition-colors relative">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/60 hover:text-champagne-gold transition-colors relative">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-champagne-gold text-royal-navy text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                    </button>
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-champagne-gold/10 border border-champagne-gold/30 rounded-full text-champagne-gold text-sm hover:bg-champagne-gold/20 transition-all">
                        <User className="w-4 h-4" />
                        <span>{t('nav.login')}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden px-4 pb-3">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder={t('nav.search_placeholder')}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-full text-white/80 text-sm placeholder:text-white/30 focus:outline-none focus:border-champagne-gold/50 transition-all"
                    />
                </div>
            </div>
        </header>
    );
}

// ─── Section 2: Hero ───
function HeroSection() {
    const t = useTranslations();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-royal-navy via-navy-800 to-royal-navy">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
                />
                {/* Radial glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-champagne-gold/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-32 pb-40">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-champagne-gold/30 bg-champagne-gold/10 animate-fade-in-up">
                    <Sparkles className="w-4 h-4 text-champagne-gold" />
                    <span className="text-champagne-gold text-sm font-medium">Fashion Bank of Laos</span>
                </div>

                {/* Main Slogan */}
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ fontFamily: 'var(--font-serif-lao)', animationDelay: '0.2s' }}>
                    <span className="text-white block mb-2">ຢູ່ໃສບໍ່ມີ...</span>
                    <span className="text-gold-gradient">ມາພີ້ &lsquo;ມີໃສ່&rsquo;</span>
                </h2>

                {/* Subtitle */}
                <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    {t('hero.subtitle')}
                </p>

                {/* Dual CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-champagne-gold to-gold-dark text-royal-navy font-bold rounded-full text-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:scale-105 animate-pulse-gold">
                        {t('hero.cta_renter')}
                    </button>
                    <button className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-medium rounded-full text-lg hover:border-champagne-gold hover:text-champagne-gold transition-all duration-300">
                        {t('hero.cta_owner')}
                    </button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-8 mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                    {[
                        { value: '1,000+', labelLo: 'ຊຸດ', labelEn: 'Outfits' },
                        { value: '500+', labelLo: 'ເຈົ້າຂອງ', labelEn: 'Owners' },
                        { value: '0%', labelLo: 'ຄ່າຫົວຄິວ', labelEn: 'Commission' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-champagne-gold">{stat.value}</div>
                            <div className="text-white/40 text-xs mt-1">{stat.labelLo}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <ChevronDown className="w-6 h-6 text-champagne-gold/50" />
            </div>
        </section>
    );
}

// ─── Section 3: Booking Engine ───
function BookingEngine() {
    const t = useTranslations();

    return (
        <section className="relative z-20 -mt-24 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="glass-light rounded-2xl shadow-2xl p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Event Date */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-navy-600 mb-2">{t('booking.event_date')}</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all"
                            />
                        </div>

                        {/* Occasion */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-navy-600 mb-2">{t('booking.occasion')}</label>
                            <select className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all appearance-none">
                                <option value="">—</option>
                                {Object.entries(t.raw('booking.occasions') as Record<string, string>).map(([key, val]) => (
                                    <option key={key} value={key}>{val}</option>
                                ))}
                            </select>
                        </div>

                        {/* Size */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-navy-600 mb-2">{t('booking.size')}</label>
                            <select className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all appearance-none">
                                <option value="">—</option>
                                {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Button */}
                        <div className="flex flex-col justify-end">
                            <button className="w-full px-6 py-3 bg-emerald hover:bg-emerald-dark text-white font-bold rounded-xl text-base transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald/25">
                                {t('booking.check_availability')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Section 4: Occasion Navigation ───
function OccasionNav() {
    const t = useTranslations();

    return (
        <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-snap-x pb-4 md:justify-center">
                    {OCCASIONS.map(({ key, icon: Icon, color }) => (
                        <button key={key} className="flex flex-col items-center gap-3 flex-shrink-0 group cursor-pointer">
                            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${color} p-[3px] group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg`}>
                                <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center">
                                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-navy-700" />
                                </div>
                            </div>
                            <span className="text-sm md:text-base font-medium text-navy-700 group-hover:text-champagne-gold transition-colors whitespace-nowrap">
                                {t(`booking.occasions.${key}`)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Section 5: Dynamic Feed ───
function DynamicFeed() {
    const t = useTranslations();
    const locale = useLocale();

    return (
        <section className="py-16 px-4 bg-cream/50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl md:text-3xl font-bold text-royal-navy" style={{ fontFamily: 'var(--font-serif-lao)' }}>
                        {t('feed.title')}
                    </h3>
                    <button className="flex items-center gap-1 text-champagne-gold hover:underline text-sm font-medium">
                        <span>{locale === 'lo' ? 'ເບິ່ງທັງໝົດ' : 'View All'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                                {/* Wishlist */}
                                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white hover:text-danger transition-all shadow-sm opacity-0 group-hover:opacity-100">
                                    <Heart className="w-4 h-4" />
                                </button>
                                {/* Size */}
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-royal-navy/80 text-white text-xs font-bold rounded-lg">
                                    {item.size}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h4 className="text-sm font-semibold text-royal-navy line-clamp-2 mb-2 min-h-[2.5rem]">
                                    {locale === 'lo' ? item.titleLo : item.titleEn}
                                </h4>
                                {/* Prices */}
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
        </section>
    );
}

// ─── Section 6: Trust / Service Guarantee ───
function TrustSection() {
    const t = useTranslations();

    const guarantees = [
        { icon: Sparkles, titleKey: 'trust.hygiene_title' as const, descKey: 'trust.hygiene_desc' as const, gradient: 'from-blue-500 to-cyan-400' },
        { icon: Clock, titleKey: 'trust.buffer_title' as const, descKey: 'trust.buffer_desc' as const, gradient: 'from-champagne-gold to-gold-light' },
        { icon: Truck, titleKey: 'trust.delivery_title' as const, descKey: 'trust.delivery_desc' as const, gradient: 'from-emerald to-green-400' },
    ];

    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold text-royal-navy text-center mb-4" style={{ fontFamily: 'var(--font-serif-lao)' }}>
                    {t('trust.title')}
                </h3>
                <div className="w-16 h-1 bg-champagne-gold mx-auto rounded-full mb-12" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {guarantees.map(({ icon: Icon, titleKey, descKey, gradient }, i) => (
                        <div key={i} className="text-center group">
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${gradient} p-[2px] group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl`}>
                                <div className="w-full h-full rounded-2xl bg-off-white flex items-center justify-center">
                                    <Icon className="w-9 h-9 text-royal-navy" />
                                </div>
                            </div>
                            <h4 className="text-xl font-bold text-royal-navy mb-3">{t(titleKey)}</h4>
                            <p className="text-navy-600 leading-relaxed">{t(descKey)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Section 7: Owner Partner Zone ───
function OwnerZone() {
    const t = useTranslations();

    return (
        <section className="relative py-24 px-4 overflow-hidden">
            {/* Navy Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-royal-navy via-navy-800 to-royal-navy" />
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M20 20l-4-4h8z'/%3E%3C/g%3E%3C/svg%3E")` }}
            />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Gold line */}
                <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-champagne-gold to-transparent mx-auto mb-8" />

                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-serif-lao)' }}>
                    {t('owner.title')}
                </h3>

                <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-4">
                    {t('owner.subtitle')}
                </p>

                {/* 0% Badge */}
                <div className="inline-flex items-center gap-3 px-6 py-3 mb-10 rounded-full border border-champagne-gold/30 bg-champagne-gold/10">
                    <span className="text-3xl font-black text-champagne-gold">0%</span>
                    <span className="text-champagne-gold/80 text-sm text-left">GP Commission<br />ບໍ່ເກັບຄ່າຫົວຄິວ</span>
                </div>

                <div className="block">
                    <button className="px-10 py-4 bg-gradient-to-r from-champagne-gold to-gold-dark text-royal-navy font-bold rounded-full text-lg hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:scale-105 gold-shimmer">
                        {t('owner.cta')}
                    </button>
                </div>
            </div>
        </section>
    );
}

// ─── Section 8: Footer ───
function Footer() {
    const t = useTranslations();

    return (
        <footer className="bg-royal-navy border-t border-white/5 pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <h4 className="text-2xl font-bold text-gold-gradient mb-2" style={{ fontFamily: 'var(--font-serif-lao)' }}>ມີໃສ່</h4>
                        <p className="text-white/30 text-sm">{t('footer.tagline')}</p>
                        <div className="flex items-center gap-3 mt-4">
                            <Star className="w-4 h-4 text-champagne-gold" />
                            <Star className="w-4 h-4 text-champagne-gold" />
                            <Star className="w-4 h-4 text-champagne-gold" />
                            <Star className="w-4 h-4 text-champagne-gold" />
                            <Star className="w-4 h-4 text-champagne-gold" />
                            <span className="text-white/40 text-sm">5.0 Rating</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h5 className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-4">Legal</h5>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-white/40 hover:text-champagne-gold transition-colors text-sm">{t('footer.terms')}</a></li>
                            <li><a href="#" className="text-white/40 hover:text-champagne-gold transition-colors text-sm">{t('footer.refund')}</a></li>
                            <li><a href="#" className="text-white/40 hover:text-champagne-gold transition-colors text-sm">{t('footer.insurance')}</a></li>
                        </ul>
                    </div>

                    {/* Payment Trust */}
                    <div>
                        <h5 className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-4">Payment Partners</h5>
                        <div className="flex items-center gap-4 flex-wrap">
                            {['BCEL One', 'OnePay', 'VISA', 'MC'].map((p) => (
                                <div key={p} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40 text-xs font-medium">
                                    {p}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-emerald/20 border border-emerald/30 rounded-full text-emerald text-sm hover:bg-emerald/30 transition-all">
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp Chat
                            </button>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/5 mt-8 pt-6 text-center">
                    <p className="text-white/20 text-xs">© 2026 ມີໃສ່ (MeeSai). Vientiane Fashion Infrastructure. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

// ─── Bottom Navigation (Mobile) ───
function BottomNav() {
    const t = useTranslations();
    const [active, setActive] = useState('home');

    const items = [
        { key: 'home', icon: Home, label: t('bottom_nav.home') },
        { key: 'search', icon: Search, label: t('bottom_nav.search') },
        { key: 'bookings', icon: CalendarDays, label: t('bottom_nav.bookings') },
        { key: 'chat', icon: MessageCircle, label: t('bottom_nav.chat') },
        { key: 'profile', icon: User, label: t('bottom_nav.profile') },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10">
            <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                {items.map(({ key, icon: Icon, label }) => (
                    <button
                        key={key}
                        onClick={() => setActive(key)}
                        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active === key ? 'text-champagne-gold' : 'text-white/40'
                            }`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{label}</span>
                        {active === key && <div className="w-1 h-1 bg-champagne-gold rounded-full mt-0.5" />}
                    </button>
                ))}
            </div>
        </nav>
    );
}

// ─── Main Page Component ───
export default function LandingPage() {
    return (
        <>
            <StickyHeader />
            <main>
                <HeroSection />
                <BookingEngine />
                <OccasionNav />
                <DynamicFeed />
                <TrustSection />
                <OwnerZone />
            </main>
            <Footer />
            <BottomNav />
        </>
    );
}
