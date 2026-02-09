'use client';

import { useTranslations } from 'next-intl';

export default function BookingEngine() {
    const t = useTranslations();

    return (
        <section className="relative z-20 -mt-24 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="glass-light rounded-2xl shadow-2xl p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Event Date */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-navy-600 mb-2">{t('booking.event_date')}</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all"
                            />
                        </div>

                        {/* Occasion */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-navy-600 mb-2">{t('booking.occasion')}</label>
                            <select className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all appearance-none">
                                <option value="">—</option>
                                {Object.entries(t.raw('booking.occasions') as Record<string, string>).map(([key, val]) => (
                                    <option key={key} value={key}>{val}</option>
                                ))}
                            </select>
                        </div>

                        {/* Size */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-navy-600 mb-2">{t('booking.size')}</label>
                            <select className="w-full px-4 py-3 bg-off-white border border-gray-200 rounded-xl focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all appearance-none">
                                <option value="">—</option>
                                {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Button */}
                        <div className="flex flex-col justify-end">
                            <button className="w-full px-6 py-3 bg-emerald hover:bg-emerald-dark text-white font-bold rounded-xl text-base transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald/25">
                                {t('booking.check_availability')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
