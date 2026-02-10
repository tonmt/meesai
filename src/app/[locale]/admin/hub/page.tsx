import Link from "next/link";
import {
    ArrowLeft,
    Warehouse,
    Package,
    Truck,
    ClipboardCheck,
    Sparkles,
    CheckCircle,
    RotateCcw,
    User,
    Calendar,
    Shield,
} from "lucide-react";
import { getHubStats, getHubBookings } from "./actions";
import HubActionButtons from "./HubActionButtons";

const statusStyles: Record<string, { color: string; label: string; emoji: string }> = {
    CONFIRMED: { color: "bg-blue-100 text-blue-700", label: "ຮໍຮັບເຂົ້າ Hub", emoji: "📥" },
    AT_HUB: { color: "bg-accent-100 text-accent-700", label: "ຢູ່ Hub", emoji: "🏭" },
    SHIPPING: { color: "bg-indigo-100 text-indigo-700", label: "ກຳລັງສົ່ງ", emoji: "🚚" },
    RETURNED: { color: "bg-amber-100 text-amber-700", label: "ລູກຄ້າສົ່ງຄືນ", emoji: "📦" },
    RETURNED_TO_HUB: { color: "bg-orange-100 text-orange-700", label: "ກັບ Hub", emoji: "🔄" },
    QC_CHECKING: { color: "bg-yellow-100 text-yellow-700", label: "QC", emoji: "🔍" },
    CLEANING: { color: "bg-purple-100 text-purple-700", label: "ຊັກແຫ້ງ", emoji: "✨" },
    RETURNED_TO_SHOP: { color: "bg-green-100 text-green-700", label: "ຄືນຮ້ານ", emoji: "🏪" },
};

type Props = {
    searchParams: Promise<{ tab?: string }>;
};

export default async function HubDashboardPage({ searchParams }: Props) {
    const params = await searchParams;
    const activeTab = params.tab || "incoming";
    const [stats, bookings] = await Promise.all([
        getHubStats(),
        getHubBookings(activeTab),
    ]);

    const tabs = [
        { key: "incoming", label: `📥 ຮັບເຂົ້າ (${stats.awaitingReceive})`, icon: Package },
        { key: "atHub", label: `🏭 ຢູ່ Hub (${stats.atHub})`, icon: Warehouse },
        { key: "returnedToHub", label: `🔄 ຄືນ Hub (${stats.returnedToHub})`, icon: RotateCcw },
        { key: "cleaning", label: `✨ ຊັກ (${stats.cleaning})`, icon: Sparkles },
        { key: "all", label: "📋 ທັງໝົດ", icon: ClipboardCheck },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a1a] pb-12">
            {/* ── Header ── */}
            <header className="bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3e] to-[#1e3a5f] text-white px-4 pt-6 pb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/account" className="p-1 hover:bg-white/10 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Warehouse className="w-5 h-5 text-amber-400" />
                            <h1 className="font-bold text-lg">MeeSai Hub</h1>
                        </div>
                    </div>

                    {/* Flow Visualization */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                        <p className="text-[10px] text-white/50 mb-3 uppercase tracking-wider font-bold">Fulfillment Flow</p>
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide text-[9px]">
                            {["ຮ້ານ", "→", "🏭 Hub QC", "→", "📦 ແພັກ", "→", "🚚 ສົ່ງ", "→", "👕 ໃຊ້ງານ", "→", "📦 ຄືນ", "→", "🏭 Hub QC", "→", "✨ ຊັກ", "→", "🏪 ຄືນຮ້ານ"].map((step, i) => (
                                <span key={i} className={`whitespace-nowrap ${step === "→" ? "text-white/30" : "bg-white/10 px-1.5 py-0.5 rounded shrink-0"}`}>
                                    {step}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-5 gap-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                            <p className="text-lg font-bold">{stats.awaitingReceive}</p>
                            <p className="text-[8px] text-white/50">ຮໍຮັບ</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                            <p className="text-lg font-bold">{stats.atHub}</p>
                            <p className="text-[8px] text-white/50">ຢູ່ Hub</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                            <p className="text-lg font-bold">{stats.returnedToHub}</p>
                            <p className="text-[8px] text-white/50">ຄືນ Hub</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                            <p className="text-lg font-bold">{stats.cleaning}</p>
                            <p className="text-[8px] text-white/50">ຊັກ</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                            <p className="text-lg font-bold">{stats.readyToShip}</p>
                            <p className="text-[8px] text-white/50">QC</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 -mt-4">
                {/* ── Tabs ── */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                    {tabs.map(t => (
                        <Link
                            key={t.key}
                            href={`/admin/hub?tab=${t.key}`}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTab === t.key
                                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                        >
                            {t.label}
                        </Link>
                    ))}
                </div>

                {/* ── Booking Cards ── */}
                <div className="space-y-3">
                    {bookings.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                            <p className="text-white font-bold">ບໍ່ມີ Order ໃນຄິວ 🎉</p>
                            <p className="text-xs text-white/50 mt-1">ລໍຖ້າ order ໃໝ່</p>
                        </div>
                    ) : (
                        bookings.map((booking) => {
                            const st = statusStyles[booking.status] || statusStyles.CONFIRMED;
                            return (
                                <div key={booking.id} className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                                    {/* Card Header */}
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 text-lg">
                                                {st.emoji}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.color}`}>
                                                        {st.label}
                                                    </span>
                                                    <span className="text-[10px] text-surface-400">#{booking.id.slice(-6)}</span>
                                                </div>
                                                <p className="text-sm font-bold text-primary-900 truncate">
                                                    {booking.garment.titleLo} ({booking.garment.code})
                                                </p>
                                                <p className="text-[10px] text-surface-500 mt-0.5">
                                                    🏪 {booking.garment.shop?.nameLo || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Context */}
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-200">
                                            <div className="flex items-center gap-1.5 text-xs text-surface-500">
                                                <User className="w-3 h-3" />
                                                <span>{booking.renter.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-surface-500">
                                                <Calendar className="w-3 h-3" />
                                                <span>
                                                    {new Date(booking.pickupDate).toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                                    {" → "}
                                                    {new Date(booking.returnDate).toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                                </span>
                                            </div>
                                            {booking.trackingCode && (
                                                <div className="flex items-center gap-1 text-xs text-accent-500">
                                                    <Truck className="w-3 h-3" />
                                                    <span>{booking.trackingCode}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="border-t border-surface-200 p-4 bg-surface-50">
                                        <HubActionButtons bookingId={booking.id} status={booking.status} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
