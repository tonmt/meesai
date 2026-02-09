'use client';

import { useTranslations } from 'next-intl';
import { Sparkles, Clock, Truck } from 'lucide-react';

export default function TrustSection() {
    const t = useTranslations();

    const guarantees = [
        { icon: Sparkles, titleKey: 'trust.hygiene_title' as const, descKey: 'trust.hygiene_desc' as const, gradient: 'from-blue-500 to-cyan-400' },
        { icon: Clock, titleKey: 'trust.buffer_title' as const, descKey: 'trust.buffer_desc' as const, gradient: 'from-champagne-gold to-gold-light' },
        { icon: Truck, titleKey: 'trust.delivery_title' as const, descKey: 'trust.delivery_desc' as const, gradient: 'from-emerald to-green-400' },
    ];

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-royal-navy text-center mb-4" style={{ fontFamily: 'var(--font-serif-lao)' }}>
                    {t('trust.title')}
                </h3>
                <div className="w-16 h-1 bg-champagne-gold mx-auto rounded-full mb-12" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {guarantees.map(({ icon: Icon, titleKey, descKey, gradient }, i) => (
                        <div key={i} className="text-center group p-6 lg:p-8 rounded-2xl bg-off-white hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                            <div className={`w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${gradient} p-[2px] group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl`}>
                                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                                    <Icon className="w-7 h-7 lg:w-9 lg:h-9 text-royal-navy" />
                                </div>
                            </div>
                            <h4 className="text-lg lg:text-xl font-bold text-royal-navy mb-3">{t(titleKey)}</h4>
                            <p className="text-navy-600 leading-relaxed text-sm lg:text-base">{t(descKey)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
