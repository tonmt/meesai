"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Loader2, X } from "lucide-react";
import { submitQC } from "@/app/[locale]/partner/actions";

type Props = {
    bookingId: string;
    depositAmount: number;
};

const DAMAGE_POINTS = [
    { label: "ຄາບເປື້ອນ", emoji: "💧" },
    { label: "ຂາດ/ປິ", emoji: "✂️" },
    { label: "ກະດຸມຫຼຸດ", emoji: "🔘" },
    { label: "ຊິບເສຍ", emoji: "🔗" },
    { label: "ສີຕົກ", emoji: "🎨" },
    { label: "ອື່ນໆ", emoji: "📝" },
];

export default function QCActionButtons({ bookingId, depositAmount }: Props) {
    const [mode, setMode] = useState<"idle" | "confirm_pass" | "damage_form">("idle");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState<string | null>(null);
    const [error, setError] = useState("");

    // Damage form state
    const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
    const [estimatedCost, setEstimatedCost] = useState("");
    const [notes, setNotes] = useState("");

    function togglePoint(label: string) {
        setSelectedPoints((prev) =>
            prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
        );
    }

    async function handlePass() {
        setLoading(true);
        setError("");
        try {
            await submitQC(bookingId, "PASS");
            setDone("PASS");
        } catch (e) {
            setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
        } finally {
            setLoading(false);
        }
    }

    async function handleDamage() {
        if (!notes.trim()) {
            setError("ກະລຸນາລະບຸລາຍລະອຽດຄວາມເສຍຫາຍ");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await submitQC(bookingId, "DAMAGE", {
                description: notes,
                estimatedCost: parseInt(estimatedCost) || 0,
                damagePoints: selectedPoints,
            });
            setDone("DAMAGE");
        } catch (e) {
            setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <div className={`max-w-xl mx-auto px-4 py-3 text-center ${done === "PASS" ? "text-green-600" : "text-red-600"}`}>
                <p className="font-bold text-sm flex items-center justify-center gap-1.5">
                    {done === "PASS" ? (
                        <><CheckCircle className="w-5 h-5" /> QC ຜ່ານ — ມັດຈຳ {depositAmount.toLocaleString()} ₭ ຄືນແລ້ວ ✅</>
                    ) : (
                        <><AlertTriangle className="w-5 h-5" /> ແຈ້ງເສຍຫາຍແລ້ວ — ລໍຖ້າຕັດສິນ</>
                    )}
                </p>
            </div>
        );
    }

    // Confirm Pass
    if (mode === "confirm_pass") {
        return (
            <div className="max-w-xl mx-auto px-4 py-3 space-y-2">
                <p className="text-sm font-bold text-primary-900 text-center">ຢືນຢັນ QC ຜ່ານ?</p>
                <p className="text-xs text-surface-500 text-center">ມັດຈຳ {depositAmount.toLocaleString()} ₭ ຈະຄືນໃຫ້ລູກຄ້າອັດຕະໂນມັດ</p>
                {error && <p className="text-xs text-red-500 text-center">{error}</p>}
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setMode("idle"); setError(""); }} className="py-3 border border-surface-300 text-surface-500 font-bold rounded-xl text-sm">
                        ຍົກເລີກ
                    </button>
                    <button onClick={handlePass} disabled={loading} className="py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        ✅ ຢືນຢັນ
                    </button>
                </div>
            </div>
        );
    }

    // Damage Form
    if (mode === "damage_form") {
        return (
            <div className="max-w-xl mx-auto px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-900 text-sm">⚠️ ແຈ້ງເສຍຫາຍ</span>
                    <button onClick={() => { setMode("idle"); setError(""); }} className="p-1 hover:bg-surface-100 rounded">
                        <X className="w-4 h-4 text-surface-400" />
                    </button>
                </div>

                {/* Damage Point Toggle */}
                <div className="grid grid-cols-3 gap-1.5">
                    {DAMAGE_POINTS.map((point) => (
                        <button
                            key={point.label}
                            onClick={() => togglePoint(point.label)}
                            className={`flex items-center gap-1 px-2 py-1.5 border rounded-lg text-[11px] font-medium transition-colors ${selectedPoints.includes(point.label)
                                ? "border-red-400 bg-red-50 text-red-700"
                                : "border-surface-300 text-primary-900 hover:border-red-300"
                                }`}
                        >
                            <span>{point.emoji}</span> {point.label}
                        </button>
                    ))}
                </div>

                <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="ຄ່າປະເມີນຄວາມເສຍຫາຍ (₭)"
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-xl text-sm focus:border-red-400 outline-none"
                />
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ອະທິບາຍຈຸດເສຍຫາຍ... (ບັງຄັບ)"
                    rows={2}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-300 rounded-xl text-sm focus:border-red-400 outline-none resize-none"
                />

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button
                    onClick={handleDamage}
                    disabled={loading}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                    ສົ່ງແຈ້ງເສຍຫາຍ
                </button>
            </div>
        );
    }

    // Default: Two buttons
    return (
        <div className="max-w-xl mx-auto px-4 py-3 grid grid-cols-2 gap-3">
            <button
                onClick={() => setMode("damage_form")}
                className="py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/20 text-sm"
            >
                <AlertTriangle className="w-4 h-4" />
                ⚠️ ເສຍຫາຍ (Claim)
            </button>
            <button
                onClick={() => setMode("confirm_pass")}
                className="py-3 bg-status-success hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-green-500/20 text-sm"
            >
                <CheckCircle className="w-4 h-4" />
                ✅ ປົກກະຕິ (OK)
            </button>
        </div>
    );
}
