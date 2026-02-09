export default function Loading() {
    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div className="h-7 w-48 bg-gray-200 rounded-xl" />
                    <div className="h-5 w-24 bg-gray-100 rounded-full" />
                </div>

                {/* Filter bar skeleton */}
                <div className="flex gap-3 mb-6 overflow-hidden">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 w-28 bg-gray-100 rounded-xl flex-shrink-0" />
                    ))}
                </div>

                {/* Desktop: Table skeleton */}
                <div className="hidden md:block glass rounded-2xl border border-white/60 overflow-hidden">
                    <div className="bg-royal-navy/5 h-10" />
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3 border-t border-gray-100">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-40 bg-gray-200 rounded" />
                                <div className="h-3 w-24 bg-gray-100 rounded" />
                            </div>
                            <div className="h-4 w-16 bg-gray-100 rounded" />
                            <div className="h-4 w-12 bg-gray-100 rounded" />
                            <div className="h-6 w-20 bg-gray-100 rounded-full" />
                            <div className="h-5 w-16 bg-gray-100 rounded-full" />
                            <div className="h-7 w-14 bg-champagne-gold/10 rounded-lg" />
                        </div>
                    ))}
                </div>

                {/* Mobile: Card grid skeleton */}
                <div className="md:hidden grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass rounded-2xl overflow-hidden border border-white/60">
                            <div className="aspect-[3/4] bg-gray-100" />
                            <div className="p-3 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                <div className="h-3 w-1/2 bg-gray-100 rounded" />
                                <div className="h-5 w-20 bg-red-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
