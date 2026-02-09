'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Search, Heart, ShoppingBag, User, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
    { key: 'home', href: '/' },
    { key: 'browse', href: '/' },
    { key: 'how_it_works', href: '/' },
    { key: 'contact', href: '/' },
];

export default function StickyHeader() {
    const t = useTranslations();
    const locale = useLocale();
    const otherLocale = locale === 'lo' ? 'en' : 'lo';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <h1 className="text-xl font-bold">
                            <span className="text-gold-gradient font-[var(--font-serif-lao)]">ມີໃສ່</span>
                            <span className="text-navy-600 text-[10px] block leading-tight tracking-wider">{t('footer.tagline')}</span>
                        </h1>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {NAV_LINKS.map(({ key, href }) => (
                            <Link
                                key={key}
                                href={href}
                                className="px-4 py-2 text-sm text-navy-600 hover:text-champagne-gold transition-colors rounded-lg hover:bg-champagne-gold/5"
                            >
                                {t(`nav.${key}`)}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-600/40" />
                            <input
                                type="text"
                                placeholder={t('nav.search_placeholder')}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-royal-navy text-sm placeholder:text-navy-600/40 focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-1 md:gap-3">
                        <Link href="/" locale={otherLocale} className="flex items-center gap-1 px-2 py-1.5 text-xs text-navy-600 hover:text-champagne-gold transition-colors">
                            <Globe className="w-4 h-4" />
                            <span className="hidden sm:inline">{otherLocale.toUpperCase()}</span>
                        </Link>
                        <button className="hidden sm:flex p-2 text-navy-600 hover:text-champagne-gold transition-colors relative">
                            <Heart className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-navy-600 hover:text-champagne-gold transition-colors relative">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-champagne-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
                        </button>
                        <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-royal-navy text-white rounded-full text-sm hover:bg-navy-800 transition-all shadow-sm">
                            <User className="w-4 h-4" />
                            <span>{t('nav.login')}</span>
                        </button>
                        {/* Mobile Hamburger */}
                        <button
                            className="lg:hidden p-2 text-navy-600 hover:text-champagne-gold transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden px-4 pb-3">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-600/40" />
                        <input
                            type="text"
                            placeholder={t('nav.search_placeholder')}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-royal-navy text-sm placeholder:text-navy-600/40 focus:outline-none focus:border-champagne-gold transition-all"
                        />
                    </div>
                </div>
            </header>

            {/* Mobile Slide-in Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-gray-100 shadow-2xl animate-slide-in-right">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-gold-gradient text-xl font-bold font-[var(--font-serif-lao)]">ມີໃສ່</h2>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-navy-600 hover:text-champagne-gold">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-1 mb-8">
                                {NAV_LINKS.map(({ key, href }) => (
                                    <Link
                                        key={key}
                                        href={href}
                                        className="px-4 py-3 text-navy-700 hover:text-champagne-gold hover:bg-champagne-gold/5 rounded-xl transition-all text-base"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {t(`nav.${key}`)}
                                    </Link>
                                ))}
                            </nav>
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-royal-navy text-white rounded-xl hover:bg-navy-800 transition-all">
                                <User className="w-4 h-4" />
                                <span>{t('nav.login')}</span>
                            </button>
                            <Link
                                href="/"
                                locale={otherLocale}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-navy-600 hover:text-champagne-gold hover:border-champagne-gold/30 transition-all"
                            >
                                <Globe className="w-4 h-4" />
                                <span>{otherLocale === 'lo' ? 'ພາສາລາວ' : 'English'}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
