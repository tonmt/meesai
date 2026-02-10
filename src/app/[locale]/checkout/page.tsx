import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Truck,
    Sparkles,
    Package,
    Shield,
    CreditCard,
    QrCode,
    CheckCircle,
    Clock,
    Star,
    Shirt,
} from "lucide-react";
import CheckoutForm from "./CheckoutForm";

type Props = {
    searchParams: Promise<{ garment?: string; pickup?: string; return?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const params = await searchParams;
    const t = await getTranslations();

    if (!params.garment) redirect("/browse");

    const garment = await prisma.garment.findUnique({
        where: { id: params.garment },
        include: {
            shop: { select: { nameLo: true, isVerified: true } },
            images: { take: 1 },
        },
    });

    if (!garment) notFound();

    const pickup = params.pickup ? new Date(params.pickup) : null;
    const returnDate = params.return ? new Date(params.return) : null;

    // Calculate fees
    const deliveryFee = 30000;
    const laundryFee = 20000;
    const totalPay = garment.rentalPrice + deliveryFee + laundryFee;

    // Rental days
    const days = pickup && returnDate
        ? Math.ceil((returnDate.getTime() - pickup.getTime()) / (86400000))
        : 0;

    // Event date = 1 day after pickup (default)
    const eventDate = pickup ? new Date(pickup.getTime() + 86400000) : null;

    return (
        <div className="min-h-screen bg-surface-150 pb-24">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href={`/browse/${garment.id}`} className="p-1 hover:bg-surface-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-primary-900" />
                    </Link>
                    <h1 className="font-bold text-primary-900">ຢືນຢັນການຈອງ</h1>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {/* ═══ GARMENT SUMMARY ═══ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex gap-3">
                        <div className="w-20 h-24 bg-surface-200 rounded-xl shrink-0 flex items-center justify-center">
                            <Shirt className="w-8 h-8 text-surface-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-primary-900">{garment.titleLo}</p>
                            <p className="text-xs text-surface-500 mt-0.5">{garment.code} | {garment.size} | {garment.color}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-surface-500">
                                <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                                5.0 | 🏪 {garment.shop?.nameLo}
                                {garment.shop?.isVerified && <Shield className="w-3 h-3 text-status-success ml-1" />}
                            </div>
                            <p className="text-sm font-extrabold text-accent-500 mt-1.5">
                                {garment.rentalPrice.toLocaleString()} ₭ <span className="text-xs font-normal text-surface-500">/ ຄັ້ງ</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══ USAGE TIMELINE (HORIZONTAL) ═══ */}
                {pickup && returnDate && (
                    <section className="bg-white rounded-2xl border border-surface-300 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarDays className="w-5 h-5 text-accent-500" />
                            <h2 className="text-sm font-bold text-primary-900">Timeline ການເຊົ່າ ({days} ມື້)</h2>
                        </div>

                        {/* Timeline Steps */}
                        <div className="relative">
                            {/* Line */}
                            <div className="absolute top-5 left-5 right-5 h-0.5 bg-surface-300 z-0" />

                            <div className="flex justify-between relative z-10">
                                {/* Step 1: Deliver */}
                                <div className="flex flex-col items-center text-center w-1/3">
                                    <div className="w-10 h-10 bg-accent-500 text-white rounded-full flex items-center justify-center mb-2">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] font-bold text-primary-900">🚚 ສົ່ງຊຸດ</p>
                                    <p className="text-[10px] text-accent-500 font-medium">
                                        {pickup.toLocaleDateString("lo-LA", { weekday: "short", day: "numeric", month: "short" })}
                                    </p>
                                    <p className="text-[9px] text-surface-500">14:00 — ລອງຊຸດ</p>
                                </div>

                                {/* Step 2: Event Day */}
                                <div className="flex flex-col items-center text-center w-1/3">
                                    <div className="w-10 h-10 bg-amber-400 text-white rounded-full flex items-center justify-center mb-2">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] font-bold text-primary-900">✨ ວັນງານ</p>
                                    {eventDate && (
                                        <p className="text-[10px] text-amber-500 font-medium">
                                            {eventDate.toLocaleDateString("lo-LA", { weekday: "short", day: "numeric", month: "short" })}
                                        </p>
                                    )}
                                    <p className="text-[9px] text-surface-500">ໃສ່ອວດງາມ ✨</p>
                                </div>

                                {/* Step 3: Return */}
                                <div className="flex flex-col items-center text-center w-1/3">
                                    <div className="w-10 h-10 bg-primary-900 text-white rounded-full flex items-center justify-center mb-2">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] font-bold text-primary-900">📦 ຄືນຊຸດ</p>
                                    <p className="text-[10px] text-primary-900 font-medium">
                                        {returnDate.toLocaleDateString("lo-LA", { weekday: "short", day: "numeric", month: "short" })}
                                    </p>
                                    <p className="text-[9px] text-surface-500">12:00 — ໃສ່ຖົງ ແປະ ສົ່ງ</p>
                                </div>
                            </div>
                        </div>

                        {/* Hygiene Seal */}
                        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-emerald-700">🧖‍♀️ Cleaned & Sealed</p>
                                <p className="text-[10px] text-emerald-600">ຊັກແຫ້ງ + ຕິດ Hygiene Seal + Return Kit ໃນກ່ອງ</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* ═══ FEE BREAKDOWN ═══ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-5 h-5 text-accent-500" />
                        <h2 className="text-sm font-bold text-primary-900">ສະຫຼຸບຄ່າໃຊ້ຈ່າຍ</h2>
                    </div>

                    <div className="space-y-2.5 mb-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">ຄ່າເຊົ່າ</span>
                            <span className="font-medium text-primary-900">{garment.rentalPrice.toLocaleString()} ₭</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">ຄ່າຈັດສົ່ງ (ໄປ-ກັບ)</span>
                            <span className="font-medium text-primary-900">{deliveryFee.toLocaleString()} ₭</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">ຄ່າຊັກແຫ້ງ</span>
                            <span className="font-medium text-primary-900">{laundryFee.toLocaleString()} ₭</span>
                        </div>
                    </div>

                    {/* TOTAL PAY (REAL CHARGE) */}
                    <div className="border-t-2 border-accent-500 pt-3 mb-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm font-extrabold text-primary-900">✅ ຈ່າຍຕົວຈິງ</span>
                            <span className="text-2xl font-extrabold text-accent-500">{totalPay.toLocaleString()} ₭</span>
                        </div>
                    </div>

                    {/* HOLD AMOUNT (NOT CHARGED) */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                            <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-blue-700">
                                    🔒 ວົງເງິນປະກັນ — ບໍ່ຕັດເງິນ, ແຄ່ Hold
                                </p>
                                <p className="text-lg font-extrabold text-blue-600 mt-0.5">
                                    {garment.deposit.toLocaleString()} ₭
                                </p>
                                <p className="text-[10px] text-blue-500 mt-1">
                                    <Clock className="w-3 h-3 inline mr-0.5" />
                                    ປົດລ໋ອກ ພາຍໃນ 1 ຊົ່ວໂມງ ຫຼັງ QC ຜ່ານ
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ PAYMENT METHOD ═══ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-accent-500" />
                        <h2 className="text-sm font-bold text-primary-900">ຊ່ອງທາງຊຳລະ</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border-2 border-accent-500 bg-accent-50 rounded-xl cursor-pointer">
                            <input type="radio" name="payment" defaultChecked className="accent-accent-500" />
                            <div className="flex items-center gap-2 flex-1">
                                <div className="w-8 h-8 bg-[#003580] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">BCEL</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary-900">BCEL One (ສະແກນ QR)</p>
                                    <p className="text-[10px] text-surface-500">ແນະນຳ — ໄວທີ່ສຸດ</p>
                                </div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-surface-300 rounded-xl cursor-pointer hover:border-surface-400 transition-colors">
                            <input type="radio" name="payment" className="accent-accent-500" />
                            <div className="flex items-center gap-2 flex-1">
                                <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary-900">ໂອນເງິນ</p>
                                    <p className="text-[10px] text-surface-500">ສົ່ງຫຼັກຖານໃນແຊັດ</p>
                                </div>
                            </div>
                        </label>
                    </div>
                </section>

                {/* ── Checkout Form (Client Component) ── */}
                <CheckoutForm
                    garmentId={garment.id}
                    pickup={params.pickup || ""}
                    returnDate={params.return || ""}
                    totalPay={totalPay}
                />
            </div>
        </div>
    );
}
