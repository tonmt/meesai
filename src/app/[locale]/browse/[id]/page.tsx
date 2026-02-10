import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import {
    ArrowLeft,
    Star,
    Shield,
    Truck,
    Sparkles,
    ChevronRight,
    ShoppingBag,
    MessageCircle,
    CheckCircle,
    CalendarDays,
    Info,
    Ruler,
    AlertTriangle,
    Target,
    Zap,
    Package,
    Store,
    Heart,
    Share2,
    Eye,
} from "lucide-react";
import ShareButton from "@/components/ShareButton";
import WishlistButton from "@/components/WishlistButton";

interface Props {
    params: Promise<{ id: string; locale: string }>;
    searchParams: Promise<{ pickup?: string; return?: string }>;
}

// Condition Grade config
const gradeConfig: Record<string, { bg: string; text: string; label: string; description: string }> = {
    A_PLUS: { bg: "bg-emerald-100", text: "text-emerald-700", label: "A+", description: "ສະພາບສົມບູນແບບ 100%" },
    A: { bg: "bg-emerald-50", text: "text-emerald-600", label: "A", description: "ດີຫຼາຍ — ໃກ້ຄືໃໝ່" },
    B: { bg: "bg-amber-50", text: "text-amber-600", label: "B", description: "ດີ — ມີຮ່ອງຮອຍການໃຊ້ເລັກນ້ອຍ" },
    C: { bg: "bg-red-50", text: "text-red-600", label: "C", description: "ໃຊ້ໄດ້ — ເຫັນຮ່ອງຮອຍແຕ່ບໍ່ເສຍຫາຍ" },
};

const themeLabels: Record<string, string> = {
    WEDDING: "💒 ແຕ່ງງານ",
    GALA: "🎉 ງານກາລາ",
    TEMPLE: "🙏 ງານບຸນ",
    BRIDAL_PARTY: "👰 ເພື່ອນເຈົ້າສາວ",
    GRADUATION: "🎓 ຮັບປະລິນຍາ",
    BUSINESS: "💼 ທຸລະກິດ",
    COSTUME: "🎭 ຄອສຕູມ",
    OTHER: "📌 ອື່ນໆ",
};

// Fit Score Calculation
function calculateFitScore(
    garment: { bustMin: number | null; bustMax: number | null; waistMin: number | null; waistMax: number | null; hipMin: number | null; hipMax: number | null; heightMin: number | null; heightMax: number | null },
    profile: { bust: number | null; waist: number | null; hip: number | null; height: number | null } | null
): { score: number; details: { label: string; status: "perfect" | "loose" | "tight" | "unknown"; note: string }[] } | null {
    if (!profile) return null;
    const details: { label: string; status: "perfect" | "loose" | "tight" | "unknown"; note: string }[] = [];
    let total = 0;
    let count = 0;

    const check = (label: string, value: number | null, min: number | null, max: number | null) => {
        if (!value || !min || !max) {
            details.push({ label, status: "unknown", note: "ບໍ່ມີຂໍ້ມູນ" });
            return;
        }
        count++;
        if (value >= min && value <= max) {
            total += 100;
            details.push({ label, status: "perfect", note: `${value} ຊມ (${min}-${max})` });
        } else if (value < min) {
            const diff = min - value;
            total += Math.max(0, 100 - diff * 10);
            details.push({ label, status: "tight", note: `${value} ຊມ ← ນ້ອຍກວ່າ ${diff} ຊມ` });
        } else {
            const diff = value - max;
            total += Math.max(0, 100 - diff * 10);
            details.push({ label, status: "loose", note: `${value} ຊມ ← ໃຫຍ່ກວ່າ ${diff} ຊມ` });
        }
    };

    check("ອົກ", profile.bust, garment.bustMin, garment.bustMax);
    check("ແອວ", profile.waist, garment.waistMin, garment.waistMax);
    check("ສະໂພກ", profile.hip, garment.hipMin, garment.hipMax);
    check("ສ່ວນສູງ", profile.height, garment.heightMin, garment.heightMax);

    return { score: count > 0 ? Math.round(total / count) : 0, details };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
    const { id } = await params;
    const sp = await searchParams;
    const t = await getTranslations();

    const garment = await prisma.garment.findUnique({
        where: { id },
        include: {
            category: true,
            shop: true,
            images: { orderBy: { sortOrder: "asc" } },
        },
    });

    if (!garment) notFound();

    // Fetch user's size profile (if logged in)
    const session = await auth();
    const sizeProfile = session?.user?.id
        ? await prisma.sizeProfile.findUnique({ where: { userId: session.user.id } })
        : null;

    // Calculate Fit Score
    const fitResult = calculateFitScore(garment, sizeProfile);

    // Fetch reviews
    const reviews = await prisma.review.findMany({
        where: { booking: { garmentId: id } },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 5.0;

    const grade = gradeConfig[garment.conditionGrade] || gradeConfig.A;

    // Fees
    const deliveryFee = 30000;
    const laundryFee = 20000;
    const totalPay = garment.rentalPrice + deliveryFee + laundryFee;

    // Similar products — same category, different garment
    const similarGarments = await prisma.garment.findMany({
        where: {
            categoryId: garment.categoryId,
            id: { not: garment.id },
            status: "AVAILABLE",
        },
        include: { images: true, category: true },
        orderBy: { createdAt: "desc" },
        take: 6,
    });

    // Shop's other garments
    const shopGarments = await prisma.garment.findMany({
        where: {
            shopId: garment.shopId,
            id: { not: garment.id },
            status: "AVAILABLE",
        },
        include: { images: true },
        orderBy: { createdAt: "desc" },
        take: 6,
    });

    return (
        <div className="min-h-screen bg-surface-150 pb-24 lg:pb-8">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/browse" className="flex items-center gap-1.5 text-primary-900 hover:text-accent-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">{t("browse.backToBrowse")}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ShareButton title={garment.titleLo} />
                        <WishlistButton
                            garmentId={garment.id}
                            userId={session?.user?.id || ""}
                            initialWishlisted={false}
                        />
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════
               DESKTOP: 2-Column Layout (Gallery | Info+CTA)
               MOBILE: Single column stacked
            ══════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto lg:px-8 lg:py-6">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">

                    {/* ═══════════ LEFT COLUMN: Gallery ═══════════ */}
                    <div className="lg:col-span-7">
                        <section className="bg-white lg:rounded-2xl lg:overflow-hidden lg:border lg:border-surface-300">
                            {/* Main Image */}
                            <div className="aspect-[4/5] lg:aspect-[4/4] bg-surface-100 flex items-center justify-center relative overflow-hidden">
                                {/* Condition Grade Badge */}
                                <div className={`absolute top-3 left-3 ${grade.bg} ${grade.text} px-3 py-1.5 rounded-xl z-10`}>
                                    <span className="text-sm font-extrabold">Grade {grade.label}</span>
                                </div>
                                {garment.images[0] ? (
                                    <Image src={garment.images[0].url} alt={garment.titleLo} fill className="object-cover" priority />
                                ) : (
                                    <div className="text-center">
                                        <ShoppingBag className="w-20 h-20 text-surface-400 mx-auto mb-3" />
                                        <p className="text-surface-500 text-sm">{garment.titleLo}</p>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {garment.images.length > 0 && (
                                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide lg:flex-wrap lg:gap-3 lg:p-4">
                                    {garment.images.map((img, i) => (
                                        <div
                                            key={img.id}
                                            className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-lg border-2 ${i === 0 ? "border-accent-500 ring-2 ring-accent-500/20" : "border-surface-300 hover:border-accent-300"} bg-surface-200 relative overflow-hidden cursor-pointer transition-all`}
                                        >
                                            <Image src={img.url} alt={img.alt || garment.titleLo} fill className="object-cover" sizes="80px" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* ═══════════ DESKTOP-ONLY: Details below gallery ═══════════ */}

                        {/* ── Condition Report (Desktop: under gallery) ── */}
                        <section className="bg-white mt-3 p-4 lg:rounded-2xl lg:border lg:border-surface-300">
                            <div className="flex items-center gap-2 mb-3">
                                <Shield className="w-5 h-5 text-accent-500" />
                                <h2 className="text-sm font-bold text-primary-900">ລາຍງານສະພາບ (Condition Report)</h2>
                            </div>

                            <div className={`${grade.bg} rounded-xl p-3 flex items-center gap-3 mb-3`}>
                                <div className={`w-12 h-12 rounded-full ${grade.bg} border-2 border-white flex items-center justify-center`}>
                                    <span className={`text-xl font-extrabold ${grade.text}`}>{grade.label}</span>
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${grade.text}`}>{grade.description}</p>
                                    <p className="text-xs text-surface-500 mt-0.5">ຕຣວດສອບໂດຍ QC Team</p>
                                </div>
                            </div>

                            {garment.defectNotes && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-amber-700">ຕຳໜິທີ່ພົບ:</p>
                                            <p className="text-xs text-amber-600 mt-1">{garment.defectNotes}</p>
                                            <p className="text-[10px] text-amber-500 mt-1">📸 ຮູບ Close-up ຢູ່ໃນ Gallery ດ້ານເທິງ</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ── Details Grid ── */}
                        <section className="bg-white mt-3 p-4 lg:rounded-2xl lg:border lg:border-surface-300">
                            <h2 className="text-sm font-bold text-primary-900 mb-3">{t("product.details")}</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                                <div>
                                    <p className="text-surface-500">ໝວດໝູ່</p>
                                    <p className="font-medium text-primary-900">{garment.category.nameLo}</p>
                                </div>
                                <div>
                                    <p className="text-surface-500">ໄຊສ໌</p>
                                    <p className="font-medium text-primary-900">{garment.size}</p>
                                </div>
                                {garment.color && (
                                    <div>
                                        <p className="text-surface-500">ສີ</p>
                                        <div className="flex items-center gap-1.5">
                                            {garment.colorHex && (
                                                <span className="w-4 h-4 rounded-full border border-surface-300" style={{ backgroundColor: garment.colorHex }} />
                                            )}
                                            <p className="font-medium text-primary-900">{garment.color}</p>
                                        </div>
                                    </div>
                                )}
                                {garment.brand && (
                                    <div>
                                        <p className="text-surface-500">ແບຣນ</p>
                                        <p className="font-medium text-primary-900">{garment.brand}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-surface-500">ລະຫັດ</p>
                                    <p className="font-medium text-primary-900">{garment.code}</p>
                                </div>
                                <div>
                                    <p className="text-surface-500">Buffer ຊັກຣີດ</p>
                                    <p className="font-medium text-primary-900">{garment.bufferDays} ວັນ</p>
                                </div>
                            </div>

                            {garment.description && (
                                <div className="mt-4 pt-4 border-t border-surface-300">
                                    <p className="text-sm text-surface-500 leading-relaxed">{garment.description}</p>
                                </div>
                            )}
                        </section>

                        {/* ── Reviews Section ── */}
                        <section className="bg-white mt-3 p-4 lg:rounded-2xl lg:border lg:border-surface-300">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-primary-900">ຣີວິວ ({reviewCount})</h2>
                                <Link href={`/browse/${garment.id}/reviews`} className="text-accent-500 text-xs font-semibold flex items-center gap-0.5">
                                    ເບິ່ງທັງໝົດ <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-surface-200 pb-4 last:border-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-surface-500">{review.user.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-primary-900">{review.user.name}</p>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-amber-400" : "text-surface-300"}`} fill={s <= review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-xs text-surface-500 leading-relaxed">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-surface-500 text-center py-6">ຍັງບໍ່ມີຣີວິວ — ລອງເປັນຄົນທຳອິດ!</p>
                            )}
                        </section>
                    </div>

                    {/* ═══════════ RIGHT COLUMN: Info + CTA (Sticky on Desktop) ═══════════ */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-20 space-y-3">

                            {/* ═══ PRICE & TITLE ═══ */}
                            <section className="bg-white mt-2 lg:mt-0 p-4 lg:rounded-2xl lg:border lg:border-surface-300">
                                {/* Category + Code */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs bg-accent-50 text-accent-600 px-2 py-0.5 rounded-full font-medium">{garment.category.nameLo}</span>
                                    <span className="text-xs text-surface-400">{garment.code}</span>
                                </div>

                                <h1 className="text-xl lg:text-2xl font-bold text-primary-900 leading-tight mb-1">
                                    {garment.titleLo}
                                </h1>
                                {garment.titleEn && (
                                    <p className="text-sm text-surface-500 mb-3">{garment.titleEn}</p>
                                )}

                                {/* Price Block */}
                                <div className="flex items-baseline gap-3 mb-3 pb-3 border-b border-surface-200">
                                    <span className="text-3xl font-extrabold text-accent-500">
                                        {garment.rentalPrice.toLocaleString()} ₭
                                    </span>
                                    <span className="text-sm text-surface-500">/ ຄັ້ງ</span>
                                </div>

                                {/* Event Theme Tags */}
                                {garment.eventThemes.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {garment.eventThemes.map((theme) => (
                                            <span key={theme} className="text-xs bg-primary-900/5 text-primary-900/80 px-2.5 py-1 rounded-full font-medium">
                                                {themeLabels[theme] || theme}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Trust Badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="badge-available">✅ ພ້ອມເຊົ່າ</span>
                                    <span className="badge-free">🚚 ສ່ງຟຣີ</span>
                                    <span className="badge-free">✨ ຊັກຟຣີ</span>
                                </div>

                                {/* Rating + Stats */}
                                <div className="flex items-center flex-wrap gap-3 text-sm">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`w-4 h-4 ${s <= Math.round(avgRating) ? "text-amber-400" : "text-surface-300"}`}
                                                fill={s <= Math.round(avgRating) ? "currentColor" : "none"}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-bold text-primary-900">{avgRating.toFixed(1)}</span>
                                    <span className="text-surface-500">({reviewCount} ຣີວິວ)</span>
                                    <span className="text-surface-400">|</span>
                                    <span className="text-surface-500 flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        ເຊົ່າແລ້ວ {garment.totalRentals} ຄັ້ງ
                                    </span>
                                </div>
                            </section>

                            {/* ═══ FIT ASSURANCE ═══ */}
                            <section className="bg-white p-4 lg:rounded-2xl lg:border lg:border-surface-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="w-5 h-5 text-accent-500" />
                                    <h2 className="text-sm font-bold text-primary-900">ຄວາມພໍດີ (Fit Assurance)</h2>
                                </div>

                                {/* Size Range */}
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {[
                                        { label: "ອົກ", min: garment.bustMin, max: garment.bustMax, unit: "ຊມ" },
                                        { label: "ແອວ", min: garment.waistMin, max: garment.waistMax, unit: "ຊມ" },
                                        { label: "ສະໂພກ", min: garment.hipMin, max: garment.hipMax, unit: "ຊມ" },
                                        { label: "ສ່ວນສູງ", min: garment.heightMin, max: garment.heightMax, unit: "ຊມ" },
                                    ].map((m) => (
                                        <div key={m.label} className="bg-surface-50 rounded-lg p-2.5 text-center">
                                            <p className="text-[10px] text-surface-500 font-medium">{m.label}</p>
                                            <p className="text-sm font-bold text-primary-900">
                                                {m.min && m.max ? `${m.min}-${m.max}` : "—"}
                                            </p>
                                            <p className="text-[9px] text-surface-400">{m.unit}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Fit Score */}
                                {fitResult ? (
                                    <div className="border border-surface-300 rounded-xl p-4">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${fitResult.score >= 90 ? "border-emerald-400 bg-emerald-50" :
                                                fitResult.score >= 70 ? "border-amber-400 bg-amber-50" :
                                                    "border-red-400 bg-red-50"
                                                }`}>
                                                <span className={`text-xl font-extrabold ${fitResult.score >= 90 ? "text-emerald-600" :
                                                    fitResult.score >= 70 ? "text-amber-600" :
                                                        "text-red-600"
                                                    }`}>{fitResult.score}%</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-primary-900">
                                                    {fitResult.score >= 90 ? "🎯 ພໍດີຫຼາຍ!" :
                                                        fitResult.score >= 70 ? "👍 ໃສ່ໄດ້" :
                                                            "⚠️ ອາດບໍ່ພໍດີ"}
                                                </p>
                                                <p className="text-xs text-surface-500 mt-0.5">ຄຳນວນຈາກ Size Profile ຂອງທ່ານ</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {fitResult.details.map((d) => (
                                                <div key={d.label} className="flex items-center gap-2 text-xs">
                                                    {d.status === "perfect" && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                                                    {d.status === "loose" && <Info className="w-3.5 h-3.5 text-amber-500" />}
                                                    {d.status === "tight" && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                                                    {d.status === "unknown" && <Info className="w-3.5 h-3.5 text-surface-400" />}
                                                    <span className="font-medium text-primary-900 w-16">{d.label}:</span>
                                                    <span className={
                                                        d.status === "perfect" ? "text-emerald-600" :
                                                            d.status === "loose" ? "text-amber-600" :
                                                                d.status === "tight" ? "text-red-600" :
                                                                    "text-surface-400"
                                                    }>{d.note}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href="/account/size-profile"
                                        className="flex items-center gap-2 px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl w-full hover:bg-primary-100 transition-colors"
                                    >
                                        <Ruler className="w-5 h-5 text-primary-600" />
                                        <div>
                                            <p className="text-sm font-medium text-primary-700">ກວດ Fit Score ກ່ອນເຊົ່າ</p>
                                            <p className="text-[10px] text-primary-500">ກົດບ່ອນນີ້ ກອກ ອົກ/ແອວ/ສະໂພກ ລະບົບຄຳນວນ % ຄວາມພໍດີ</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-primary-500 ml-auto" />
                                    </Link>
                                )}

                                {/* Backup Size */}
                                {garment.backupSizeFee > 0 && (
                                    <div className="mt-3 bg-accent-50 border border-accent-200 rounded-xl p-3 flex items-start gap-2">
                                        <Package className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-accent-700">✨ Backup Size Option</p>
                                            <p className="text-[10px] text-accent-600 mt-0.5">
                                                ເພີ່ມ {garment.backupSizeFee.toLocaleString()} ₭ ສົ່ງໄຊສ໌ສຳຮອງໄປໃຫ້ລອງ
                                            </p>
                                        </div>
                                        <Zap className="w-4 h-4 text-accent-400 shrink-0" />
                                    </div>
                                )}
                            </section>

                            {/* ═══ COST BREAKDOWN ═══ */}
                            <section className="bg-white p-4 lg:rounded-2xl lg:border lg:border-surface-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <Info className="w-5 h-5 text-primary-500" />
                                    <h2 className="text-sm font-bold text-primary-900">ສະຫຼຸບຄ່າໃຊ້ຈ່າຍ</h2>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-surface-500">ຄ່າເຊົ່າ</span>
                                        <span className="font-medium text-primary-900">{garment.rentalPrice.toLocaleString()} ₭</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-surface-500">📦 ຄ່າຈັດສົ່ງ</span>
                                        <span className="font-medium text-status-success">ຟຣີ</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-surface-500">✨ ຄ່າຊັກແຫ້ງ</span>
                                        <span className="font-medium text-status-success">ຟຣີ</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-surface-500">🧾 ຄ່າບໍລິການ</span>
                                        <span className="font-medium text-primary-900">{(deliveryFee + laundryFee).toLocaleString()} ₭</span>
                                    </div>
                                </div>

                                <div className="border-t border-surface-300 pt-3 mb-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-primary-900">✅ ຈ່າຍຕົວຈິງ</span>
                                        <span className="text-2xl font-extrabold text-accent-500">{totalPay.toLocaleString()} ₭</span>
                                    </div>
                                </div>

                                {/* Hold Amount */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                    <div className="flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-blue-700">
                                                🔒 ວົງເງິນປະກັນ (Hold) — ບໍ່ຕັດເງິນ
                                            </p>
                                            <p className="text-sm font-extrabold text-blue-600 mt-0.5">
                                                {garment.deposit.toLocaleString()} ₭
                                            </p>
                                            <p className="text-[10px] text-blue-500 mt-1">
                                                ແຄ່ລ໋ອກວົງເງິນ → ປົດລ໋ອກ ພາຍໃນ 1 ຊົ່ວໂມງ ຫຼັງ QC ຜ່ານ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ═══ DESKTOP CTA BUTTONS ═══ */}
                            <div className="hidden lg:block space-y-3 p-4 bg-white rounded-2xl border border-surface-300">
                                <Link
                                    href={`/checkout?garment=${garment.id}${sp.pickup ? `&pickup=${sp.pickup}` : ""}${sp.return ? `&return=${sp.return}` : ""}`}
                                    className="block w-full py-4 bg-accent-500 hover:bg-accent-600 text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-accent-500/20 text-center"
                                >
                                    {t("product.bookNow")} — {totalPay.toLocaleString()} ₭
                                </Link>
                                <div className="flex gap-3">
                                    <Link href="/sos" className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-100 hover:bg-surface-200 text-primary-900 font-medium rounded-xl transition-colors border border-surface-300">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm">ຊ່ວຍເຫຼືອ</span>
                                    </Link>
                                    <Link href="/account/bookings" className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-100 hover:bg-surface-200 text-primary-900 font-medium rounded-xl transition-colors border border-surface-300">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span className="text-sm">ຕະກ້າ</span>
                                    </Link>
                                </div>
                            </div>

                            {/* ═══ PARTNER INFO ═══ */}
                            {garment.shop && (
                                <section className="bg-white p-4 lg:rounded-2xl lg:border lg:border-surface-300">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                                                <Store className="w-6 h-6 text-accent-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary-900">Partner Store: MS-{garment.shopId.slice(-3).toUpperCase()}</p>
                                                <div className="flex items-center gap-2 text-xs text-surface-500 mt-0.5">
                                                    {garment.shop.isVerified && (
                                                        <span className="flex items-center gap-0.5 text-status-success">
                                                            <Shield className="w-3 h-3" /> ຢືນຢັນແລ້ວ
                                                        </span>
                                                    )}
                                                    {garment.shop.district && (
                                                        <span className="flex items-center gap-0.5 text-surface-400">
                                                            📍 ໂຊນ{garment.shop.district}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="px-4 py-2 bg-accent-50 text-accent-600 text-sm font-semibold rounded-lg">
                                            by MeeSai
                                        </span>
                                    </div>
                                </section>
                            )}

                            {/* ═══ TRUST BADGES ═══ */}
                            <section className="bg-white p-4 lg:rounded-2xl lg:border lg:border-surface-300">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-accent-50 rounded-xl p-3 border border-accent-100 text-center">
                                        <Shield className="w-6 h-6 text-accent-500 mx-auto mb-1.5" />
                                        <p className="text-[11px] font-bold text-primary-900">ບໍ່ໂອນມັດຈຳສົດ</p>
                                        <p className="text-[9px] text-surface-500 mt-0.5">ລະບົບລ໋ອກວົງເງິນ ປອດໄພ 100%</p>
                                    </div>
                                    <div className="bg-accent-50 rounded-xl p-3 border border-accent-100 text-center">
                                        <Truck className="w-6 h-6 text-accent-500 mx-auto mb-1.5" />
                                        <p className="text-[11px] font-bold text-primary-900">ສົ່ງຟຣີ ຮັບ-ສົ່ງຖືງທີ່</p>
                                        <p className="text-[9px] text-surface-500 mt-0.5">ບໍ່ຕ້ອງຂັບໄປຮັບເອງ</p>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-3 border border-green-100 text-center">
                                        <CheckCircle className="w-6 h-6 text-status-success mx-auto mb-1.5" />
                                        <p className="text-[11px] font-bold text-primary-900">ປະກັນ MeeSai</p>
                                        <p className="text-[9px] text-surface-500 mt-0.5">ຄຸ້ມຄອງຄວາມເສຍຫາຍ</p>
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-center">
                                        <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                                        <p className="text-[11px] font-bold text-primary-900">ຊັກແຫ້ງຟຣີ</p>
                                        <p className="text-[9px] text-surface-500 mt-0.5">ບໍ່ຕ້ອງຊັກເອງ</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════
                   SIMILAR PRODUCTS (Full Width Below)
                ══════════════════════════════════════════════════════ */}

                {/* Shop's Other Items */}
                {shopGarments.length > 0 && (
                    <section className="mt-8 px-4 lg:px-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-primary-900 flex items-center gap-2">
                                <Store className="w-5 h-5 text-accent-500" />
                                ສິນຄ້າອື່ນໆ ຈາກຮ້ານດຽວກັນ
                            </h2>
                            <Link href="/browse" className="text-accent-500 text-sm font-semibold flex items-center gap-0.5 hover:underline">
                                ເບິ່ງທັງໝົດ <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible">
                            {shopGarments.map((g) => {
                                const imgUrl = g.images[0]?.url || "/images/garments/gold-sequin-dress.png";
                                return (
                                    <Link
                                        key={g.id}
                                        href={`/browse/${g.id}`}
                                        className="min-w-[140px] max-w-[140px] lg:min-w-0 lg:max-w-none bg-white rounded-xl border border-surface-300 overflow-hidden card-hover group"
                                    >
                                        <div className="relative aspect-[3/4] bg-surface-100">
                                            <Image src={imgUrl} alt={g.titleLo} fill className="object-cover" sizes="(max-width: 1024px) 140px, 200px" />
                                        </div>
                                        <div className="p-2.5">
                                            <p className="text-xs font-medium text-primary-900 line-clamp-2 leading-tight mb-1.5 min-h-[32px]">
                                                {g.titleLo}
                                            </p>
                                            <p className="price-accent text-sm">
                                                {g.rentalPrice.toLocaleString()} ₭
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Similar Category Products */}
                {similarGarments.length > 0 && (
                    <section className="mt-8 px-4 lg:px-0">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-primary-900 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-pink-500" />
                                ສິນຄ້າທີ່ຄ້າຍກັນ
                            </h2>
                            <Link href="/browse" className="text-accent-500 text-sm font-semibold flex items-center gap-0.5 hover:underline">
                                ເບິ່ງທັງໝົດ <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 lg:grid lg:grid-cols-6 lg:overflow-visible">
                            {similarGarments.map((g) => {
                                const imgUrl = g.images[0]?.url || "/images/garments/gold-sequin-dress.png";
                                return (
                                    <Link
                                        key={g.id}
                                        href={`/browse/${g.id}`}
                                        className="min-w-[140px] max-w-[140px] lg:min-w-0 lg:max-w-none bg-white rounded-xl border border-surface-300 overflow-hidden card-hover group"
                                    >
                                        <div className="relative aspect-[3/4] bg-surface-100">
                                            <Image src={imgUrl} alt={g.titleLo} fill className="object-cover" sizes="(max-width: 1024px) 140px, 200px" />
                                        </div>
                                        <div className="p-2.5">
                                            <p className="text-[10px] text-accent-500 font-medium mb-0.5">{g.category.nameLo}</p>
                                            <p className="text-xs font-medium text-primary-900 line-clamp-2 leading-tight mb-1.5 min-h-[32px]">
                                                {g.titleLo}
                                            </p>
                                            <p className="price-accent text-sm">
                                                {g.rentalPrice.toLocaleString()} ₭
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

            {/* ══ MOBILE BOTTOM ACTION BAR ══ */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-300 shadow-xl lg:hidden">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/sos" className="flex flex-col items-center gap-0.5 px-3 text-surface-500 hover:text-accent-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-[10px] font-medium">ຊ່ວຍເຫຼືອ</span>
                    </Link>
                    <Link href="/account/bookings" className="flex flex-col items-center gap-0.5 px-3 text-surface-500 hover:text-accent-500 transition-colors border-r border-surface-300 pr-4">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="text-[10px] font-medium">ຕະກ້າ</span>
                    </Link>
                    <Link
                        href={`/checkout?garment=${garment.id}${sp.pickup ? `&pickup=${sp.pickup}` : ""}${sp.return ? `&return=${sp.return}` : ""}`}
                        className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 text-white font-bold text-base rounded-xl transition-colors shadow-lg shadow-accent-500/20 text-center"
                    >
                        {t("product.bookNow")} — {totalPay.toLocaleString()} ₭
                    </Link>
                </div>
            </div>
        </div>
    );
}
