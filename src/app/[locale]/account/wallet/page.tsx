import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import WalletActions from "@/components/WalletActions";
import {
    ArrowLeft,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Lock,
    Unlock,
    CreditCard,
    Gift,
    AlertTriangle,
    TrendingUp,
} from "lucide-react";

const TX_ICONS: Record<string, typeof ArrowUpRight> = {
    TOPUP: ArrowDownLeft,
    WITHDRAW: ArrowUpRight,
    LOCK: Lock,
    UNLOCK: Unlock,
    PAYMENT: CreditCard,
    REFUND: Gift,
    PENALTY: AlertTriangle,
    COMMISSION: TrendingUp,
};

const TX_COLORS: Record<string, string> = {
    TOPUP: "text-status-success bg-green-50",
    WITHDRAW: "text-red-500 bg-red-50",
    LOCK: "text-amber-600 bg-amber-50",
    UNLOCK: "text-status-success bg-green-50",
    PAYMENT: "text-blue-600 bg-blue-50",
    REFUND: "text-status-success bg-green-50",
    PENALTY: "text-red-500 bg-red-50",
    COMMISSION: "text-surface-500 bg-surface-100",
};

export default async function WalletPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const t = await getTranslations();

    const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
        include: {
            transactions: { orderBy: { createdAt: "desc" }, take: 50 },
        },
    });

    const totalBalance = (wallet?.availableBalance || 0) + (wallet?.lockedBalance || 0);

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ── Header ── */}
            <header className="bg-gradient-to-r from-primary-900 to-primary-700 text-white px-4 pt-6 pb-8">
                <div className="max-w-xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/account" className="p-1 hover:bg-white/10 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-bold text-lg">MeeSai Wallet</h1>
                    </div>

                    {/* Total Balance */}
                    <div className="text-center mb-6">
                        <p className="text-white/60 text-xs uppercase tracking-wider mb-1">ຍອດເງິນທັງໝົດ</p>
                        <p className="text-4xl font-extrabold">
                            {totalBalance.toLocaleString()} <span className="text-lg">₭</span>
                        </p>
                    </div>

                    {/* Balance Split */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-[10px] uppercase mb-0.5">💵 ໃຊ້ໄດ້</p>
                            <p className="text-lg font-bold text-green-300">
                                {(wallet?.availableBalance || 0).toLocaleString()} ₭
                            </p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 text-center">
                            <p className="text-white/60 text-[10px] uppercase mb-0.5">🔒 ມັດຈຳ</p>
                            <p className="text-lg font-bold text-amber-300">
                                {(wallet?.lockedBalance || 0).toLocaleString()} ₭
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 -mt-3">
                {/* ── Action Buttons ── */}
                <WalletActions userId={session.user.id as string} balance={wallet?.availableBalance || 0} />

                {/* ── Transaction History ── */}
                <section className="bg-white rounded-2xl shadow-sm border border-surface-300 overflow-hidden">
                    <div className="px-4 py-3 border-b border-surface-200">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-accent-500" />
                            <span className="font-bold text-primary-900 text-sm">{t("account.walletHistory")}</span>
                        </div>
                    </div>

                    {wallet?.transactions && wallet.transactions.length > 0 ? (
                        <div className="divide-y divide-surface-200">
                            {wallet.transactions.map((tx) => {
                                const Icon = TX_ICONS[tx.type] || CreditCard;
                                const colorClass = TX_COLORS[tx.type] || "text-surface-500 bg-surface-100";
                                const isPositive = ["TOPUP", "UNLOCK", "REFUND"].includes(tx.type);

                                return (
                                    <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-primary-900 truncate">
                                                {tx.description || tx.type}
                                            </p>
                                            <p className="text-[11px] text-surface-500">
                                                {tx.createdAt.toLocaleDateString("lo-LA", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                        <p className={`text-sm font-bold ${isPositive ? "text-status-success" : "text-red-500"}`}>
                                            {isPositive ? "+" : "-"}{tx.amount.toLocaleString()} ₭
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <Wallet className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                            <p className="text-sm text-surface-500">ぃ ยังไม่มีรายการ</p>
                        </div>
                    )}
                </section>
            </div >
        </div >
    );
}
