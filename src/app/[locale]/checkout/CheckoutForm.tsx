"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { createBooking } from "./actions";

type Props = {
    garmentId: string;
    pickup: string;
    returnDate: string;
    totalPay: number;
};

export default function CheckoutForm({ garmentId, pickup, returnDate, totalPay }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [notes, setNotes] = useState("");
    const [backupSize, setBackupSize] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (!pickup || !returnDate) {
            setError("ກະລຸນາເລືອກວັນທີ");
            return;
        }

        startTransition(async () => {
            try {
                const formData = new FormData();
                formData.set("garmentId", garmentId);
                formData.set("pickup", pickup);
                formData.set("return", returnDate);
                formData.set("backupSize", backupSize.toString());
                formData.set("notes", notes);

                const result = await createBooking(formData);
                router.push(`/account/bookings/${result.bookingId}`);
            } catch (e) {
                setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
            }
        });
    };

    return (
        <>
            {/* Backup Size Option */}
            <div className="bg-white rounded-2xl border border-surface-300 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={backupSize}
                        onChange={(e) => setBackupSize(e.target.checked)}
                        className="mt-1 accent-accent-500 w-4 h-4"
                    />
                    <div>
                        <p className="text-xs font-bold text-primary-900">✨ Backup Size Option</p>
                        <p className="text-[10px] text-surface-500 mt-0.5">
                            +50,000 ₭ ສົ່ງໄຊສ໌ສຳຮອງ (ໃກ້ຄຽງ) ໄປໃຫ້ລອງ — ສົ່ງຄືນໄຊສ໌ທີ່ບໍ່ໃຊ້
                        </p>
                    </div>
                </label>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-surface-300 p-4">
                <label className="text-xs font-bold text-primary-900 mb-1.5 block">📝 ໝາຍເຫດ (ບໍ່ບັງຄັບ)</label>
                <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ເຊັ່ນ: ສົ່ງໃນຊ່ວງເຊົ້າ, ລະວັງຊຸດບໍ່ຕ້ອງພັບ..."
                    className="w-full px-3 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-primary-900 placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all resize-none"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-medium">
                    ❌ {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full py-4 bg-accent-500 hover:bg-accent-600 disabled:bg-surface-300 text-white font-extrabold text-base rounded-2xl transition-colors shadow-xl shadow-accent-500/25 disabled:shadow-none flex items-center justify-center gap-2"
            >
                {isPending ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        ກຳລັງຈອງ...
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        ຢືນຢັນຈອງ — {totalPay.toLocaleString()} ₭
                    </>
                )}
            </button>
        </>
    );
}
