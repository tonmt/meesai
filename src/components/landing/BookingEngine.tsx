'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, CalendarDays, Shirt, Sparkles } from 'lucide-react';

export default function BookingEngine() {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const [date, setDate] = useState('');
    const [occasion, setOccasion] = useState('');
    const [size, setSize] = useState('');

    function handleSearch() {
        const params = new URLSearchParams();
        if (size) params.set('size', size);
        if (occasion) params.set('category', occasion);
        if (date) params.set('date', date);
        router.push(`/${locale}/browse?${params.toString()}`);
    }

    return (
        <section className="relative z-20 -mt-24 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="glass-light rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                    {/* Desktop: horizontal row */}
                    <div className="hidden md:block p-6 lg:p-8">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-navy-600 mb-2 flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5 text-champagne-gold" />
                                    {t('booking.event_date')}
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all text-sm"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-navy-600 mb-2 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-champagne-gold" />
                                    {t('booking.occasion')}
                                </label>
                                <select
                                    value={occasion}
                                    onChange={e => setOccasion(e.target.value)}
                                    className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all appearance-none text-sm"
                                >
                                    <option value="">—</option>
                                    {Object.entries(t.raw('booking.occasions') as Record<string, string>).map(([key, val]) => (
                                        <option key={key} value={key}>{val}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-navy-600 mb-2 flex items-center gap-1.5">
                                    <Shirt className="w-3.5 h-3.5 text-champagne-gold" />
                                    {t('booking.size')}
                                </label>
                                <select
                                    value={size}
                                    onChange={e => setSize(e.target.value)}
                                    className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all appearance-none text-sm"
                                >
                                    <option value="">—</option>
                                    {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col justify-end">
                                <button
                                    onClick={handleSearch}
                                    className="w-full px-6 py-3 bg-emerald hover:bg-emerald-dark text-white font-bold rounded-xl text-base transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald/25 flex items-center justify-center gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    {t('booking.check_availability')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile: stacked compact layout */}
                    <div className="md:hidden p-5">
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-navy-600 mb-1 block">{t('booking.occasion')}</label>
                                    <select
                                        value={occasion}
                                        onChange={e => setOccasion(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-off-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-champagne-gold appearance-none"
                                    >
                                        <option value="">—</option>
                                        {Object.entries(t.raw('booking.occasions') as Record<string, string>).map(([key, val]) => (
                                            <option key={key} value={key}>{val}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-navy-600 mb-1 block">{t('booking.size')}</label>
                                    <select
                                        value={size}
                                        onChange={e => setSize(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-off-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-champagne-gold appearance-none"
                                    >
                                        <option value="">—</option>
                                        {['XS', 'S', 'M', 'L', 'XL', '2XL'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleSearch}
                                className="w-full py-3 bg-emerald hover:bg-emerald-dark text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald/25"
                            >
                                <Search className="w-4 h-4" />
                                {t('booking.check_availability')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
