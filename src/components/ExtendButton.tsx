"use client";

import { useState } from "react";
import { Plus, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { requestExtend } from "@/app/[locale]/account/actions";

type Props = {
    bookingId: string;
    dailyRate: number;
};

export default function ExtendButton({ bookingId, dailyRate }: Props) {
    const [open, setOpen] = useState(false);
    const [days, setDays] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<"success" | "error" | null>(null);
    const [error, setError] = useState("");

    async function handleExtend() {
        setLoading(true);
        setError("");
        try {
            await requestExtend(bookingId, days);
            setResult("success");
            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
            setResult("error");
        } finally {
            setLoading(false);
        }
    }

    if (result === "success") {
        return (
            <div className="py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1 animate-pulse">
                <CheckCircle className="w-4 h-4" /> ຂະຫຍາຍສຳເລັດ!
            </div>
        );
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1"
            >
                <Plus className="w-4 h-4" />
                ຂໍເຊົ່າຕໍ່ (Extend)
            </button>
        );
    }

    return (
        <div className="bg-white rounded-xl border-2 border-accent-500 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-primary-900 text-sm">ຂະຫຍາຍເວລາເຊົ່າ</span>
                <button onClick={() => { setOpen(false); setResult(null); setError(""); }} className="p-1 hover:bg-surface-100 rounded">
                    <X className="w-4 h-4 text-surface-400" />
                </button>
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 mb-3">
                {[1, 2, 3, 5, 7].map((d) => (
                    <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${days === d
                            ? "bg-accent-500 text-white shadow-sm"
                            : "bg-surface-100 text-primary-900 hover:bg-surface-200"
                            }`}
                    >
                        {d} ມື້
                    </button>
                ))}
            </div>

            {/* Price Preview */}
            <div className="bg-surface-50 rounded-lg p-2.5 mb-3 flex justify-between text-sm">
                <span className="text-surface-500">ຄ່າເຊົ່າເພີ່ມ</span>
                <span className="font-bold text-accent-500">
                    +{(dailyRate * days).toLocaleString()} ₭
                </span>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-600">{error}</p>
                </div>
            )}

            <button
                onClick={handleExtend}
                disabled={loading}
                className="w-full py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> ກຳລັງດຳເນີນການ...</>
                ) : (
                    `ຢືນຢັນ ຂະຫຍາຍ ${days} ມື້`
                )}
            </button>
        </div>
    );
}
