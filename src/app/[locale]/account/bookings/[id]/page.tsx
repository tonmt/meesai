import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PaymentButton from "@/components/PaymentButton";
import ExtendButton from "@/components/ExtendButton";
import ReviewForm from "@/components/ReviewForm";
import {
    ArrowLeft,
    MapPin,
    Clock,
    Calendar,
    Shirt,
    CreditCard,
    Truck,
    CheckCircle,
    RotateCcw,
    Star,
    AlertTriangle,
    ChevronRight,
    Plus,
    Phone,
    Shield,
    MessageCircle,
} from "lucide-react";

type Props = {
    params: Promise<{ id: string }>;
};

const STATUS_STEPS = [
    { key: "PENDING", icon: Clock, label: "ສ້າງລາຍການ" },
    { key: "AWAITING_PAYMENT", icon: CreditCard, label: "ຊຳລະເງິນ" },
    { key: "CONFIRMED", icon: CheckCircle, label: "ຢືນຢັນແລ້ວ" },
    { key: "SHIPPING", icon: Truck, label: "ກຳລັງສົ່ງ" },
    { key: "PICKED_UP", icon: Shirt, label: "ຮັບຊຸດແລ້ວ" },
    { key: "IN_USE", icon: Shirt, label: "ກຳລັງໃຊ້ງານ" },
    { key: "AWAITING_RETURN", icon: RotateCcw, label: "ລໍຖ້າຄືນ" },
    { key: "RETURNED", icon: CheckCircle, label: "ຄືນແລ້ວ" },
    { key: "COMPLETED", icon: Star, label: "ສຳເລັດ" },
];

function getStepIndex(status: string): number {
    const idx = STATUS_STEPS.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
}

export default async function BookingDetailPage({ params }: Props) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const t = await getTranslations();
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
        where: { id, renterId: session.user.id },
        include: {
            garment: { include: { images: { take: 1 }, category: true, shop: true } },
            review: true,
            damageClaims: true,
        },
    });

    if (!booking) notFound();

    // Fetch wallet balance for payment
    const wallet = await prisma.wallet.findUnique({
        where: { userId: session.user.id },
    });

    const currentStep = getStepIndex(booking.status);
    const now = new Date();
    const returnDate = new Date(booking.returnDate);
    const diffMs = returnDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const hoursLeft = Math.max(0, Math.ceil((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

    return (
        <div className="min-h-screen bg-surface-150 pb-24">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/account/bookings" className="p-1 hover:bg-surface-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-primary-900" />
                    </Link>
                    <h1 className="font-bold text-primary-900">{t("account.bookingDetail")}</h1>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-3">
                {/* ════════════════════════════════════════
           TRACKING PROGRESS
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-accent-500" />
                        <span className="font-bold text-primary-900 text-sm">ຕິດຕາມສະຖານະ</span>
                    </div>

                    {/* Progress Steps */}
                    <div className="relative">
                        {STATUS_STEPS.slice(0, Math.min(currentStep + 2, STATUS_STEPS.length)).map(
                            (step, i) => {
                                const isPast = i < currentStep;
                                const isCurrent = i === currentStep;

                                return (
                                    <div key={step.key} className="flex items-start gap-3 mb-4 last:mb-0">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrent
                                                    ? "bg-accent-500 text-white ring-4 ring-accent-500/20"
                                                    : isPast
                                                        ? "bg-status-success text-white"
                                                        : "bg-surface-200 text-surface-400"
                                                    }`}
                                            >
                                                <step.icon className="w-4 h-4" />
                                            </div>
                                            {i < Math.min(currentStep + 1, STATUS_STEPS.length - 1) && (
                                                <div
                                                    className={`w-0.5 h-6 ${isPast ? "bg-status-success" : "bg-surface-200"}`}
                                                />
                                            )}
                                        </div>
                                        <div className="pt-1">
                                            <p
                                                className={`text-sm font-medium ${isCurrent ? "text-accent-500" : isPast ? "text-primary-900" : "text-surface-400"
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                            {isCurrent && (
                                                <p className="text-[11px] text-surface-500 mt-0.5">← ປັດຈຸບັນ</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                </section>

                {/* ════════════════════════════════════════
           COUNTDOWN (if IN_USE)
           ════════════════════════════════════════ */}
                {(booking.status === "IN_USE" || booking.status === "PICKED_UP") && (
                    <section className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5" />
                            <span className="font-bold text-sm">⏰ Countdown ກ່ອນຄືນຊຸດ</span>
                        </div>
                        <div className="flex items-baseline gap-3 mb-3">
                            <span className="text-4xl font-extrabold">{daysLeft}</span>
                            <span className="text-sm">ວັນ</span>
                            <span className="text-3xl font-extrabold">{hoursLeft}</span>
                            <span className="text-sm">ຊົ່ວໂມງ</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <ExtendButton bookingId={booking.id} dailyRate={booking.garment.pricePerDay} />
                            <Link
                                href={`/account/bookings/${booking.id}/return`}
                                className="py-2.5 bg-white text-green-600 rounded-xl font-bold text-sm transition-colors hover:bg-green-50 flex items-center justify-center gap-1"
                            >
                                <Truck className="w-4 h-4" />
                                ເອີ້ນລົດຮັບຄືນ
                            </Link>
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════
           AWAITING RETURN (blinking)
           ════════════════════════════════════════ */}
                {booking.status === "AWAITING_RETURN" && (
                    <section className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 animate-pulse">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                            <div>
                                <p className="font-bold text-orange-700">⚠️ ກະລຸນາຄືນຊຸດ!</p>
                                <p className="text-sm text-orange-600 mt-1">
                                    ຮອດເວລາຄືນແລ້ວ ກົດປຸ່ມລຸ່ມນີ້ ເພື່ອເອີ້ນລົດມາຮັບ
                                </p>
                                <button className="mt-3 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    🚚 ເອີ້ນລົດມາຮັບຄືນ
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════
           GARMENT INFO
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex gap-3">
                        <div className="w-20 h-24 bg-surface-200 rounded-lg shrink-0 flex items-center justify-center">
                            <Shirt className="w-8 h-8 text-surface-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-accent-500 font-medium">{booking.garment.category.nameLo}</p>
                            <p className="text-sm font-bold text-primary-900 mt-0.5">{booking.garment.titleLo}</p>
                            <p className="text-xs text-surface-500 mt-1">
                                ໄຊສ໌: {booking.garment.size} {booking.garment.color && `| ສີ: ${booking.garment.color}`}
                            </p>
                            <p className="text-xs text-surface-500">
                                ລະຫັດ: {booking.garment.code}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
           DATES & FEES
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-surface-500">
                                <Calendar className="w-4 h-4" /> ວັນຮັບຊຸດ
                            </span>
                            <span className="font-medium text-primary-900">
                                {booking.pickupDate.toLocaleDateString("lo-LA", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-surface-500">
                                <Calendar className="w-4 h-4" /> ວັນຄືນຊຸດ
                            </span>
                            <span className="font-medium text-primary-900">
                                {booking.returnDate.toLocaleDateString("lo-LA", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                        </div>
                        <hr className="border-surface-200" />
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">ຄ່າເຊົ່າ</span>
                            <span className="text-primary-900">{booking.rentalFee.toLocaleString()} ₭</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">ຄ່າມັດຈຳ</span>
                            <span className="text-primary-900">{booking.depositFee.toLocaleString()} ₭</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">ຄ່າບໍລິການ</span>
                            <span className="text-primary-900">{booking.serviceFee.toLocaleString()} ₭</span>
                        </div>
                        {booking.extensionFee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-surface-500">ຄ່າເຊົ່າຕໍ່ ({booking.extendedDays} ວັນ)</span>
                                <span className="text-orange-500 font-medium">+{booking.extensionFee.toLocaleString()} ₭</span>
                            </div>
                        )}
                        <hr className="border-surface-200" />
                        <div className="flex justify-between">
                            <span className="font-bold text-primary-900">ລວມທັງໝົດ</span>
                            <span className="text-lg font-extrabold text-accent-500">
                                {(booking.totalAmount + booking.extensionFee).toLocaleString()} ₭
                            </span>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
           SHOP INFO
           ════════════════════════════════════════ */}
                {booking.garment.shop && (
                    <section className="bg-white rounded-2xl border border-surface-300 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-50 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-accent-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-primary-900">Partner Store: MS-{booking.garment.shopId?.slice(-3).toUpperCase()}</p>
                            </div>
                            <Link
                                href="/sos"
                                className="flex items-center gap-1 px-3 py-1.5 border border-accent-500 text-accent-500 text-xs font-semibold rounded-lg hover:bg-accent-50 transition-colors"
                            >
                                <MessageCircle className="w-3 h-3" />
                                ຕິດຕໍ່ MeeSai
                            </Link>
                        </div>
                    </section>
                )}

                {/* ════════════════════════════════════════
           DAMAGE CLAIMS
           ════════════════════════════════════════ */}
                {booking.damageClaims.length > 0 && (
                    <section className="bg-red-50 rounded-2xl border border-red-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span className="font-bold text-red-700 text-sm">ລາຍງານຄວາມເສຍຫາຍ</span>
                        </div>
                        {booking.damageClaims.map((claim) => (
                            <div key={claim.id} className="bg-white rounded-xl p-3 border border-red-200">
                                <p className="text-sm text-red-700">{claim.description}</p>
                                <p className="text-xs text-red-500 mt-1">
                                    ປະເມີນ: {claim.estimatedCost.toLocaleString()} ₭ — {claim.status}
                                </p>
                            </div>
                        ))}
                    </section>
                )}
            </div>

            {/* ── Bottom Action ── */}
            {booking.status === "AWAITING_PAYMENT" && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-300 shadow-xl">
                    <div className="max-w-xl mx-auto px-4 py-3">
                        <PaymentButton
                            bookingId={booking.id}
                            totalAmount={booking.totalAmount}
                            walletBalance={wallet?.availableBalance ?? 0}
                        />
                    </div>
                </div>
            )}

            {booking.status === "COMPLETED" && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-300 shadow-xl">
                    <div className="max-w-xl mx-auto px-4 py-3">
                        <ReviewForm bookingId={booking.id} hasReview={!!booking.review} />
                    </div>
                </div>
            )}
        </div>
    );
}
