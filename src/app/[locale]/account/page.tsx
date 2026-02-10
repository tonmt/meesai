import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import {
    Wallet,

    CreditCard,
    ArrowDownToLine,
    Ticket,
    ShoppingBag,
    Truck,
    Shirt,
    RotateCcw,
    Star,
    Ruler,
    Heart,
    Headphones,
    Crown,
    ChevronRight,
    Settings,
    Bell,
} from "lucide-react";
import { getOrCreateWallet, getBookingStatusCounts } from "./actions";

export default async function MyAccountPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const t = await getTranslations();
    const userId = session.user.id as string;
    const wallet = await getOrCreateWallet(userId);
    const counts = await getBookingStatusCounts(userId);

    const statusItems = [
        { icon: CreditCard, label: "ທີ່ຕ້ອງຊຳລະ", count: counts.toPay, href: "/account/bookings?tab=toPay", color: "text-red-500" },
        { icon: Truck, label: "ທີ່ຕ້ອງໄດ້ຮັບ", count: counts.toReceive, href: "/account/bookings?tab=toReceive", color: "text-blue-500" },
        { icon: Shirt, label: "ກຳລັງໃຊ້ງານ", count: counts.inUse, href: "/account/bookings?tab=inUse", color: "text-green-500" },
        { icon: RotateCcw, label: "ທີ່ຕ້ອງຄືນ", count: counts.toReturn, href: "/account/bookings?tab=toReturn", color: "text-orange-500" },
        { icon: Star, label: "ໃຫ້ຄະແນນ", count: counts.toRate, href: "/account/bookings?tab=toRate", color: "text-amber-500" },
    ];

    const tools = [
        { icon: Ruler, label: "My Size Profile", desc: "ບັນທຶກສັດສ່ວນ", href: "/account/size-profile" },
        { icon: Heart, label: "Favorite", desc: "ລາຍການທີ່ມັກ", href: "/account/wishlist" },
        { icon: Headphones, label: "Help Center", desc: "MeeSai Concierge", href: "/sos" },
    ];

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ── Header ── */}
            <header className="bg-gradient-to-r from-primary-900 to-primary-700 text-white px-4 pt-12 pb-6">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-lg font-bold">{t("account.title")}</h1>
                        <div className="flex items-center gap-2">
                            <Link href="/account" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                            </Link>
                            <Link href="/account" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <Settings className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                            {session.user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <p className="font-bold text-lg">{session.user.name}</p>
                            <p className="text-white/70 text-sm">
                                {(session.user as Record<string, unknown>).phone as string || ""}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 -mt-4 space-y-3">
                {/* ════════════════════════════════════════
           SECTION 1: THE WALLET
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl shadow-lg border border-surface-300 overflow-hidden">
                    <Link href="/account/wallet" className="block p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Wallet className="w-5 h-5 text-accent-500" />
                            <span className="font-bold text-primary-900 text-sm">MeeSai Wallet</span>
                            <ChevronRight className="w-4 h-4 text-surface-400 ml-auto" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-surface-500 uppercase font-medium mb-0.5">
                                    💵 ຍອດໃຊ້ໄດ້
                                </p>
                                <p className="text-xl font-extrabold text-status-success">
                                    {wallet.availableBalance.toLocaleString()} <span className="text-sm">₭</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-surface-500 uppercase font-medium mb-0.5">
                                    🔒 ຍອດມັດຈຳ (Locked)
                                </p>
                                <p className="text-xl font-extrabold text-amber-600">
                                    {wallet.lockedBalance.toLocaleString()} <span className="text-sm">₭</span>
                                </p>
                            </div>
                        </div>
                    </Link>
                    {/* Action Bar */}
                    <div className="grid grid-cols-3 border-t border-surface-200">
                        {[
                            { icon: ArrowDownToLine, label: "ເຕີມເງິນ" },
                            { icon: ShoppingBag, label: "ຖອນເງິນ" },
                            { icon: Ticket, label: "ຄູປ໋ອງ" },
                        ].map((action) => (
                            <button
                                key={action.label}
                                className="flex flex-col items-center gap-1 py-3 hover:bg-surface-50 transition-colors"
                            >
                                <action.icon className="w-5 h-5 text-accent-500" />
                                <span className="text-[11px] font-medium text-primary-900">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ════════════════════════════════════════
           SECTION 2: RENTAL STATUS BAR
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl shadow-sm border border-surface-300 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-primary-900 text-sm">
                            {t("account.rentalStatus")}
                        </span>
                        <Link
                            href="/account/bookings"
                            className="text-accent-500 text-xs font-semibold flex items-center gap-0.5"
                        >
                            {t("common.viewAll")} <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                        {statusItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex flex-col items-center gap-1 py-2 hover:bg-surface-50 rounded-xl transition-colors relative"
                            >
                                <div className="relative">
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                    {item.count > 0 && (
                                        <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-flash text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                            {item.count}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-surface-500 font-medium text-center leading-tight">
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ════════════════════════════════════════
           SECTION 3: MY TOOLS
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl shadow-sm border border-surface-300 p-4">
                    <span className="font-bold text-primary-900 text-sm mb-3 block">
                        {t("account.myTools")}
                    </span>
                    <div className="space-y-1">
                        {tools.map((tool) => (
                            <Link
                                key={tool.label}
                                href={tool.href}
                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-50 rounded-xl transition-colors"
                            >
                                <div className="w-9 h-9 bg-accent-50 rounded-lg flex items-center justify-center">
                                    <tool.icon className="w-4 h-4 text-accent-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-primary-900">{tool.label}</p>
                                    <p className="text-[11px] text-surface-500">{tool.desc}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-surface-400 shrink-0" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* ════════════════════════════════════════
           SECTION 4: SWITCH TO PARTNER MODE
           ════════════════════════════════════════ */}
                {((session.user as Record<string, unknown>).role === "OWNER" ||
                    (session.user as Record<string, unknown>).role === "ADMIN") && (
                        <Link
                            href="/partner"
                            className="block bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-shadow"
                        >
                            <div className="flex items-center gap-3 text-white">
                                <Crown className="w-8 h-8" />
                                <div>
                                    <p className="font-bold text-base">Switch to Partner Mode</p>
                                    <p className="text-white/80 text-xs">ศูนย์บัญชาการสินทรัพย์</p>
                                </div>
                                <ChevronRight className="w-5 h-5 ml-auto" />
                            </div>
                        </Link>
                    )}

                {/* ── Logout ── */}
                <LogoutButton label={t("common.logout")} />
            </div>
        </div>
    );
}
