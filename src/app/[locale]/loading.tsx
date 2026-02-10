export default function Loading() {
    return (
        <div className="min-h-screen bg-surface-150 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-primary-900/80 h-48" />

            <div className="max-w-xl mx-auto px-4 -mt-6 space-y-4">
                {/* Card Skeleton 1 */}
                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-4">
                    <div className="h-4 bg-surface-200 rounded w-1/3 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-12 bg-surface-100 rounded-xl" />
                        <div className="h-12 bg-surface-100 rounded-xl" />
                    </div>
                </div>

                {/* Card Skeleton 2 */}
                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-4">
                    <div className="h-4 bg-surface-200 rounded w-1/4 mb-4" />
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 bg-surface-100 rounded-full" />
                                <div className="h-2 bg-surface-100 rounded w-10" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card Skeleton 3 */}
                <div className="bg-white rounded-2xl shadow-sm border border-surface-200 p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-surface-100 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-surface-200 rounded w-2/3" />
                                <div className="h-2 bg-surface-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
