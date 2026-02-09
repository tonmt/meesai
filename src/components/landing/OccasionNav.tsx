'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Gem, Crown, PartyPopper, Shirt, Snowflake, Watch } from 'lucide-react';
import Link from 'next/link';

const OCCASIONS = [
    { key: 'wedding', icon: Gem, color: 'from-pink-500 to-rose-400' },
    { key: 'traditional', icon: Crown, color: 'from-amber-500 to-yellow-400' },
    { key: 'gala', icon: PartyPopper, color: 'from-purple-500 to-indigo-400' },
    { key: 'mens', icon: Shirt, color: 'from-blue-500 to-cyan-400' },
    { key: 'winter', icon: Snowflake, color: 'from-sky-400 to-blue-300' },
    { key: 'accessories', icon: Watch, color: 'from-emerald-500 to-green-400' },
];

export default function OccasionNav() {
    const t = useTranslations();
    const locale = useLocale();

    return (
        <section className="py-12 md:py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Mobile: horizontal scroll strip */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x pb-2 md:hidden">
                    {OCCASIONS.map(({ key, icon: Icon, color }) => (
                        <Link
                            key={key}
                            href={`/${locale}/browse?category=${key}`}
                            className="flex items-center gap-2 flex-shrink-0 px-4 py-2.5 rounded-full bg-white border border-gray-100 shadow-sm hover:border-champagne-gold/40 hover:shadow-md active:scale-95 transition-all"
                        >
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-navy-700 whitespace-nowrap">
                                {t(`booking.occasions.${key}`)}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Desktop: centered grid with large circles */}
                <div className="hidden md:grid grid-cols-6 gap-6 justify-items-center">
                    {OCCASIONS.map(({ key, icon: Icon, color }) => (
                        <Link
                            key={key}
                            href={`/${locale}/browse?category=${key}`}
                            className="flex flex-col items-center gap-3 group cursor-pointer"
                        >
                            <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br ${color} p-[3px] group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg`}>
                                <div className="w-full h-full rounded-full bg-off-white flex items-center justify-center group-hover:bg-white transition-colors">
                                    <Icon className="w-8 h-8 lg:w-10 lg:h-10 text-navy-700 group-hover:text-champagne-gold transition-colors" />
                                </div>
                            </div>
                            <span className="text-sm lg:text-base font-medium text-navy-700 group-hover:text-champagne-gold transition-colors whitespace-nowrap">
                                {t(`booking.occasions.${key}`)}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
