export default function Loading() {
    return (
        <div className="min-h-screen hero-bg-light gold-dots-pattern flex items-center justify-center">
            <div className="text-center animate-pulse">
                {/* Spinner ring */}
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-champagne-gold/20 border-t-champagne-gold rounded-full animate-spin" />
                <p className="text-navy-600 text-sm">ກຳລັງໂຫລດ...</p>
            </div>
        </div>
    )
}
