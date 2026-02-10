"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarDays, X, ChevronDown } from "lucide-react";

/**
 * Global Sticky Date Range Filter
 * Forces users to select pickup/return dates BEFORE browsing,
 * ensuring they only see available garments for their dates.
 */
export default function DateRangeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPickup = searchParams.get("pickup") || "";
    const currentReturn = searchParams.get("return") || "";

    const [pickup, setPickup] = useState(currentPickup);
    const [returnDate, setReturnDate] = useState(currentReturn);
    const [isExpanded, setIsExpanded] = useState(!currentPickup);

    // Tomorrow + max 30 days out
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    const maxDateStr = maxDate.toISOString().split("T")[0];

    const applyFilter = useCallback(() => {
        if (!pickup || !returnDate) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("pickup", pickup);
        params.set("return", returnDate);
        router.push(`${pathname}?${params.toString()}`);
        setIsExpanded(false);
    }, [pickup, returnDate, searchParams, pathname, router]);

    const clearFilter = useCallback(() => {
        setPickup("");
        setReturnDate("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete("pickup");
        params.delete("return");
        router.push(`${pathname}?${params.toString()}`);
        setIsExpanded(true);
    }, [searchParams, pathname, router]);

    // Calculate rental days
    const days =
        pickup && returnDate
            ? Math.ceil(
                (new Date(returnDate).getTime() - new Date(pickup).getTime()) /
                (1000 * 60 * 60 * 24)
            )
            : 0;

    // Collapsed: show selected dates as compact bar
    if (!isExpanded && currentPickup && currentReturn) {
        return (
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="flex-1 flex items-center gap-2 text-sm font-medium"
                    >
                        <span>
                            📅 {new Date(currentPickup).toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                        </span>
                        <span>→</span>
                        <span>
                            📅 {new Date(currentReturn).toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                        </span>
                        <span className="text-white/80 text-xs">({days} ມື້)</span>
                        <ChevronDown className="w-3 h-3 ml-auto" />
                    </button>
                    <button
                        onClick={clearFilter}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Expanded: full date picker
    return (
        <div className="bg-white border-b border-surface-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3">
                {/* Title */}
                <div className="flex items-center gap-2 mb-3">
                    <CalendarDays className="w-5 h-5 text-accent-500" />
                    <h2 className="text-sm font-bold text-primary-900">ເລືອກວັນທີ່ຕ້ອງການ</h2>
                    <span className="text-[10px] text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">ບັງຄັບ</span>
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1 block">
                            📦 ວັນຮັບຊຸດ
                        </label>
                        <input
                            type="date"
                            value={pickup}
                            min={minDate}
                            max={maxDateStr}
                            onChange={(e) => {
                                setPickup(e.target.value);
                                // Auto-set return = pickup + 3 days if not set
                                if (!returnDate || new Date(e.target.value) >= new Date(returnDate)) {
                                    const autoReturn = new Date(e.target.value);
                                    autoReturn.setDate(autoReturn.getDate() + 3);
                                    setReturnDate(autoReturn.toISOString().split("T")[0]);
                                }
                            }}
                            className="w-full px-3 py-2.5 bg-surface-50 border-2 border-surface-300 rounded-xl text-sm text-primary-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider mb-1 block">
                            🔄 ວັນສົ່ງຄືນ
                        </label>
                        <input
                            type="date"
                            value={returnDate}
                            min={pickup || minDate}
                            max={maxDateStr}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface-50 border-2 border-surface-300 rounded-xl text-sm text-primary-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Apply Button + Duration */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={applyFilter}
                        disabled={!pickup || !returnDate}
                        className="flex-1 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:bg-surface-300 disabled:text-surface-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-accent-500/20 disabled:shadow-none"
                    >
                        {pickup && returnDate
                            ? `🔍 ຄົ້ນຫາຊຸດ (${days} ມື້)`
                            : "ກະລຸນາເລືອກວັນທີ"}
                    </button>
                    {currentPickup && (
                        <button
                            onClick={clearFilter}
                            className="px-4 py-2.5 border border-surface-300 text-surface-500 text-sm font-medium rounded-xl hover:bg-surface-50 transition-colors"
                        >
                            ລ້າງ
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
