"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
    title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                // User cancelled or error
            }
        } else {
            await navigator.clipboard.writeText(url);
            alert("📋 ກ໋ອບປີ້ ລິ້ງແລ້ວ!");
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
            aria-label="Share"
        >
            <Share2 className="w-5 h-5 text-primary-900" />
        </button>
    );
}
