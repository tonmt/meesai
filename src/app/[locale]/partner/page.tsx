import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
    Crown,
    TrendingUp,
    DollarSign,
    Clock,
    Package,
    AlertTriangle,
    ChevronRight,
    BarChart3,
    Warehouse,
    ClipboardCheck,
    ShoppingBag,
    ArrowLeft,
    Megaphone,
    Shirt,
} from "lucide-react";
import { getPartnerDashboard } from "./actions";

export default async function PartnerDashboardPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const t = await getTranslations();

    const role = (session.user as Record<string, unknown>).role as string;
    if (role !== "OWNER" && role !== "ADMIN") redirect("/account");

    const data = await getPartnerDashboard(session.user.id as string);
    if (!data) redirect("/account");

    const { shop, income, todo } = data;

    const navItems = [
        { icon: ShoppingBag, label: "ຈັດການອໍເດີ", desc: `${todo.toShip + todo.qcCheck} ລາຍການ`, href: "/partner/orders", badge: todo.toShip + todo.qcCheck },
        { icon: Warehouse, label: "ຄລັງສິນຄ້າ", desc: "ປະຕິທິນ & ສະຖານະ", href: "/partner/inventory", badge: 0 },
        { icon: ClipboardCheck, label: "QC Station", desc: "ກວດຮັບຂອງ", href: "/partner/qc", badge: todo.qcCheck },
        { icon: Megaphone, label: "ເຄື່ອງມືການຕະຫຼາດ", desc: "ໂປຣໂມຊັ່ນ & ໂຄສະນາ", href: "/partner/marketing", badge: 0 },
    ];

    return (
        <div className="min-h-screen bg-[#1a1a2e] pb-20">
            {/* ── Header ── */}
            <header className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white px-4 pt-6 pb-8">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/account" className="p-1 hover:bg-white/10 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-amber-400" />
                            <h1 className="font-bold text-lg">Partner Center</h1>
                        </div>
                    </div>

                    {/* Shop Info */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-xl font-bold text-amber-400">
                                {shop.nameLo.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-base">{shop.nameLo}</p>
                            <div className="flex items-center gap-1 text-xs text-green-400">
                                {shop.isVerified && <span>✅ ຢືນຢັນແລ້ວ</span>}
                            </div>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════
             INCOME REPORT
             ════════════════════════════════════════ */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-white/50 uppercase mb-1">💰 ມື້ນີ້</p>
                            <p className="text-lg font-extrabold text-green-400">
                                {income.today.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-white/40">₭</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-white/50 uppercase mb-1">📊 ເດືອນນີ້</p>
                            <p className="text-lg font-extrabold text-green-400">
                                {income.month.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-white/40">₭</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-white/50 uppercase mb-1">💸 ລໍຖ້າໂອນ</p>
                            <p className="text-lg font-extrabold text-amber-400">
                                {income.pendingPayout.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-white/40">₭</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 -mt-3 space-y-3">
                {/* ════════════════════════════════════════
           TO-DO LIST
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl shadow-lg border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-5 h-5 text-accent-500" />
                        <span className="font-bold text-primary-900 text-sm">ສິ່ງທີ່ຕ້ອງເຮັດ</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/partner/orders?tab=toShip"
                            className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                            <Package className="w-6 h-6 text-blue-500" />
                            <div>
                                <p className="text-2xl font-extrabold text-blue-600">{todo.toShip}</p>
                                <p className="text-[11px] text-blue-500 font-medium">📦 ຕ້ອງສົ່ງ</p>
                            </div>
                        </Link>
                        <Link
                            href="/partner/orders?tab=qcCheck"
                            className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
                        >
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            <div>
                                <p className="text-2xl font-extrabold text-amber-600">{todo.qcCheck}</p>
                                <p className="text-[11px] text-amber-500 font-medium">⚠️ ກວດຮັບຂອງ</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* ════════════════════════════════════════
           NAVIGATION
           ════════════════════════════════════════ */}
                <section className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-surface-300 hover:bg-surface-50 transition-colors card-hover"
                        >
                            <div className="w-10 h-10 bg-primary-900/5 rounded-lg flex items-center justify-center">
                                <item.icon className="w-5 h-5 text-primary-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-primary-900">{item.label}</p>
                                <p className="text-[11px] text-surface-500">{item.desc}</p>
                            </div>
                            {item.badge > 0 && (
                                <span className="w-6 h-6 bg-flash text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-surface-400 shrink-0" />
                        </Link>
                    ))}
                </section>

                {/* ── Quick Stats ── */}
                <section className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-5 h-5 text-amber-400" />
                        <span className="font-bold text-sm">ສະຖິຕິດ່ວນ</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                            <p className="text-2xl font-extrabold">{data.shop.garments?.length || 0}</p>
                            <p className="text-[10px] text-white/60">ຈຳນວນຊຸດ</p>
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-green-400">
                                {todo.toShip + todo.qcCheck}
                            </p>
                            <p className="text-[10px] text-white/60">ກຳລັງດຳເນີນ</p>
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-amber-400">
                                {income.month > 0 ? Math.round(income.month / (new Date().getDate())) : 0}
                            </p>
                            <p className="text-[10px] text-white/60">₭/ວັນ (avg)</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
