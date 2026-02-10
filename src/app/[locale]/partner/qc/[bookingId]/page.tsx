import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import QCActionButtons from "@/components/partner/QCActionButtons";
import {
    ArrowLeft,
    Crown,
    ClipboardCheck,
    Camera,
    CheckCircle,
    AlertTriangle,
    Shirt,
    Calendar,
    ChevronRight,
    Eye,
    X,
    Shield,
} from "lucide-react";

type Props = { params: Promise<{ bookingId: string }> };

export default async function QCStationPage({ params }: Props) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const { bookingId } = await params;

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            garment: { include: { images: true, shop: true } },
            renter: { select: { name: true, phone: true } },
            damageClaims: true,
        },
    });

    if (!booking) notFound();

    return (
        <div className="min-h-screen bg-surface-150 pb-24">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-[#1a1a2e] text-white">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/partner/orders?tab=qcCheck" className="p-1 hover:bg-white/10 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <ClipboardCheck className="w-4 h-4 text-amber-400" />
                    <h1 className="font-bold">QC Station</h1>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {/* ════════════════════════════════════════
           STEP 1: ORDER INFO
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-primary-900 text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                        <span className="font-bold text-primary-900 text-sm">ຂໍ້ມູນການເຊົ່າ</span>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-16 h-20 bg-surface-200 rounded-lg shrink-0 flex items-center justify-center">
                            <Shirt className="w-6 h-6 text-surface-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-primary-900">{booking.garment.titleLo}</p>
                            <p className="text-xs text-surface-500">{booking.garment.code} | {booking.garment.size}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-surface-500">
                                <Calendar className="w-3 h-3" />
                                {booking.pickupDate.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                                → {booking.returnDate.toLocaleDateString("lo-LA", { day: "numeric", month: "short" })}
                            </div>
                            <p className="text-xs text-surface-500 mt-1">
                                👤 {booking.renter.name} | 📞 {booking.renter.phone}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
           STEP 2: COMPARE PHOTOS
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-primary-900 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                        <span className="font-bold text-primary-900 text-sm">ປຽບທຽບສະພາບ</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Before */}
                        <div>
                            <p className="text-[10px] text-surface-500 font-medium mb-1.5 text-center">
                                📸 ກ່ອນສົ່ງ (ຂາອອກ)
                            </p>
                            <div className="aspect-[3/4] bg-surface-100 border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center gap-1">
                                {booking.garment.images.length > 0 ? (
                                    <div className="w-full h-full bg-surface-200 rounded-xl flex items-center justify-center">
                                        <Eye className="w-6 h-6 text-surface-400" />
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-surface-400" />
                                        <span className="text-[10px] text-surface-400">ບໍ່ມີຮູບ</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* After */}
                        <div>
                            <p className="text-[10px] text-surface-500 font-medium mb-1.5 text-center">
                                📷 ປັດຈຸບັນ (ຂາເຂົ້າ)
                            </p>
                            <div className="aspect-[3/4] bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors">
                                <Camera className="w-8 h-8 text-blue-400" />
                                <span className="text-[10px] text-blue-500 font-medium">ຖ່າຍຮູບ 3 ມຸມ</span>
                                <span className="text-[9px] text-blue-400">(ບັງຄັບ)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════
           STEP 3: ASSESSMENT
           ════════════════════════════════════════ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 bg-primary-900 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
                        <span className="font-bold text-primary-900 text-sm">ປະເມີນຄວາມເສຍຫາຍ</span>
                    </div>

                    {/* Damage Points (Selectable) */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {[
                            { label: "ຄາບເປື້ອນ", emoji: "💧" },
                            { label: "ຂາດ/ປິ", emoji: "✂️" },
                            { label: "ກະດຸມຫຼຸດ", emoji: "🔘" },
                            { label: "ຊິບເສຍ", emoji: "🔗" },
                            { label: "ສີຕົກ", emoji: "🎨" },
                            { label: "ອື່ນໆ", emoji: "📝" },
                        ].map((point) => (
                            <button
                                key={point.label}
                                className="flex items-center gap-2 px-3 py-2.5 border border-surface-300 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                            >
                                <span className="text-lg">{point.emoji}</span>
                                <span className="text-xs font-medium text-primary-900">{point.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Existing damage claims */}
                    {booking.damageClaims.length > 0 && (
                        <div className="bg-red-50 rounded-xl p-3 mb-4">
                            <p className="text-xs font-bold text-red-600 mb-2">⚠️ ລາຍງານເດີມ:</p>
                            {booking.damageClaims.map((claim) => (
                                <div key={claim.id} className="text-xs text-red-700 mb-1">
                                    • {claim.description} — {claim.estimatedCost.toLocaleString()} ₭ ({claim.status})
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Cost Estimation */}
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-primary-900 mb-1.5 block">
                            💰 ຄ່າປະເມີນຄວາມເສຍຫາຍ (₭)
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-xs font-semibold text-primary-900 mb-1.5 block">
                            📝 ໝາຍເຫດ
                        </label>
                        <textarea
                            rows={3}
                            placeholder="ອະທິບາຍຈຸດເສຍຫາຍ..."
                            className="w-full px-4 py-3 bg-surface-100 border border-surface-300 rounded-xl text-primary-900 placeholder:text-surface-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all resize-none"
                        />
                    </div>
                </section>

                {/* ── Deposit Info ── */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-blue-700">ເງິນມັດຈຳຂອງລູກຄ້າ</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                            🔒 {booking.depositFee.toLocaleString()} ₭ — ຈະຄືນອັດຕະໂນມັດ ຖ້າກົດ OK
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Bottom Action Bar ── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-300 shadow-xl">
                <QCActionButtons bookingId={booking.id} depositAmount={booking.depositFee || booking.holdAmount || 0} />
            </div>
        </div>
    );
}
