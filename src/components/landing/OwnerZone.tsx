'use client';

import { useTranslations, useLocale } from 'next-intl';
import { TrendingUp, Shield, BarChart3 } from 'lucide-react';

export default function OwnerZone() {
    const t = useTranslations();
    const locale = useLocale();

    const benefits = [
        { icon: TrendingUp, titleLo: 'ລາຍໄດ້ Passive', titleEn: 'Passive Income', descLo: 'ຊຸດຂອງທ່ານສ້າງລາຍໄດ້ 24/7', descEn: 'Your outfits earn 24/7' },
        { icon: Shield, titleLo: 'ປະກັນທຸກຊຸດ', titleEn: 'Full Insurance', descLo: 'ຄຸ້ມຄອງທຸກກໍລະນີ', descEn: 'Every item is covered' },
        { icon: BarChart3, titleLo: 'Dashboard ລາຍງານ', titleEn: 'Analytics Dashboard', descLo: 'ຕິດຕາມລາຍໄດ້ແບບ real-time', descEn: 'Track earnings real-time' },
    ];

    return (
        <section className="relative py-20 lg:py-24 px-4 overflow-hidden bg-off-white">
            {/* Subtle decorative */}
            <div className="absolute inset-0 gold-dots-pattern opacity-50" />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Mobile: center, Desktop: split layout */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                    {/* Left: Text */}
                    <div className="text-center lg:text-left mb-12 lg:mb-0">
                        <div className="w-16 lg:w-24 h-[2px] bg-gradient-to-r from-champagne-gold to-gold-light mx-auto lg:mx-0 mb-8" />

                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-royal-navy mb-6" style={{ fontFamily: 'var(--font-serif-lao)' }}>
                            {t('owner.title')}
                        </h3>

                        <p className="text-navy-600 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 mb-6">
                            {t('owner.subtitle')}
                        </p>

                        {/* 0% Badge */}
                        <div className="inline-flex items-center gap-3 px-6 py-3 mb-10 rounded-full border border-champagne-gold/30 bg-champagne-gold/10">
                            <span className="text-3xl font-black text-champagne-gold">0%</span>
                            <span className="text-gold-dark text-sm text-left">GP Commission<br />ບໍ່ເກັບຄ່າຫົວຄິວ</span>
                        </div>

                        <div className="block">
                            <button className="px-10 py-4 bg-gradient-to-r from-champagne-gold to-gold-dark text-white font-bold rounded-full text-lg hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:scale-105 gold-shimmer">
                                {t('owner.cta')}
                            </button>
                        </div>
                    </div>

                    {/* Right: Benefit Cards (Desktop) / Below CTA (Mobile) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                        {benefits.map(({ icon: Icon, titleLo, titleEn, descLo, descEn }, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 lg:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-champagne-gold/20 transition-all duration-300 group">
                                <div className="w-12 h-12 flex-shrink-0 bg-champagne-gold/10 rounded-xl flex items-center justify-center group-hover:bg-champagne-gold/20 transition-colors">
                                    <Icon className="w-6 h-6 text-champagne-gold" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-royal-navy mb-1">
                                        {locale === 'lo' ? titleLo : titleEn}
                                    </h4>
                                    <p className="text-navy-600 text-sm">
                                        {locale === 'lo' ? descLo : descEn}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
