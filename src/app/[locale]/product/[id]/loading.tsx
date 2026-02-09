export default function Loading() {
    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern">
            <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
                {/* Breadcrumb skeleton */}
                <div className="h-4 w-24 bg-gray-100 rounded mb-4" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    {/* Left: Gallery skeleton */}
                    <div className="space-y-4">
                        <div className="aspect-[4/3] md:aspect-[3/4] bg-gray-100 rounded-3xl" />
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
                            ))}
                        </div>
                    </div>

                    {/* Right: Info skeleton */}
                    <div className="space-y-6">
                        {/* Title + Price */}
                        <div className="space-y-3">
                            <div className="h-8 w-3/4 bg-gray-200 rounded" />
                            <div className="h-4 w-full bg-gray-100 rounded" />
                            <div className="h-10 w-40 bg-red-100 rounded mt-4" />
                        </div>

                        {/* Specs */}
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <div className="h-5 w-20 bg-gray-200 rounded mb-3" />
                            <div className="grid grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-3 h-16" />
                                ))}
                            </div>
                        </div>

                        {/* Assets skeleton */}
                        <div className="glass rounded-2xl p-5 border border-white/60">
                            <div className="h-5 w-28 bg-gray-200 rounded mb-3" />
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-gray-50 rounded-xl" />
                                ))}
                            </div>
                        </div>

                        {/* CTA skeleton */}
                        <div className="h-14 bg-champagne-gold/20 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
