"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Phone, Lock, Eye, EyeOff, Gem, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const t = useTranslations();
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                phone,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("ເບີໂທ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ");
            } else {
                router.push("/");
                router.refresh();
            }
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
                        {t("auth.loginTitle")}
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

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-primary-900 mb-1.5">
                                {t("auth.phoneNumber")}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-500 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                                    required
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
                                    {t("auth.loginTitle")}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-surface-500">
                            {t("auth.noAccount")}{" "}
                            <Link
                                href="/register"
                                className="text-accent-500 font-semibold hover:underline"
                            >
                                {t("common.register")}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Test Credentials */}
                <div className="mt-6 bg-white/80 rounded-xl border border-surface-300 p-4">
                    <p className="text-xs font-semibold text-surface-500 mb-2 uppercase tracking-wider">
                        Test Credentials
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                            { role: "Admin", phone: "02099990001" },
                            { role: "Staff", phone: "02099990002" },
                            { role: "Owner", phone: "02055551001" },
                            { role: "Renter", phone: "02077772001" },
                        ].map((cred) => (
                            <button
                                key={cred.role}
                                onClick={() => {
                                    setPhone(cred.phone);
                                    setPassword("meesai123");
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-surface-100 hover:bg-accent-50 rounded-lg border border-surface-300 hover:border-accent-500/30 transition-all text-left"
                            >
                                <Gem className="w-3 h-3 text-accent-500 shrink-0" />
                                <div>
                                    <p className="font-semibold text-primary-900">{cred.role}</p>
                                    <p className="text-surface-500">{cred.phone}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
