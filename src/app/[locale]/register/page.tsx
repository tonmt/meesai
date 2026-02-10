"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, Eye, EyeOff, User, ArrowRight, Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
    const t = useTranslations();
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function updateField(field: string, value: string) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("ລະຫັດຜ່ານບໍ່ກົງກັນ");
            return;
        }

        if (form.password.length < 6) {
            setError("ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    phone: form.phone,
                    password: form.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t("common.error"));
                return;
            }

            router.push("/login?registered=true");
        } catch {
            setError(t("common.error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-surface-150 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-extrabold text-xl">M</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-extrabold text-primary-900 mt-4">
                        {t("auth.registerTitle")}
                    </h1>
                    <p className="text-surface-500 text-sm mt-1">
                        {t("common.tagline")}
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-surface-300 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-primary-900 mb-1.5">
                                {t("auth.name")}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                                    className="w-full pl-11 pr-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-primary-900 mb-1.5">
                                {t("auth.phoneNumber")}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                    placeholder="020xxxxxxxx"
                                    className="w-full pl-11 pr-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-primary-900 mb-1.5">
                                {t("auth.password")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    placeholder="ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"
                                    className="w-full pl-11 pr-12 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-primary-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-primary-900 mb-1.5">
                                {t("auth.confirmPassword")}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                                    placeholder="ກະລຸນາໃສ່ລະຫັດຜ່ານອີກຄັ້ງ"
                                    className="w-full pl-11 pr-12 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                                    required
                                />
                                {form.confirmPassword && form.password === form.confirmPassword && (
                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-status-success" />
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-accent-500 hover:bg-accent-600 disabled:bg-surface-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {t("auth.registerTitle")}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-surface-500">
                            {t("auth.hasAccount")}{" "}
                            <Link
                                href="/login"
                                className="text-accent-500 font-semibold hover:underline"
                            >
                                {t("common.login")}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
