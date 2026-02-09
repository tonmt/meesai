export default function Loading() {
    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
                {/* Header skeleton */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-7 w-7 bg-gray-200 rounded" />
                    <div className="h-6 w-36 bg-gray-200 rounded-xl" />
                </div>

                {/* Tabs skeleton */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 w-24 bg-gray-100 rounded-xl" />
                    ))}
                </div>

                {/* Stats cards skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass rounded-2xl p-4 border border-white/60">
                            <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
                            <div className="h-8 w-20 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>

                {/* Content skeleton */}
                <div className="glass rounded-2xl p-5 border border-white/60 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                                <div className="h-3 w-1/4 bg-gray-100 rounded" />
                            </div>
                            <div className="h-6 w-16 bg-gray-100 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
