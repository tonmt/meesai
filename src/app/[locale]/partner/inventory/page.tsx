import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
    ArrowLeft,
    Crown,
    Warehouse,
    Shirt,
    Calendar,
    ChevronRight,
    CircleDot,
    Wrench,
    Ban,
    Eye,
} from "lucide-react";
import { getPartnerInventory } from "../actions";
import InventoryActionButtons from "@/components/partner/InventoryActionButtons";

const STATUS_BADGE: Record<string, { label: string; color: string; icon: typeof CircleDot }> = {
    AVAILABLE: { label: "🟢 ວ່າງ", color: "bg-green-100 text-green-700", icon: CircleDot },
    RENTED: { label: "🔴 ເຊົ່າແລ້ວ", color: "bg-red-100 text-red-700", icon: CircleDot },
    RESERVED: { label: "🟡 ຈອງແລ້ວ", color: "bg-amber-100 text-amber-700", icon: CircleDot },
    MAINTENANCE: { label: "🔧 ຊ່ອມ/ຊັກ", color: "bg-blue-100 text-blue-700", icon: Wrench },
    DRAFT: { label: "📝 ຮ່າງ", color: "bg-surface-100 text-surface-600", icon: CircleDot },
    RETIRED: { label: "⛔ ປິດໃຊ້", color: "bg-surface-200 text-surface-500", icon: Ban },
};

export default async function PartnerInventoryPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const t = await getTranslations();

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== "OWNER" && role !== "ADMIN") redirect("/account");

    const inventory = await getPartnerInventory(session.user.id as string);

    // Group by status
    const statusCounts = inventory.reduce(
        (acc, g) => {
            acc[g.status] = (acc[g.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-[#1a1a2e] text-white">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/partner" className="p-1 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h1 className="font-bold">ຄລັງສິນຄ້າ</h1>
                    <span className="ml-auto text-xs text-white/50">{inventory.length} ຊຸດ</span>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {/* ════════════════════════════════════════
           STATUS OVERVIEW
           ════════════════════════════════════════ */}
                <div className="grid grid-cols-3 gap-2">
                    {["AVAILABLE", "RENTED", "MAINTENANCE"].map((status) => {
                        const badge = STATUS_BADGE[status];
                        return (
                            <div key={status} className={`rounded-xl p-3 text-center ${badge?.color || ""}`}>
                                <p className="text-2xl font-extrabold">{statusCounts[status] || 0}</p>
                                <p className="text-[10px] font-medium">{badge?.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* ════════════════════════════════════════
           GARMENT LIST WITH CALENDAR
           ════════════════════════════════════════ */}
                {inventory.length > 0 ? (
                    <div className="space-y-3">
                        {inventory.map((garment) => {
                            const badge = STATUS_BADGE[garment.status] || STATUS_BADGE.DRAFT;

                            return (
                                <div
                                    key={garment.id}
                                    className="bg-white rounded-xl border border-surface-300 overflow-hidden card-hover"
                                >
                                    <div className="flex gap-3 p-4">
                                        {/* Image */}
                                        <div className="w-16 h-20 bg-surface-200 rounded-lg shrink-0 flex items-center justify-center">
                                            <Shirt className="w-6 h-6 text-surface-400" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-bold text-primary-900 line-clamp-1">
                                                        {garment.titleLo}
                                                    </p>
                                                    <p className="text-[11px] text-surface-500">
                                                        {garment.code} | {garment.size} | {garment.category.nameLo}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-sm font-bold text-accent-500">
                                                    {garment.rentalPrice.toLocaleString()} ₭ <span className="text-[10px] text-surface-500 font-normal">/ຄັ້ງ</span>
                                                </p>
                                                <p className="text-[11px] text-surface-500">
                                                    📊 ເຊົ່າແລ້ວ {garment.totalRentals} ຄັ້ງ
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Mini Calendar Timeline (Gantt-style) ── */}
                                    {garment.bookings.length > 0 && (
                                        <div className="px-4 pb-3">
                                            <div className="flex items-center gap-1 mb-2">
                                                <Calendar className="w-3 h-3 text-surface-400" />
                                                <span className="text-[10px] text-surface-500 font-medium">
                                                    ປະຕິທິນການຈອງ
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {garment.bookings.map((booking) => {
                                                    const start = booking.pickupDate;
                                                    const end = booking.returnDate;
                                                    const isActive = booking.status === "PICKED_UP" || booking.status === "IN_USE";
                                                    const isUpcoming = booking.status === "CONFIRMED" || booking.status === "PENDING";

                                                    return (
                                                        <div
                                                            key={booking.id}
                                                            className={`flex items-center gap-2 px-2 py-1 rounded text-[10px] ${isActive
                                                                ? "bg-red-100 text-red-700"
                                                                : isUpcoming
                                                                    ? "bg-amber-50 text-amber-700"
                                                                    : "bg-surface-100 text-surface-600"
                                                                }`}
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-red-500" : isUpcoming ? "bg-amber-500" : "bg-surface-400"
                                                                }`} />
                                                            <span className="font-medium">
                                                                {start.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                                                {" → "}
                                                                {end.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                                            </span>
                                                            <span className="ml-auto truncate max-w-[80px]">
                                                                👤 {booking.renter.name}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="px-4 py-2 border-t border-surface-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {garment.status === "AVAILABLE" && (
                                                <InventoryActionButtons garmentId={garment.id} />
                                            )}
                                        </div>
                                        <Link
                                            href={`/partner/inventory/${garment.id}`}
                                            className="text-[10px] px-2 py-1 text-accent-500 font-semibold flex items-center gap-0.5"
                                        >
                                            <Eye className="w-3 h-3" /> ລາຍລະອຽດ
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Warehouse className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                        <p className="font-bold text-primary-900 text-lg">ຍັງບໍ່ມີສິນຄ້າ</p>
                        <p className="text-surface-500 text-sm mt-1">ເພີ່ມຊຸດທຳອິດເພື່ອເລີ່ມຕົ້ນ</p>
                    </div>
                )}
            </div>
        </div>
    );
}
