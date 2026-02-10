"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleWishlist } from "@/app/[locale]/account/actions";

type Props = {
    garmentId: string;
    userId: string;
    initialWishlisted: boolean;
};

export default function WishlistButton({ garmentId, userId, initialWishlisted }: Props) {
    const [isPending, startTransition] = useTransition();
    const [optimisticWishlisted, setOptimisticWishlisted] = useOptimistic(initialWishlisted);
    const [error, setError] = useState(false);

    function handleToggle() {
        setError(false);
        startTransition(async () => {
            setOptimisticWishlisted(!optimisticWishlisted);
            try {
                await toggleWishlist(userId, garmentId);
            } catch {
                setError(true);
            }
        });
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${optimisticWishlisted
                    ? "bg-red-50 hover:bg-red-100"
                    : "bg-white/80 hover:bg-white"
                } shadow-sm ${isPending ? "scale-90" : "hover:scale-110"} ${error ? "ring-2 ring-red-300" : ""}`}
            aria-label={optimisticWishlisted ? "ລົບອອກຈາກ Wishlist" : "ເພີ່ມໃສ່ Wishlist"}
        >
            <Heart
                className={`w-4 h-4 transition-colors ${optimisticWishlisted ? "text-red-500" : "text-surface-400"
                    }`}
                fill={optimisticWishlisted ? "currentColor" : "none"}
            />
        </button>
    );
}
