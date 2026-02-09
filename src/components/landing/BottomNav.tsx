'use client';

import { useTranslations } from 'next-intl';
import { Home, Search, CalendarDays, MessageCircle, User } from 'lucide-react';
import { useState } from 'react';

export default function BottomNav() {
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                {items.map(({ key, icon: Icon, label }) => (
                    <button
                        key={key}
                        onClick={() => setActive(key)}
                        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active === key ? 'text-champagne-gold' : 'text-navy-600/50'
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
