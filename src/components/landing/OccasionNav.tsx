'use client';

import { useTranslations } from 'next-intl';
import { Gem, Crown, PartyPopper, Shirt, Snowflake, Watch } from 'lucide-react';

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

    return (
        <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Mobile: horizontal scroll, Desktop: centered grid */}
                <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-snap-x pb-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:justify-items-center">
                    {OCCASIONS.map(({ key, icon: Icon, color }) => (
                        <button key={key} className="flex flex-col items-center gap-3 flex-shrink-0 lg:flex-shrink group cursor-pointer">
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
