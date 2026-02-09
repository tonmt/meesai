'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Lock, User, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { registerUser, loginUser } from '@/actions/auth';

export default function LoginPage() {
    const t = useTranslations('login');
    const locale = useLocale();
    const router = useRouter();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);

        try {
            if (mode === 'register') {
                const result = await registerUser(formData);
                if (result.success) {
                    router.push(`/${locale}`);
                    router.refresh();
                } else {
                    setError(result.error || 'Error');
                }
            } else {
                const result = await loginUser(formData);
                if (result.success) {
                    // Role-based redirect
                    const dest = result.role === 'ADMIN' ? `/${locale}/admin`
                        : result.role === 'OWNER' ? `/${locale}/owner`
                            : result.role === 'STAFF' ? `/${locale}/staff`
                                : `/${locale}`;
                    router.push(dest);
                    router.refresh();
                } else {
                    setError(result.error || 'Error');
                }
            }
        } catch {
            setError(t('error'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 hero-bg-light gold-dots-pattern">
            <div className="w-full max-w-md">

                {/* Card */}
                <div className="glass rounded-3xl p-8 shadow-xl border border-white/60">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-royal-navy mb-2" style={{ fontFamily: 'var(--font-serif-lao)' }}>
                            ມີໃສ່
                        </h1>
                        <p className="text-navy-600 text-sm">
                            {mode === 'login' ? t('sign_in') : t('create_account')}
                        </p>
                    </div>

                    {/* Error/Success */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-emerald/10 border border-emerald/30 rounded-xl text-sm text-emerald text-center">
                            {success}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-navy-600 mb-1.5">
                                    {t('name')}
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        placeholder={t('name_placeholder')}
                                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1.5">
                                {t('phone')}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="020-XXXX-XXXX"
                                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-navy-600 mb-1.5">
                                {t('password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    placeholder={t('password_placeholder')}
                                    className="w-full pl-10 pr-10 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-navy-600 mb-1.5">
                                    {t('confirm_password')}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        placeholder={t('confirm_placeholder')}
                                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm text-royal-navy placeholder:text-gray-400 focus:outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-champagne-gold text-royal-navy font-bold rounded-xl text-base hover:bg-champagne-gold/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-champagne-gold/20"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === 'login' ? t('sign_in') : t('create_account')}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">
                            {t('or')}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Toggle */}
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
                        className="w-full py-3 bg-white border border-gray-200 text-navy-600 font-medium rounded-xl text-sm hover:border-champagne-gold hover:text-champagne-gold transition-all"
                    >
                        {mode === 'login' ? t('no_account') : t('has_account')}
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-navy-600/60 mt-6">
                    {t('terms')}
                </p>
            </div>
        </div>
    );
}
