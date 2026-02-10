"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[MeeSai Error]", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-surface-150 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-surface-300 p-8 text-center">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-primary-900 mb-2">
                    ມີບັນຫາເກີດຂຶ້ນ
                </h1>
                <p className="text-surface-500 text-sm mb-6">
                    ເກີດຂໍ້ຜິດພາດບາງຢ່າງ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ
                </p>

                {/* Error Detail (dev only) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-left">
                        <p className="text-xs text-red-600 font-mono break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={reset}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-900 text-white rounded-xl font-semibold text-sm hover:bg-primary-800 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        ລອງໃໝ່
                    </button>
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-surface-100 text-primary-900 rounded-xl font-semibold text-sm hover:bg-surface-200 transition-colors border border-surface-300"
                    >
                        <Home className="w-4 h-4" />
                        ໜ້າຫຼັກ
                    </Link>
                </div>
            </div>
        </div>
    );
}
