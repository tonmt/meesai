"use client";

import { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { topUpWallet, withdrawWallet } from "@/app/[locale]/account/actions";

type Props = {
    userId: string;
    balance: number;
};

const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000];

export default function WalletActions({ userId, balance }: Props) {
    const [mode, setMode] = useState<"idle" | "topup" | "withdraw">("idle");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

    async function handleSubmit() {
        const num = parseInt(amount);
        if (!num || num <= 0) {
            setResult({ type: "error", message: "ກະລຸນາກຳນົດຈຳນວນເງິນ" });
            return;
        }
        if (mode === "withdraw" && num > balance) {
            setResult({ type: "error", message: "ຍອດເງິນບໍ່ພຽງພໍ" });
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            if (mode === "topup") {
                await topUpWallet(userId, num);
                setResult({ type: "success", message: `ເຕີມເງິນ ${num.toLocaleString()} ₭ ສຳເລັດ!` });
            } else {
                await withdrawWallet(userId, num);
                setResult({ type: "success", message: `ຖອນເງິນ ${num.toLocaleString()} ₭ ສຳເລັດ!` });
            }
            setAmount("");
            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            setResult({ type: "error", message: e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ" });
        } finally {
            setLoading(false);
        }
    }

    function close() {
        setMode("idle");
        setAmount("");
        setResult(null);
    }

    if (mode === "idle") {
        return (
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setMode("topup")}
                    className="py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-accent-500/20 flex items-center justify-center gap-2"
                >
                    <ArrowUpCircle className="w-5 h-5" />
                    ເຕີມເງິນ
                </button>
                <button
                    onClick={() => setMode("withdraw")}
                    className="py-3 bg-white border-2 border-accent-500 text-accent-500 font-bold rounded-xl hover:bg-accent-50 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowDownCircle className="w-5 h-5" />
                    ຖອນເງິນ
                </button>
            </div>
        );
    }

    const isTopUp = mode === "topup";

    return (
        <div className="bg-white border-2 border-accent-500 rounded-2xl p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-bold text-primary-900 flex items-center gap-2">
                    {isTopUp ? <ArrowUpCircle className="w-5 h-5 text-accent-500" /> : <ArrowDownCircle className="w-5 h-5 text-accent-500" />}
                    {isTopUp ? "ເຕີມເງິນ" : "ຖອນເງິນ"}
                </span>
                <button onClick={close} className="p-1 hover:bg-surface-100 rounded">
                    <X className="w-4 h-4 text-surface-400" />
                </button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((a) => (
                    <button
                        key={a}
                        onClick={() => setAmount(a.toString())}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${amount === a.toString()
                            ? "bg-accent-500 text-white"
                            : "bg-surface-100 text-primary-900 hover:bg-surface-200"
                            }`}
                    >
                        {a >= 1_000_000 ? `${a / 1_000_000}M` : `${a / 1_000}K`}
                    </button>
                ))}
            </div>

            {/* Custom Amount */}
            <div className="relative">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ກຳນົດຈຳນວນເງິນ..."
                    className="w-full px-4 py-3 bg-surface-50 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-surface-400">₭</span>
            </div>

            {!isTopUp && (
                <p className="text-xs text-surface-500">ຍອດທີ່ຖອນໄດ້: <span className="font-bold text-primary-900">{balance.toLocaleString()} ₭</span></p>
            )}

            {result && (
                <div className={`rounded-lg p-2.5 flex items-start gap-2 ${result.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    {result.type === "success" ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                    <p className={`text-xs ${result.type === "success" ? "text-green-600" : "text-red-600"}`}>{result.message}</p>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading || !amount}
                className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> ກຳລັງດຳເນີນການ...</>
                ) : (
                    `✅ ຢືນຢັນ${isTopUp ? "ເຕີມ" : "ຖອນ"} ${amount ? parseInt(amount).toLocaleString() : "0"} ₭`
                )}
            </button>
        </div>
    );
}
