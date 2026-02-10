"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { createTicket } from "@/app/[locale]/admin/concierge/actions";

const faqButtons = [
    { emoji: "📸", label: "ຂໍດູຮູບຈິງ", category: "PHOTO_REQUEST" as const, subject: "ຂໍດູຮູບຈິງສິນຄ້າ", msg: "ລູກຄ້າຂໍດູຮູບຈິງສິນຄ້າ" },
    { emoji: "📏", label: "ຂໍຂະໜາດລະອຽດ", category: "SIZE_INQUIRY" as const, subject: "ຂໍຂະໜາດລະອຽດ", msg: "ລູກຄ້າຂໍຂະໜາດວັດຕົວຈິງ" },
    { emoji: "📅", label: "ເຊັກຄິວວ່າງ", category: "AVAILABILITY" as const, subject: "ເຊັກຄິວວ່າງ", msg: "ລູກຄ້າຂໍເຊັກຄິວວ່າງ" },
    { emoji: "💳", label: "ຖາມເລື່ອງມັດຈຳ", category: "DEPOSIT_QUERY" as const, subject: "ຖາມເລື່ອງມັດຈຳ", msg: "ລູກຄ້າຖາມລະບົບມັດຈຳ" },
    { emoji: "🚚", label: "ຕິດຕາມການສົ່ງ", category: "DELIVERY" as const, subject: "ຕິດຕາມການສົ່ງ", msg: "ລູກຄ້າຂໍຕິດຕາມສະຖານະການສົ່ງ" },
];

type Props = {
    bookingId?: string;
};

export default function FAQTicketButtons({ bookingId }: Props) {
    const [submitted, setSubmitted] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [activeBtn, setActiveBtn] = useState<string | null>(null);

    const handleCreate = (q: typeof faqButtons[number]) => {
        setActiveBtn(q.category);
        startTransition(async () => {
            const result = await createTicket({
                category: q.category,
                subject: q.subject,
                message: q.msg,
                bookingId: bookingId || undefined,
            });
            if (result.success) {
                setSubmitted(q.category);
            }
            setActiveBtn(null);
        });
    };

    return (
        <section className="bg-white rounded-2xl border border-surface-300 p-4">
            <h2 className="text-sm font-bold text-primary-900 mb-3">💬 ຖາມດ່ວນ — ກົດ 1 ປຸ່ມ ໄດ້ຄຳຕອບ</h2>
            <div className="grid grid-cols-2 gap-2">
                {faqButtons.map((q) => {
                    const isSubmitted = submitted === q.category;
                    const isLoading = activeBtn === q.category && isPending;
                    return (
                        <button
                            key={q.category}
                            type="button"
                            onClick={() => !isSubmitted && handleCreate(q)}
                            disabled={isSubmitted || isLoading}
                            className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors text-left ${isSubmitted
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-surface-100 border border-surface-200 hover:bg-accent-50 hover:border-accent-200"
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 text-accent-500 animate-spin" />
                            ) : isSubmitted ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                                <span className="text-lg">{q.emoji}</span>
                            )}
                            <span className={`text-[11px] font-semibold ${isSubmitted ? "text-green-700" : "text-primary-900"}`}>
                                {isSubmitted ? "ສົ່ງແລ້ວ ✅" : q.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            {submitted && (
                <p className="text-[10px] text-green-600 text-center mt-2 font-medium">
                    ✅ ທີມ MeeSai ຈະຕິດຕໍ່ກັບພາຍໃນ 5 ນາທີ
                </p>
            )}
        </section>
    );
}
