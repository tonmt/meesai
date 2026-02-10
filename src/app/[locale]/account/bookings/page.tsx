import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    ArrowLeft,
    CreditCard,
    Truck,
    Shirt,
    RotateCcw,
    Star,
    ChevronRight,
    Calendar,
    Clock,
    ShoppingBag,
} from "lucide-react";

type Props = {
    searchParams: Promise<{ tab?: string }>;
};

const STATUS_CONFIG: Record<string, { statuses: string[]; icon: typeof CreditCard; color: string; label: string }> = {
    toPay: { statuses: ["AWAITING_PAYMENT"], icon: CreditCard, color: "text-red-500 bg-red-50", label: "ທີ່ຕ້ອງຊຳລະ" },
    toReceive: { statuses: ["CONFIRMED", "SHIPPING"], icon: Truck, color: "text-blue-500 bg-blue-50", label: "ທີ່ຕ້ອງໄດ້ຮັບ" },
    inUse: { statuses: ["PICKED_UP", "IN_USE"], icon: Shirt, color: "text-green-500 bg-green-50", label: "ກຳລັງໃຊ້ງານ" },
    toReturn: { statuses: ["AWAITING_RETURN"], icon: RotateCcw, color: "text-orange-500 bg-orange-50", label: "ທີ່ຕ້ອງຄືນ" },
    toRate: { statuses: ["COMPLETED"], icon: Star, color: "text-amber-500 bg-amber-50", label: "ໃຫ້ຄະແນນ" },
    all: { statuses: [], icon: ShoppingBag, color: "text-primary-900 bg-surface-100", label: "ທັງໝົດ" },
};

export default async function BookingsPage({ searchParams }: Props) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const t = await getTranslations();
    const { tab = "all" } = await searchParams;
    const config = STATUS_CONFIG[tab] || STATUS_CONFIG.all;

    const where: Record<string, unknown> = { renterId: session.user.id };
    if (config.statuses.length > 0) {
        where.status = { in: config.statuses };
    }

    const bookings = await prisma.booking.findMany({
        where,
        include: {
            garment: { include: { images: { take: 1 }, category: true, shop: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    const tabs = ["all", "toPay", "toReceive", "inUse", "toReturn", "toRate"];

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/account" className="p-1 hover:bg-surface-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-primary-900" />
                    </Link>
                    <h1 className="font-bold text-primary-900">{t("account.myBookings")}</h1>
                </div>
                {/* Tab Bar */}
                <div className="overflow-x-auto scrollbar-hide border-b border-surface-200">
                    <div className="max-w-xl mx-auto flex px-4">
                        {tabs.map((t) => {
                            const tc = STATUS_CONFIG[t];
                            return (
                                <Link
                                    key={t}
                                    href={`/account/bookings?tab=${t}`}
                                    className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t
                                            ? "border-accent-500 text-accent-500"
                                            : "border-transparent text-surface-500 hover:text-primary-900"
                                        }`}
                                >
                                    {tc.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-3">
                {bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <Link
                            key={booking.id}
                            href={`/account/bookings/${booking.id}`}
                            className="block bg-white rounded-xl border border-surface-300 overflow-hidden card-hover"
                        >
                            {/* Status Header */}
                            <div className={`px-4 py-2 flex items-center justify-between text-xs ${booking.status === "AWAITING_PAYMENT"
                                    ? "bg-red-50 text-red-600"
                                    : booking.status === "IN_USE" || booking.status === "PICKED_UP"
                                        ? "bg-green-50 text-green-600"
                                        : booking.status === "AWAITING_RETURN"
                                            ? "bg-orange-50 text-orange-600"
                                            : "bg-surface-50 text-surface-500"
                                }`}>
                                <span className="font-semibold">{booking.garment.shop?.nameLo || "ร้านค้า"}</span>
                                <span className="font-bold uppercase">{booking.status.replace(/_/g, " ")}</span>
                            </div>

                            {/* Garment Info */}
                            <div className="p-4 flex gap-3">
                                <div className="w-20 h-24 bg-surface-200 rounded-lg shrink-0 flex items-center justify-center">
                                    <Shirt className="w-8 h-8 text-surface-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-primary-900 line-clamp-2 mb-1">
                                        {booking.garment.titleLo}
                                    </p>
                                    <p className="text-xs text-surface-500 mb-2">
                                        ໄຊສ໌: {booking.garment.size} | {booking.garment.category.nameLo}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-surface-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {booking.pickupDate.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                        </span>
                                        <span>→</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {booking.returnDate.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-accent-500">
                                        {booking.totalAmount.toLocaleString()} ₭
                                    </p>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="px-4 py-2.5 border-t border-surface-200 flex items-center justify-between">
                                <p className="text-[11px] text-surface-500">
                                    {booking.status === "AWAITING_RETURN" && "⚠️ ກະລຸນາຄືນຊຸດ"}
                                    {booking.status === "IN_USE" && "⏰ ກຳລັງໃຊ້ງານ"}
                                    {booking.status === "AWAITING_PAYMENT" && "💳 ກະລຸນາຊຳລະເງິນ"}
                                </p>
                                <ChevronRight className="w-4 h-4 text-surface-400" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                        <p className="font-bold text-primary-900 text-lg">ບໍ່ມີລາຍການ</p>
                        <p className="text-surface-500 text-sm mt-1">ກະລຸນາເລືອກຊຸດ ແລ້ວກົດຈອງ</p>
                        <Link
                            href="/browse"
                            className="inline-block mt-4 px-6 py-2.5 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-colors"
                        >
                            ເລືອກຊຸດ
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
