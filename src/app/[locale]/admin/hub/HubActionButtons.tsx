"use client";

import { useState, useTransition } from "react";
import {
    CheckCircle,
    Loader2,
    Truck,
    AlertTriangle,
    Sparkles,
    Package,
} from "lucide-react";
import {
    hubReceiveBooking,
    hubSendBooking,
    hubReceiveReturn,
    hubQCCheck,
    hubCleaningDone,
    hubComplete,
    HUB_QC_CHECKLIST,
} from "./actions";

const CHECKLIST_LABELS: Record<string, string> = {
    garment_condition: "✅ ສະພາບຊຸດປົກກະຕິ",
    no_business_card: "🚫 ບໍ່ມີນາມບັດ/Line ID ແນບ",
    hygiene_seal: "🧴 ໃສ່ Hygiene Seal ແລ້ວ",
    correct_size_label: "📏 ປ້າຍໄຊສ໌ຕົງກັບ Order",
    packaging_ready: "📦 ແພັກກ່ອງ + Return Kit ພ້ອມ",
};

type BookingStatus = string;

interface HubActionButtonsProps {
    bookingId: string;
    status: BookingStatus;
}

export default function HubActionButtons({ bookingId, status }: HubActionButtonsProps) {
    const [isPending, startTransition] = useTransition();
    const [done, setDone] = useState(false);
    const [checklist, setChecklist] = useState<string[]>([]);
    const [trackingCode, setTrackingCode] = useState("");
    const [damageNote, setDamageNote] = useState("");

    const toggle = (item: string) => {
        setChecklist(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const handleAction = (action: () => Promise<{ success?: boolean; error?: string }>) => {
        startTransition(async () => {
            const result = await action();
            if (result.success) setDone(true);
        });
    };

    if (done) {
        return (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-xs font-bold text-green-700">ດຳເນີນການສຳເລັດ ✅</span>
            </div>
        );
    }

    // ── CONFIRMED → AT_HUB (รับเข้า Hub + Anti-Leak Checklist)
    if (status === "CONFIRMED") {
        return (
            <div className="space-y-2">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">
                    🔒 Anti-Leak Checklist (ກວດທຸກຂໍ້ກ່ອນກົດຮັບ)
                </p>
                {HUB_QC_CHECKLIST.map(item => (
                    <label key={item} className="flex items-center gap-2.5 p-2 bg-surface-50 rounded-lg cursor-pointer hover:bg-accent-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={checklist.includes(item)}
                            onChange={() => toggle(item)}
                            className="w-4 h-4 rounded border-surface-300 text-accent-500 focus:ring-accent-500"
                        />
                        <span className="text-xs text-primary-900">{CHECKLIST_LABELS[item]}</span>
                    </label>
                ))}
                <button
                    type="button"
                    onClick={() => handleAction(() => hubReceiveBooking(bookingId, checklist))}
                    disabled={isPending || checklist.length < HUB_QC_CHECKLIST.length}
                    className="w-full py-2.5 bg-accent-500 text-white rounded-xl text-xs font-bold hover:bg-accent-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                    ຮັບເຂົ້າ Hub ({checklist.length}/{HUB_QC_CHECKLIST.length})
                </button>
            </div>
        );
    }

    // ── AT_HUB → SHIPPING (ส่งลูกค้า)
    if (status === "AT_HUB") {
        return (
            <div className="space-y-2">
                <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Tracking Code (optional)"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <button
                    type="button"
                    onClick={() => handleAction(() => hubSendBooking(bookingId, trackingCode || undefined))}
                    disabled={isPending}
                    className="w-full py-2.5 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                    ສົ່ງໃຫ້ລູກຄ້າ 🚚
                </button>
            </div>
        );
    }

    // ── RETURNED → RETURNED_TO_HUB (รับคืนเข้า Hub)
    if (status === "RETURNED") {
        return (
            <button
                type="button"
                onClick={() => handleAction(() => hubReceiveReturn(bookingId))}
                disabled={isPending}
                className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                ຮັບຄືນເຂົ້າ Hub 📦
            </button>
        );
    }

    // ── RETURNED_TO_HUB → QC_CHECKING (ตรวจ) OR DISPUTED (damage)
    if (status === "RETURNED_TO_HUB") {
        return (
            <div className="space-y-2">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleAction(() => hubQCCheck(bookingId, "PASS"))}
                        disabled={isPending}
                        className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                    >
                        <CheckCircle className="w-3.5 h-3.5" /> QC ผ່ານ
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (!damageNote.trim()) {
                                setDamageNote(""); // Focus on input
                                return;
                            }
                            handleAction(() => hubQCCheck(bookingId, "DAMAGE", damageNote));
                        }}
                        disabled={isPending}
                        className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                    >
                        <AlertTriangle className="w-3.5 h-3.5" /> ແຈ້ງ Damage
                    </button>
                </div>
                <input
                    type="text"
                    value={damageNote}
                    onChange={(e) => setDamageNote(e.target.value)}
                    placeholder="ລາຍລະອຽດ damage (ถ້ามี)"
                    className="w-full px-3 py-2 border border-surface-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
            </div>
        );
    }

    // ── CLEANING → RETURNED_TO_SHOP
    if (status === "CLEANING") {
        return (
            <button
                type="button"
                onClick={() => handleAction(() => hubCleaningDone(bookingId))}
                disabled={isPending}
                className="w-full py-2.5 bg-purple-500 text-white rounded-xl text-xs font-bold hover:bg-purple-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                ຊັກແຫ້ງສຳເລັດ → ຄືນໃຫ້ຮ້ານ ✨
            </button>
        );
    }

    // ── RETURNED_TO_SHOP → COMPLETED
    if (status === "RETURNED_TO_SHOP") {
        return (
            <button
                type="button"
                onClick={() => handleAction(() => hubComplete(bookingId))}
                disabled={isPending}
                className="w-full py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                ຮ້ານຮັບຄືນແລ້ວ → Complete 🎉
            </button>
        );
    }

    return null;
}
