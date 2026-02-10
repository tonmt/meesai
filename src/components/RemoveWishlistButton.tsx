"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toggleWishlist } from "@/app/[locale]/account/actions";

type Props = {
    garmentId: string;
    userId: string;
};

export default function RemoveWishlistButton({ garmentId, userId }: Props) {
    const [isPending, startTransition] = useTransition();
    const [removed, setRemoved] = useState(false);

    function handleRemove() {
        startTransition(async () => {
            try {
                await toggleWishlist(userId, garmentId);
                setRemoved(true);
            } catch {
                // Fail silently, item stays
            }
        });
    }

    if (removed) return null;

    return (
        <button
            onClick={handleRemove}
            disabled={isPending}
            className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/80 hover:bg-red-50 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all disabled:opacity-100"
            aria-label="ລົບອອກຈາກ Wishlist"
        >
            {isPending ? (
                <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
            ) : (
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
            )}
        </button>
    );
}
