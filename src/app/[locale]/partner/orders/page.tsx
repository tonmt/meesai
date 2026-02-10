import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
    ArrowLeft,
    Crown,
    Package,
    Truck,
    Shirt,
    RotateCcw,
    ClipboardCheck,
    CheckCircle,
    ShoppingBag,
    Phone,
    Calendar,
    ChevronRight,
} from "lucide-react";
import { getPartnerOrders } from "../actions";
import ShipOrderButton from "@/components/partner/ShipOrderButton";

type Props = {
    searchParams: Promise<{ tab?: string }>;
};

const TABS = [
    { key: "all", label: "ທັງໝົດ", icon: ShoppingBag },
    { key: "toShip", label: "ຕ້ອງສົ່ງ", icon: Package },
    { key: "shipping", label: "ກຳລັງສົ່ງ", icon: Truck },
    { key: "inUse", label: "ໃຊ້ງານ", icon: Shirt },
    { key: "qcCheck", label: "ກວດ QC", icon: ClipboardCheck },
    { key: "completed", label: "ສຳເລັດ", icon: CheckCircle },
];

export default async function PartnerOrdersPage({ searchParams }: Props) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const t = await getTranslations();

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== "OWNER" && role !== "ADMIN") redirect("/account");

    const { tab = "all" } = await searchParams;
    const orders = await getPartnerOrders(session.user.id as string, tab);

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-[#1a1a2e] text-white">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/partner" className="p-1 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h1 className="font-bold">ຈັດການອໍເດີ</h1>
                    <span className="ml-auto text-xs text-white/50">{orders.length} ລາຍການ</span>
                </div>
                {/* Tab Bar */}
                <div className="overflow-x-auto scrollbar-hide border-b border-white/10">
                    <div className="max-w-xl mx-auto flex px-4">
                        {TABS.map((t) => (
                            <Link
                                key={t.key}
                                href={`/partner/orders?tab=${t.key}`}
                                className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-1 ${tab === t.key
                                    ? "border-amber-400 text-amber-400"
                                    : "border-transparent text-white/50 hover:text-white/80"
                                    }`}
                            >
                                <t.icon className="w-3 h-3" />
                                {t.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-3">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl border border-surface-300 overflow-hidden"
                        >
                            {/* Status Header */}
                            <div className={`px-4 py-2 flex items-center justify-between text-xs ${order.status === "CONFIRMED"
                                ? "bg-blue-50 text-blue-600"
                                : order.status === "RETURNED"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-surface-50 text-surface-500"
                                }`}>
                                <span className="font-bold uppercase">{order.status.replace(/_/g, " ")}</span>
                                <span className="text-[10px]">
                                    {order.updatedAt.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                </span>
                            </div>

                            {/* Order Info */}
                            <div className="p-4">
                                <div className="flex gap-3 mb-3">
                                    <div className="w-16 h-20 bg-surface-200 rounded-lg shrink-0 flex items-center justify-center">
                                        <Shirt className="w-6 h-6 text-surface-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-primary-900 line-clamp-1">
                                            {order.garment.titleLo}
                                        </p>
                                        <p className="text-xs text-surface-500 mt-0.5">
                                            ໄຊສ໌: {order.garment.size} | {order.garment.code}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-xs">
                                            <Calendar className="w-3 h-3 text-surface-400" />
                                            <span className="text-surface-500">
                                                {order.pickupDate.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                                {" → "}
                                                {order.returnDate.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-status-success">
                                            {order.rentalFee.toLocaleString()} ₭
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="flex items-center gap-2 px-3 py-2 bg-surface-50 rounded-lg">
                                    <div className="w-7 h-7 bg-primary-900/10 rounded-full flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-primary-900">
                                            {order.renter.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-primary-900">{order.renter.name}</p>
                                        <p className="text-[10px] text-surface-500">{order.renter.phone}</p>
                                    </div>
                                    <a href={`tel:${order.renter.phone}`} className="p-1.5 bg-green-100 rounded-lg">
                                        <Phone className="w-3.5 h-3.5 text-green-600" />
                                    </a>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-4 py-2.5 border-t border-surface-200 flex items-center justify-end gap-2">
                                {order.status === "CONFIRMED" && (
                                    <ShipOrderButton bookingId={order.id} />
                                )}
                                {order.status === "RETURNED" && (
                                    <Link
                                        href={`/partner/qc/${order.id}`}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <ClipboardCheck className="w-3.5 h-3.5" />
                                        ກວດ QC
                                    </Link>
                                )}
                                {order.status === "COMPLETED" && (
                                    <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" /> ສຳເລັດ
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                        <p className="font-bold text-primary-900 text-lg">ບໍ່ມີລາຍການ</p>
                        <p className="text-surface-500 text-sm mt-1">ຍັງບໍ່ມີອໍເດີໃນໝວດນີ້</p>
                    </div>
                )}
            </div>
        </div>
    );
}
