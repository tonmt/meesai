'use client';

import { useTranslations } from 'next-intl';
import { Star, MessageCircle, Facebook, Instagram, Music } from 'lucide-react';

export default function Footer() {
    const t = useTranslations();

    return (
        <footer className="bg-white border-t border-gray-100 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div>
                        <h4 className="text-2xl font-bold text-gold-gradient mb-2" style={{ fontFamily: 'var(--font-serif-lao)' }}>ມີໃສ່</h4>
                        <p className="text-navy-600 text-sm mb-3">{t('footer.tagline')}</p>
                        <div className="flex items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-champagne-gold fill-champagne-gold" />
                            ))}
                            <span className="text-navy-600 text-sm ml-2">5.0 Rating</span>
                        </div>
                        {/* Social Icons */}
                        <div className="flex items-center gap-3">
                            {[
                                { icon: Facebook, label: 'Facebook' },
                                { icon: Instagram, label: 'Instagram' },
                                { icon: Music, label: 'TikTok' },
                            ].map(({ icon: Icon, label }) => (
                                <a key={label} href="#" className="w-9 h-9 bg-off-white border border-gray-200 rounded-full flex items-center justify-center text-navy-600 hover:text-champagne-gold hover:border-champagne-gold/30 transition-all">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="text-royal-navy text-sm font-semibold uppercase tracking-wider mb-4">{t('footer.quick_links')}</h5>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-navy-600 hover:text-champagne-gold transition-colors text-sm">{t('footer.about')}</a></li>
                            <li><a href="#" className="text-navy-600 hover:text-champagne-gold transition-colors text-sm">{t('footer.how_it_works')}</a></li>
                            <li><a href="#" className="text-navy-600 hover:text-champagne-gold transition-colors text-sm">{t('footer.faq')}</a></li>
                            <li><a href="#" className="text-navy-600 hover:text-champagne-gold transition-colors text-sm">{t('footer.blog')}</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h5 className="text-royal-navy text-sm font-semibold uppercase tracking-wider mb-4">Legal</h5>
                        <ul className="space-y-2.5">
                            <li><a href="#" className="text-navy-600 hover:text-champagne-gold transition-colors text-sm">{t('footer.terms')}</a></li>
                            <li><a href="#" className="text-navy-600 hover:text-champagne-gold transition-colors text-sm">{t('footer.refund')}</a></li>
                            <li><a href="#" className="text-navy-600 hover:text-champagne-gold transition-colors text-sm">{t('footer.insurance')}</a></li>
                        </ul>
                    </div>

                    {/* Payment + Contact */}
                    <div>
                        <h5 className="text-royal-navy text-sm font-semibold uppercase tracking-wider mb-4">Payment Partners</h5>
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                            {['BCEL One', 'OnePay', 'VISA', 'MC'].map((p) => (
                                <div key={p} className="px-3 py-2 bg-off-white border border-gray-200 rounded-lg text-navy-600 text-xs font-medium">
                                    {p}
                                </div>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald/10 border border-emerald/20 rounded-full text-emerald text-sm hover:bg-emerald/20 transition-all">
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp Chat
                        </button>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-100 mt-10 pt-6 text-center">
                    <p className="text-navy-600/50 text-xs">© 2026 ມີໃສ່ (MeeSai). Vientiane Fashion Infrastructure. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
