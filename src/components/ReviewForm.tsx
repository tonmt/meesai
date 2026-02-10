"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { submitReview } from "@/app/[locale]/account/actions";

type Props = {
    bookingId: string;
    hasReview: boolean;
};

export default function ReviewForm({ bookingId, hasReview }: Props) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(hasReview);
    const [error, setError] = useState("");

    async function handleSubmit() {
        setLoading(true);
        setError("");
        try {
            await submitReview(bookingId, rating, comment || undefined);
            setDone(true);
            setOpen(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <div className="w-full py-3 bg-amber-100 text-amber-700 font-bold rounded-xl flex items-center justify-center gap-2 text-sm">
                <CheckCircle className="w-5 h-5" />
                ຣີວິວແລ້ວ — ຂອບໃຈ! 🙏
            </div>
        );
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            >
                <Star className="w-5 h-5" />
                ໃຫ້ຄະແນນ & ຣີວິວ
            </button>
        );
    }

    return (
        <div className="w-full bg-white border-2 border-amber-400 rounded-xl p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-bold text-primary-900">ໃຫ້ຄະແນນ</span>
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-surface-100 rounded">
                    <X className="w-4 h-4 text-surface-400" />
                </button>
            </div>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                    <button
                        key={s}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(s)}
                        className="transition-transform hover:scale-125"
                    >
                        <Star
                            className={`w-9 h-9 transition-colors ${s <= (hover || rating)
                                ? "text-amber-400"
                                : "text-surface-300"
                                }`}
                            fill={s <= (hover || rating) ? "currentColor" : "none"}
                        />
                    </button>
                ))}
            </div>
            <p className="text-center text-sm text-surface-500">
                {rating === 5 && "⭐ ດີເລີດ!"}
                {rating === 4 && "👍 ດີ"}
                {rating === 3 && "😐 ປານກາງ"}
                {rating === 2 && "😕 ບໍ່ຄ່ອຍດີ"}
                {rating === 1 && "😞 ແຍ່ຫຼາຍ"}
            </p>

            {/* Comment */}
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="ແບ່ງປັນປະສົບການຂອງທ່ານ... (ບໍ່ບັງຄັບ)"
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-primary-900 placeholder:text-surface-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all resize-none"
            />
            <p className="text-right text-[10px] text-surface-400">{comment.length}/500</p>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> ກຳລັງສົ່ງ...</>
                ) : (
                    "📤 ສົ່ງຣີວິວ"
                )}
            </button>
        </div>
    );
}
