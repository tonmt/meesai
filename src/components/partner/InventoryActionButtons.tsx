"use client";

import { useState, useTransition } from "react";
import { Loader2, Wrench, Ban } from "lucide-react";
import { updateGarmentStatus } from "@/app/[locale]/partner/actions";

type Props = {
    garmentId: string;
};

export default function InventoryActionButtons({ garmentId }: Props) {
    const [isPending, startTransition] = useTransition();
    const [done, setDone] = useState<string | null>(null);

    function handleAction(status: "MAINTENANCE" | "RETIRED", label: string) {
        startTransition(async () => {
            try {
                await updateGarmentStatus(garmentId, status);
                setDone(label);
            } catch {
                // Silently fail
            }
        });
    }

    if (done) {
        return (
            <span className="text-[10px] px-2 py-1 bg-green-50 text-green-600 font-medium rounded">
                ✅ {done}
            </span>
        );
    }

    return (
        <div className="flex gap-1">
            <button
                onClick={() => handleAction("RETIRED", "Block ແລ້ວ")}
                disabled={isPending}
                className="text-[10px] px-2 py-1 bg-red-50 text-red-500 font-medium rounded hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-0.5"
            >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                🚫 Block ວັນ
            </button>
            <button
                onClick={() => handleAction("MAINTENANCE", "ສົ່ງຊ່ອມແລ້ວ")}
                disabled={isPending}
                className="text-[10px] px-2 py-1 bg-blue-50 text-blue-500 font-medium rounded hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center gap-0.5"
            >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
                🔧 ສົ່ງຊ່ອມ
            </button>
        </div>
    );
}
