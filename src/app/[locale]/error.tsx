'use client'

import { useLocale, useTranslations } from 'next-intl'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const locale = useLocale()
    const t = useTranslations()

    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-royal-navy mb-3">
                    {locale === 'lo' ? 'ເກີດຂໍ້ຜິດພາດ' : 'Something went wrong'}
                </h1>
                <p className="text-navy-600 mb-8">
                    {locale === 'lo'
                        ? 'ລະບົບມີບັນຫາ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ'
                        : 'An unexpected error occurred. Please try again.'}
                </p>

                {/* Error digest for debugging */}
                {error.digest && (
                    <p className="text-xs text-gray-300 font-mono mb-6 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                        Error ID: {error.digest}
                    </p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="w-full sm:w-auto px-6 py-3 bg-champagne-gold text-royal-navy font-bold rounded-xl hover:bg-champagne-gold/90 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {locale === 'lo' ? 'ລອງໃໝ່' : 'Try Again'}
                    </button>
                    <Link
                        href={`/${locale}`}
                        className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-navy-600 font-medium rounded-xl hover:border-champagne-gold transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        {locale === 'lo' ? 'ໜ້າຫຼັກ' : 'Home'}
                    </Link>
                </div>
            </div>
        </div>
    )
}
