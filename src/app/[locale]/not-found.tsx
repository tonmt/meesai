import { Search, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* 404 Number */}
                <div className="text-[120px] md:text-[160px] font-black text-champagne-gold/15 leading-none select-none mb-[-30px]">
                    404
                </div>

                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 bg-champagne-gold/10 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-champagne-gold" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-royal-navy mb-3">
                    ບໍ່ພົບໜ້ານີ້
                </h1>
                <p className="text-navy-600 mb-8 text-sm">
                    Page not found — ກະລຸນາກວດສອບ URL ຫຼື ກັບຄືນໜ້າຫຼັກ
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-6 py-3 bg-champagne-gold text-royal-navy font-bold rounded-xl hover:bg-champagne-gold/90 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        ໜ້າຫຼັກ / Home
                    </Link>
                    <Link
                        href="/lo/browse"
                        className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-navy-600 font-medium rounded-xl hover:border-champagne-gold transition-all flex items-center justify-center gap-2"
                    >
                        <Search className="w-4 h-4" />
                        ເບິ່ງຊຸດ / Browse
                    </Link>
                </div>
            </div>
        </div>
    )
}
