"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Ruler, Save, Loader2, CheckCircle } from "lucide-react";
import { saveSizeProfile } from "../actions";

type SizeData = {
    bust: string;
    waist: string;
    hip: string;
    height: string;
    weight: string;
    notes: string;
};

export default function SizeProfilePage() {
    const t = useTranslations();
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState<SizeData>({
        bust: "",
        waist: "",
        hip: "",
        height: "",
        weight: "",
        notes: "",
    });

    function updateField(field: keyof SizeData, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    }

    function handleSave() {
        startTransition(async () => {
            try {
                await saveSizeProfile("current-user", {
                    bust: form.bust ? parseInt(form.bust) : undefined,
                    waist: form.waist ? parseInt(form.waist) : undefined,
                    hip: form.hip ? parseInt(form.hip) : undefined,
                    height: form.height ? parseInt(form.height) : undefined,
                    weight: form.weight ? parseInt(form.weight) : undefined,
                    notes: form.notes || undefined,
                });
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } catch (error) {
                console.error("Save error:", error);
            }
        });
    }

    const fields = [
        { key: "bust" as const, label: "ອົກ (Bust)", unit: "cm", icon: "📏" },
        { key: "waist" as const, label: "ແອ້ວ (Waist)", unit: "cm", icon: "📐" },
        { key: "hip" as const, label: "ສະໂພກ (Hip)", unit: "cm", icon: "📏" },
        { key: "height" as const, label: "ສ່ວນສູງ (Height)", unit: "cm", icon: "📐" },
        { key: "weight" as const, label: "ນ້ຳໜັກ (Weight)", unit: "kg", icon: "⚖️" },
    ];

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/account" className="p-1 hover:bg-surface-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-primary-900" />
                    </Link>
                    <h1 className="font-bold text-primary-900">My Size Profile</h1>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-sm text-blue-700">
                        <Ruler className="w-4 h-4 inline mr-1" />
                        ບັນທຶກສັດສ່ວນໄວ້ ລະບົບ AI ຈະແນະນຳໄຊສ໌ທີ່ເໝາະກັບທ່ານ ເວລາເຊົ່າຊຸດ
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.key}>
                                <label className="block text-sm font-semibold text-primary-900 mb-1.5">
                                    {field.icon} {field.label}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form[field.key]}
                                        onChange={(e) => updateField(field.key, e.target.value)}
                                        placeholder="0"
                                        className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all pr-12"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-surface-500">
                                        {field.unit}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-primary-900 mb-1.5">
                                📝 ໝາຍເຫດ
                            </label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                placeholder="ເຊັ່ນ: ມັກໃສ່ໜ້ອຍໜຶ່ງ ບໍ່ມັກລັດ..."
                                rows={3}
                                className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className={`w-full py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${saved
                            ? "bg-status-success text-white"
                            : "bg-accent-500 hover:bg-accent-600 text-white shadow-accent-500/20"
                        } disabled:bg-surface-400`}
                >
                    {isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : saved ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            ບັນທຶກສຳເລັດ!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {t("common.save")}
                        </>
                    )}
                </button>

                {/* Size Guide */}
                <div className="bg-white rounded-2xl border border-surface-300 p-4">
                    <p className="font-bold text-primary-900 text-sm mb-3">📊 ຄູ່ມືວັດໄຊສ໌</p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-surface-100">
                                    <th className="px-3 py-2 text-left font-semibold text-primary-900">ໄຊສ໌</th>
                                    <th className="px-3 py-2 text-center font-semibold text-primary-900">ອົກ</th>
                                    <th className="px-3 py-2 text-center font-semibold text-primary-900">ແອ້ວ</th>
                                    <th className="px-3 py-2 text-center font-semibold text-primary-900">ສະໂພກ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-200">
                                {[
                                    { size: "S", bust: "82-86", waist: "62-66", hip: "88-92" },
                                    { size: "M", bust: "86-90", waist: "66-70", hip: "92-96" },
                                    { size: "L", bust: "90-94", waist: "70-74", hip: "96-100" },
                                    { size: "XL", bust: "94-98", waist: "74-78", hip: "100-104" },
                                ].map((row) => (
                                    <tr key={row.size} className="hover:bg-surface-50">
                                        <td className="px-3 py-2 font-bold text-accent-500">{row.size}</td>
                                        <td className="px-3 py-2 text-center text-surface-500">{row.bust}</td>
                                        <td className="px-3 py-2 text-center text-surface-500">{row.waist}</td>
                                        <td className="px-3 py-2 text-center text-surface-500">{row.hip}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
