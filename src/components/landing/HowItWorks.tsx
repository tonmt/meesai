'use client';

import { useTranslations } from 'next-intl';
import { MousePointerClick, CalendarCheck, PartyPopper } from 'lucide-react';

const STEPS = [
    {
        num: '01',
        icon: MousePointerClick,
        gradient: 'from-champagne-gold to-gold-light',
        titleKey: 'how.step1_title',
        descKey: 'how.step1_desc',
    },
    {
        num: '02',
        icon: CalendarCheck,
        gradient: 'from-emerald to-green-400',
        titleKey: 'how.step2_title',
        descKey: 'how.step2_desc',
    },
    {
        num: '03',
        icon: PartyPopper,
        gradient: 'from-purple-500 to-indigo-400',
        titleKey: 'how.step3_title',
        descKey: 'how.step3_desc',
    },
];

export default function HowItWorks() {
    const t = useTranslations();

    return (
        <section className="py-16 md:py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Section Title */}
                <div className="text-center mb-12 md:mb-16">
                    <h3
                        className="text-2xl sm:text-3xl md:text-4xl font-bold text-royal-navy mb-3"
                        style={{ fontFamily: 'var(--font-serif-lao)' }}
                    >
                        {t('how.title')}
                    </h3>
                    <div className="w-16 h-1 bg-champagne-gold mx-auto rounded-full mb-4" />
                    <p className="text-navy-600 text-sm md:text-base max-w-xl mx-auto">
                        {t('how.subtitle')}
                    </p>
                </div>

                {/* Mobile: vertical timeline */}
                <div className="md:hidden space-y-6">
                    {STEPS.map(({ num, icon: Icon, gradient, titleKey, descKey }, i) => (
                        <div key={i} className="flex gap-4 items-start">
                            {/* Number + line */}
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className="w-px h-10 bg-gradient-to-b from-gray-200 to-transparent mt-2" />
                                )}
                            </div>
                            {/* Text */}
                            <div className="flex-1 pt-1">
                                <div className="text-xs font-bold text-champagne-gold mb-1">STEP {num}</div>
                                <h4 className="text-lg font-bold text-royal-navy mb-1">{t(titleKey)}</h4>
                                <p className="text-navy-600 text-sm leading-relaxed">{t(descKey)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop: horizontal cards with connecting arrows */}
                <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-10">
                    {STEPS.map(({ num, icon: Icon, gradient, titleKey, descKey }, i) => (
                        <div key={i} className="relative group">
                            {/* Connector arrow */}
                            {i < STEPS.length - 1 && (
                                <div className="absolute top-16 -right-3 lg:-right-5 z-10 w-6 lg:w-10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-champagne-gold/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            )}

                            <div className="text-center p-6 lg:p-8 rounded-2xl bg-off-white hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                                {/* Step number badge */}
                                <div className="text-xs font-bold text-champagne-gold/60 mb-4 tracking-widest">STEP {num}</div>

                                {/* Icon */}
                                <div className={`w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${gradient} p-[2px] group-hover:scale-110 transition-transform duration-300 group-hover:shadow-xl`}>
                                    <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                                        <Icon className="w-7 h-7 lg:w-9 lg:h-9 text-royal-navy" />
                                    </div>
                                </div>

                                {/* Text */}
                                <h4 className="text-lg lg:text-xl font-bold text-royal-navy mb-3">{t(titleKey)}</h4>
                                <p className="text-navy-600 leading-relaxed text-sm lg:text-base">{t(descKey)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
