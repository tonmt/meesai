"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton({ label }: { label: string }) {
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-surface-300 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
            <LogOut className={`w-5 h-5 text-red-500 ${loading ? "animate-spin" : ""}`} />
            <span className="text-sm font-semibold text-red-500">
                {loading ? "ກຳລັງອອກ..." : label}
            </span>
        </button>
    );
}
