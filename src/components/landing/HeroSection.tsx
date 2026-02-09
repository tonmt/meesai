'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, ChevronDown, Shield, Zap, Award } from 'lucide-react';

export default function HeroSection() {
    const t = useTranslations();

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Light Background */}
            <div className="absolute inset-0 hero-bg-light">
                <div className="absolute inset-0 gold-dots-pattern" />
                {/* Decorative gold glow */}
                <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-champagne-gold/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-champagne-gold/3 rounded-full blur-3xl" />
            </div>

            {/* Content — Mobile: center, Desktop: split layout */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-32 pb-40 lg:pt-28 lg:pb-32">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                    {/* Left: Text */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-champagne-gold/30 bg-champagne-gold/10 animate-fade-in-up">
                            <Sparkles className="w-4 h-4 text-champagne-gold" />
                            <span className="text-gold-dark text-sm font-medium">Fashion Bank of Laos</span>
                        </div>

                        {/* Main Slogan */}
                        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 animate-fade-in-up" style={{ fontFamily: 'var(--font-serif-lao)', animationDelay: '0.2s' }}>
                            <span className="text-royal-navy block mb-2">ຢູ່ໃສບໍ່ມີ...</span>
                            <span className="text-gold-gradient">ມາພີ້ &lsquo;ມີໃສ່&rsquo;</span>
                        </h2>

                        {/* Subtitle */}
                        <p className="text-navy-600 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            {t('hero.subtitle')}
                        </p>

                        {/* Dual CTA */}
                        <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-champagne-gold to-gold-dark text-white font-bold rounded-full text-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:scale-105 animate-pulse-gold">
                                {t('hero.cta_renter')}
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 border-2 border-royal-navy/20 text-royal-navy font-medium rounded-full text-lg hover:border-champagne-gold hover:text-champagne-gold transition-all duration-300">
                                {t('hero.cta_owner')}
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                            {[
                                { value: '1,000+', labelLo: 'ຊຸດ', labelEn: 'Outfits' },
                                { value: '500+', labelLo: 'ເຈົ້າຂອງ', labelEn: 'Owners' },
                                { value: '0%', labelLo: 'ຄ່າຫົວຄິວ', labelEn: 'Commission' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center lg:text-left">
                                    <div className="text-2xl md:text-3xl font-bold text-champagne-gold">{stat.value}</div>
                                    <div className="text-navy-600 text-xs mt-1">{stat.labelLo}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Feature showcase (Desktop only) */}
                    <div className="hidden lg:flex flex-col items-center justify-center">
                        <div className="relative w-full max-w-md">
                            <div className="relative">
                                {/* Back card */}
                                <div className="absolute -top-4 -left-4 w-full h-80 bg-champagne-gold/8 rounded-3xl border border-champagne-gold/15 transform rotate-[-6deg]" />
                                {/* Middle card */}
                                <div className="absolute -top-2 -left-2 w-full h-80 bg-champagne-gold/12 rounded-3xl border border-champagne-gold/20 transform rotate-[-3deg]" />
                                {/* Front card */}
                                <div className="relative w-full h-80 bg-white rounded-3xl border border-gray-200 overflow-hidden p-8 flex flex-col justify-between shadow-xl shadow-black/5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 bg-champagne-gold/15 rounded-full flex items-center justify-center">
                                                <Sparkles className="w-5 h-5 text-champagne-gold" />
                                            </div>
                                            <div>
                                                <p className="text-royal-navy text-sm font-semibold">MeeSai Premium</p>
                                                <p className="text-navy-600 text-xs">Fashion Bank</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                                            <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                                            <div className="h-3 bg-champagne-gold/15 rounded-full w-2/3" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { icon: Shield, label: 'ປະກັນ' },
                                            { icon: Zap, label: 'ໄວ' },
                                            { icon: Award, label: '0% GP' },
                                        ].map(({ icon: Icon, label }, i) => (
                                            <div key={i} className="flex flex-col items-center gap-1.5 py-3 bg-off-white rounded-xl border border-gray-100">
                                                <Icon className="w-5 h-5 text-champagne-gold" />
                                                <span className="text-navy-600 text-[10px] font-medium">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-champagne-gold/8 rounded-full blur-3xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <ChevronDown className="w-6 h-6 text-champagne-gold/60" />
            </div>
        </section>
    );
}
