"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle, Loader2, Bot } from "lucide-react";
import { respondToTicket } from "./actions";
import { generateAutoResponse } from "./autoResponse";

const quickResponses: Record<string, string[]> = {
    PHOTO_REQUEST: [
        "ສົ່ງຮູບຈິງໃຫ້ແລ້ວທາງ WhatsApp ກະລຸນາເຊັກ 📸",
        "ໄດ້ປະສານຮ້ານຄ້າແລ້ວ ຈະສົ່ງຮູບພາຍໃນ 30 ນາທີ",
    ],
    SIZE_INQUIRY: [
        "ຂະໜາດ: ອົກ XX / ແອວ XX / ສະໂພກ XX ຊມ (ວັດຕົວຈິງ)",
        "ຊຸດນີ້ແນະນຳໄຊ M-L (ອົກ 34-38) ຖ້າບໍ່ແນ່ໃຈ ສົ່ງ size profile ມາໄດ້",
    ],
    AVAILABILITY: [
        "ຊຸດນີ້ວ່າງວັນທີ ____ ❕ ຈອງໄດ້ເລີຍ",
        "ວັນທີ່ຖາມມາ ຊຸດຖືກຈອງແລ້ວ 😢 ແນະນຳລຸ້ນໃກ້ຄຽງ: ____",
    ],
    DEPOSIT_QUERY: [
        "ລະບົບ Hold ວົງເງິນ ບໍ່ຕັດເງິນຈິງ ປົດລ໋ອກ ພາຍໃນ 1 ຊມ ຫຼັງ QC ✅",
        "Deposit = 30% ຂອງຄ່າເຊົ່າ, ຄືນ 100% ເມື່ອ QC ຜ່ານ",
    ],
    DELIVERY: [
        "ກຳລັງສົ່ງ! Tracking: ____ ຈະເຖິງພາຍໃນ 2 ຊມ 🚚",
        "ຈະນັດສົ່ງວັນທີ ____ ເວລາ 14:00-16:00",
    ],
    DAMAGE: [
        "ຮັບຮູ້ແລ້ວ ທີມ QC ຈະໂທຫາພາຍໃນ 15 ນາທີ ☎️",
        "Damage ນ້ອຍ ≤500K₭ ປະກັນ MeeSai ຄຸ້ມ ✅ ບໍ່ຕ້ອງກັງວົນ",
    ],
    GENERAL: [
        "ຂອບໃຈທີ່ຕິດຕໍ່ MeeSai! ຈະຕອບລະອຽດພາຍໃນ 5 ນາທີ ⏱️",
    ],
};

export default function TicketResponseForm({ ticketId, category }: { ticketId: string; category: string }) {
    const [response, setResponse] = useState("");
    const [isPending, startTransition] = useTransition();
    const [done, setDone] = useState(false);
    const [autoInfo, setAutoInfo] = useState<{ confidence: string; source: string } | null>(null);
    const [isAutoLoading, setIsAutoLoading] = useState(false);
    const templates = quickResponses[category] || quickResponses.GENERAL;

    const handleAutoResponse = async () => {
        setIsAutoLoading(true);
        try {
            const result = await generateAutoResponse(ticketId);
            if (result) {
                setResponse(result.response);
                setAutoInfo({ confidence: result.confidence, source: result.source });
            }
        } finally {
            setIsAutoLoading(false);
        }
    };

    const handleSubmit = (resolve: boolean) => {
        if (!response.trim()) return;
        const fd = new FormData();
        fd.set("ticketId", ticketId);
        fd.set("response", response);
        fd.set("resolve", resolve.toString());
        startTransition(async () => {
            const result = await respondToTicket(fd);
            if (result.success) setDone(true);
        });
    };

    if (done) {
        return (
            <div className="px-4 py-3 bg-green-50 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-green-700">ຕອບກັບສຳເລັດ ✅</span>
            </div>
        );
    }

    return (
        <div className="border-t border-surface-200 p-4 bg-surface-50">
            {/* Quick Response Templates */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-2 pb-1">
                {templates.map((tmpl, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setResponse(tmpl)}
                        className="px-2.5 py-1 bg-white border border-surface-200 rounded-lg text-[10px] text-surface-600 hover:bg-accent-50 hover:border-accent-200 transition-colors whitespace-nowrap shrink-0"
                    >
                        {tmpl.length > 30 ? tmpl.slice(0, 30) + "…" : tmpl}
                    </button>
                ))}
            </div>

            {/* 🤖 Auto-Response Button */}
            <button
                type="button"
                onClick={handleAutoResponse}
                disabled={isAutoLoading}
                className="w-full mb-2 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-xs font-bold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {isAutoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                🤖 Auto-Response (ดึงข้อมูลจริงจาก DB)
            </button>

            {autoInfo && (
                <p className={`text-[9px] mb-2 px-1 ${autoInfo.confidence === "high" ? "text-green-600" :
                        autoInfo.confidence === "medium" ? "text-amber-600" : "text-red-500"
                    }`}>
                    {autoInfo.confidence === "high" ? "✅" : autoInfo.confidence === "medium" ? "⚠️" : "❌"}
                    {" "}Confidence: {autoInfo.confidence} — Source: {autoInfo.source}
                </p>
            )}

            {/* Response Input */}
            <div className="flex gap-2">
                <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="ພິມຄຳຕອບ..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-surface-300 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
                <div className="flex flex-col gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleSubmit(false)}
                        disabled={isPending || !response.trim()}
                        className="px-3 py-1.5 bg-accent-500 text-white rounded-lg text-[10px] font-bold hover:bg-accent-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        ຕອບ
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(true)}
                        disabled={isPending || !response.trim()}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-[10px] font-bold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        <CheckCircle className="w-3 h-3" />
                        ແກ້ແລ້ວ
                    </button>
                </div>
            </div>
        </div>
    );
}
