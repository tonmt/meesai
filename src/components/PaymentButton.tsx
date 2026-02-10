"use client";

import { useState } from "react";
import { CreditCard, Wallet, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { payBooking } from "@/app/[locale]/account/actions";
import Link from "next/link";

type Props = {
    bookingId: string;
    totalAmount: number;
    walletBalance: number;
};

export default function PaymentButton({ bookingId, totalAmount, walletBalance }: Props) {
    const [step, setStep] = useState<"idle" | "confirm" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState("");

    const insufficientFunds = walletBalance < totalAmount;

    async function handlePay() {
        setStep("loading");
        setError("");
        try {
            await payBooking(bookingId);
            setStep("success");
            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
            setStep("error");
        }
    }

    // Success state
    if (step === "success") {
        return (
            <div className="w-full py-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 animate-pulse">
                <CheckCircle className="w-5 h-5" />
                ຊຳລະສຳເລັດ! ✨
            </div>
        );
    }

    // Confirmation overlay
    if (step === "confirm" || step === "loading" || step === "error") {
        return (
            <div className="w-full space-y-3">
                {/* Confirm Panel */}
                <div className="bg-white border-2 border-accent-500 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <Wallet className="w-5 h-5 text-accent-500" />
                        <span className="font-bold text-primary-900 text-sm">ຢືນຢັນການຊຳລະ</span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-surface-500">ຍອດຊຳລະ</span>
                            <span className="font-bold text-primary-900">{totalAmount.toLocaleString()} ₭</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-surface-500">ຍອດ Wallet</span>
                            <span className={`font-bold ${insufficientFunds ? "text-red-500" : "text-green-600"}`}>
                                {walletBalance.toLocaleString()} ₭
                            </span>
                        </div>
                        <div className="border-t border-surface-200 pt-2 flex justify-between">
                            <span className="text-surface-500">ຍອດເຫຼືອຫຼັງຊຳລະ</span>
                            <span className="font-bold text-primary-900">
                                {(walletBalance - totalAmount).toLocaleString()} ₭
                            </span>
                        </div>
                    </div>

                    {insufficientFunds && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-red-600">ຍອດເງິນບໍ່ພຽງພໍ</p>
                                <Link href="/account/wallet" className="text-xs text-accent-500 underline">
                                    → ເຕີມເງິນ Wallet
                                </Link>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mb-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => { setStep("idle"); setError(""); }}
                            disabled={step === "loading"}
                            className="py-2.5 border border-surface-300 text-surface-500 font-bold rounded-xl hover:bg-surface-50 transition-colors text-sm disabled:opacity-50"
                        >
                            ຍົກເລີກ
                        </button>
                        <button
                            onClick={handlePay}
                            disabled={step === "loading" || insufficientFunds}
                            className="py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                            {step === "loading" ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    ກຳລັງຊຳລະ...
                                </>
                            ) : (
                                "✅ ຢືນຢັນ"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default: Pay button
    return (
        <button
            onClick={() => setStep("confirm")}
            className="w-full py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-accent-500/20 flex items-center justify-center gap-2"
        >
            <CreditCard className="w-5 h-5" />
            ຊຳລະເງິນ {totalAmount.toLocaleString()} ₭
        </button>
    );
}
