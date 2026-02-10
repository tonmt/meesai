"use client";

import { useState } from "react";
import { Truck, Loader2, CheckCircle, X } from "lucide-react";
import { updateOrderStatus } from "@/app/[locale]/partner/actions";

type Props = {
    bookingId: string;
};

export default function ShipOrderButton({ bookingId }: Props) {
    const [open, setOpen] = useState(false);
    const [tracking, setTracking] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    async function handleShip() {
        setLoading(true);
        setError("");
        try {
            await updateOrderStatus(bookingId, "SHIPPING", tracking || undefined);
            setDone(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <span className="px-4 py-2 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> ສົ່ງແລ້ວ ✅
            </span>
        );
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
                <Truck className="w-3.5 h-3.5" />
                ສົ່ງສິນຄ້າ
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="ເລກ tracking (ບໍ່ບັງຄັບ)"
                className="px-2.5 py-1.5 bg-surface-50 border border-surface-300 rounded-lg text-xs text-primary-900 placeholder:text-surface-400 w-36 focus:border-blue-400 outline-none"
            />
            <button
                onClick={handleShip}
                disabled={loading}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                ຢືນຢັນ
            </button>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-surface-100 rounded">
                <X className="w-3.5 h-3.5 text-surface-400" />
            </button>
            {error && <span className="text-[10px] text-red-500">{error}</span>}
        </div>
    );
}
