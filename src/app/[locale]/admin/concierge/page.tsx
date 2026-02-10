import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
    ArrowLeft,
    LifeBuoy,
    Inbox,
    Clock,
    CheckCircle,
    BarChart3,
    Camera,
    Ruler,
    CalendarCheck,
    CreditCard,
    Truck,
    AlertTriangle,
    HelpCircle,
    User,
    ChevronRight,
    Shield,
} from "lucide-react";
import { getTicketStats, getTickets } from "./actions";
import TicketResponseForm from "./TicketResponseForm";

const categoryIcons: Record<string, { icon: typeof Camera; color: string; label: string }> = {
    PHOTO_REQUEST: { icon: Camera, color: "text-blue-500 bg-blue-50", label: "📸 ຂໍຮູບຈິງ" },
    SIZE_INQUIRY: { icon: Ruler, color: "text-purple-500 bg-purple-50", label: "📏 ຂະໜາດ" },
    AVAILABILITY: { icon: CalendarCheck, color: "text-green-500 bg-green-50", label: "📅 ເຊັກຄິວ" },
    DEPOSIT_QUERY: { icon: CreditCard, color: "text-amber-500 bg-amber-50", label: "💳 ມັດຈຳ" },
    DELIVERY: { icon: Truck, color: "text-accent-500 bg-accent-50", label: "🚚 ຈັດສົ່ງ" },
    DAMAGE: { icon: AlertTriangle, color: "text-red-500 bg-red-50", label: "⚠️ Damage" },
    GENERAL: { icon: HelpCircle, color: "text-surface-500 bg-surface-100", label: "💬 ທົ່ວໄປ" },
};

const statusStyles: Record<string, string> = {
    OPEN: "bg-red-100 text-red-700",
    IN_PROGRESS: "bg-amber-100 text-amber-700",
    WAITING: "bg-blue-100 text-blue-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-surface-200 text-surface-600",
};

type Props = {
    searchParams: Promise<{ status?: string }>;
};

export default async function ConciergeDashboardPage({ searchParams }: Props) {
    const t = await getTranslations();
    const params = await searchParams;
    const activeFilter = params.status || "OPEN";
    const [stats, tickets] = await Promise.all([
        getTicketStats(),
        getTickets(activeFilter),
    ]);

    const filters = [
        { key: "OPEN", label: `🔴 Open (${stats.open})` },
        { key: "IN_PROGRESS", label: `🟡 In Progress (${stats.inProgress})` },
        { key: "ALL", label: `📋 All (${stats.total})` },
    ];

    return (
        <div className="min-h-screen bg-[#0f0f23] pb-12">
            {/* ── Header ── */}
            <header className="bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f3460] text-white px-4 pt-6 pb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/account" className="p-1 hover:bg-white/10 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <LifeBuoy className="w-5 h-5 text-accent-400" />
                            <h1 className="font-bold text-lg">MeeSai Concierge</h1>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                            <Inbox className="w-5 h-5 mx-auto mb-1 text-red-400" />
                            <p className="text-2xl font-bold">{stats.open}</p>
                            <p className="text-[10px] text-white/60">Open</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                            <Clock className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                            <p className="text-2xl font-bold">{stats.inProgress}</p>
                            <p className="text-[10px] text-white/60">In Progress</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-400" />
                            <p className="text-2xl font-bold">{stats.resolvedToday}</p>
                            <p className="text-[10px] text-white/60">Resolved Today</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 -mt-4">
                {/* ── Filter Tabs ── */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
                    {filters.map((f) => (
                        <Link
                            key={f.key}
                            href={`/admin/concierge?status=${f.key}`}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === f.key
                                    ? "bg-accent-500 text-white shadow-lg shadow-accent-500/30"
                                    : "bg-white/10 text-white/70 hover:bg-white/20"
                                }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                {/* ── Ticket List ── */}
                <div className="space-y-3">
                    {tickets.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                            <p className="text-white font-bold">ບໍ່ມີ Ticket ໃນຄິວ 🎉</p>
                            <p className="text-xs text-white/50 mt-1">ທຸກ ticket ຖືກແກ້ໄຂແລ້ວ</p>
                        </div>
                    ) : (
                        tickets.map((ticket) => {
                            const cat = categoryIcons[ticket.category] || categoryIcons.GENERAL;
                            const CatIcon = cat.icon;
                            return (
                                <div key={ticket.id} className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                                    {/* Ticket Header */}
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                                                <CatIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{}} >
                                                        {cat.label}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[ticket.status]}`}>
                                                        {ticket.status}
                                                    </span>
                                                    {ticket.priority >= 2 && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                                                            🔥 URGENT
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-bold text-primary-900 truncate">{ticket.subject}</p>
                                                <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{ticket.message}</p>
                                            </div>
                                        </div>

                                        {/* Customer + Booking Context */}
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-200">
                                            <div className="flex items-center gap-1.5 text-xs text-surface-500">
                                                <User className="w-3 h-3" />
                                                <span>{ticket.customer.name}</span>
                                                <span className="text-surface-400">({ticket.customer.phone})</span>
                                            </div>
                                            {ticket.booking && (
                                                <div className="flex items-center gap-1.5 text-xs text-accent-500">
                                                    <Shield className="w-3 h-3" />
                                                    <span>{ticket.booking.garment?.titleLo} ({ticket.booking.garment?.code})</span>
                                                </div>
                                            )}
                                            <span className="ml-auto text-[10px] text-surface-400">
                                                {new Date(ticket.createdAt).toLocaleString("lo-LA", {
                                                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </span>
                                        </div>

                                        {/* Existing Response */}
                                        {ticket.response && (
                                            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                                                <p className="text-[10px] font-bold text-green-700 mb-1">
                                                    ✅ ຄຳຕອບ ({ticket.assignee?.name || "Admin"}):
                                                </p>
                                                <p className="text-xs text-green-600">{ticket.response}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Response Form (only for non-resolved) */}
                                    {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                                        <TicketResponseForm ticketId={ticket.id} category={ticket.category} />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
