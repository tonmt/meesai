'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function MobileCTA() {
    const t = useTranslations();
    const locale = useLocale();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function handleScroll() {
            // Show after scrolling past hero (500px)
            setVisible(window.scrollY > 500);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!visible) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] animate-fade-in-up">
            <Link
                href={`/${locale}/browse`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-champagne-gold to-gold-dark text-white font-bold rounded-xl text-base shadow-lg shadow-champagne-gold/25 active:scale-[0.98] transition-transform"
            >
                <Sparkles className="w-4 h-4" />
                {t('hero.cta_renter')}
            </Link>
        </div>
    );
}
