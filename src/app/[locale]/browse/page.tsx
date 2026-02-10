import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import {
    Search,
    SlidersHorizontal,
    Star,
    ShoppingBag,
    ChevronRight,
    Flame,
    Home,
    Grid3X3,
    Play,
    Bell,
    User,
    MessageCircle,
    Camera,
    CalendarX,
    Shield,
    Sparkles,
} from "lucide-react";
import DateRangeFilter from "@/components/DateRangeFilter";

type Props = {
    searchParams: Promise<{
        pickup?: string;
        return?: string;
        theme?: string;
        bodyType?: string;
        category?: string;
        sort?: string;
        q?: string;
    }>;
};

// ConditionGrade badge colors
const gradeColors: Record<string, { bg: string; text: string; label: string }> = {
    A_PLUS: { bg: "bg-emerald-100", text: "text-emerald-700", label: "A+" },
    A: { bg: "bg-green-100", text: "text-green-700", label: "A" },
    B: { bg: "bg-amber-100", text: "text-amber-700", label: "B" },
    C: { bg: "bg-red-100", text: "text-red-700", label: "C" },
};

// Theme labels (Lao)
const themeLabels: Record<string, string> = {
    WEDDING: "💒 ງານດອງ",
    TEMPLE: "🙏 ງານບຸນ",
    GALA: "✨ ງານລາຕຣີ",
    BRIDAL_PARTY: "👰 ເພື່ອນເຈົ້າສາວ",
    GRADUATION: "🎓 ຮັບປະລິນຍາ",
    BUSINESS: "💼 ທຸລະກິດ",
    COSTUME: "🎭 ຄອສຕູມ",
    OTHER: "📌 ອື່ນໆ",
};

// Body type labels (Lao)
const bodyTypeLabels: Record<string, string> = {
    STANDARD: "👤 ມາດຕະຖານ",
    CURVY: "💃 ສາວອວບ",
    PETITE: "🌸 ຕົວນ້ອຍ",
    TALL: "📏 ຕົວສູງ",
    PLUS_SIZE: "🌟 ໄຊສ໌ໃຫຍ່",
};

export default async function BrowsePage({ searchParams }: Props) {
    const t = await getTranslations();
    const params = await searchParams;

    const pickupStr = params.pickup;
    const returnStr = params.return;
    const themeFilter = params.theme;
    const bodyFilter = params.bodyType;
    const categoryFilter = params.category;
    const sortBy = params.sort || "recommended";
    const searchQuery = params.q;

    const pickupDate = pickupStr ? new Date(pickupStr) : null;
    const returnDate = returnStr ? new Date(returnStr) : null;
    const hasDates = pickupDate && returnDate;

    // Fetch categories
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

    // Build garment WHERE clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Only show AVAILABLE or RESERVED (not DRAFT/RETIRED/MAINTENANCE)
    where.status = { in: ["AVAILABLE", "RESERVED", "RENTED"] };

    if (categoryFilter) {
        where.categoryId = categoryFilter;
    }

    if (themeFilter) {
        where.eventThemes = { has: themeFilter };
    }

    if (bodyFilter) {
        where.bodyTypes = { has: bodyFilter };
    }

    if (searchQuery) {
        where.OR = [
            { titleLo: { contains: searchQuery, mode: "insensitive" } },
            { titleEn: { contains: searchQuery, mode: "insensitive" } },
            { code: { contains: searchQuery, mode: "insensitive" } },
        ];
    }

    // Sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "priceAsc") orderBy = { rentalPrice: "asc" };
    if (sortBy === "priceDesc") orderBy = { rentalPrice: "desc" };
    if (sortBy === "popular") orderBy = { totalRentals: "desc" };

    // Fetch ALL garments (we'll mark unavailable ones in-place)
    const allGarments = await prisma.garment.findMany({
        where,
        include: {
            category: true,
            images: true,
            shop: { select: { nameLo: true, nameEn: true } },
            bookings: hasDates
                ? {
                    where: {
                        status: { notIn: ["CANCELLED", "COMPLETED"] },
                        // Overlap check: booking's pickup-bufferEnd overlaps with requested pickup-return
                        pickupDate: { lte: returnDate },
                        bufferEnd: { gte: pickupDate },
                    },
                    select: { id: true },
                }
                : false,
        },
        orderBy,
        take: 30,
    });

    // Separate available vs sold-out
    const available = allGarments.filter(
        (g) => !hasDates || !g.bookings || (g.bookings as { id: string }[]).length === 0
    );
    const soldOut = hasDates
        ? allGarments.filter(
            (g) => g.bookings && (g.bookings as { id: string }[]).length > 0
        )
        : [];

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
                    <Link href="/" className="shrink-0">
                        <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-extrabold text-sm">M</span>
                        </div>
                    </Link>
                    <form className="flex-1 relative" action="/browse" method="GET">
                        {/* Preserve existing params */}
                        {pickupStr && <input type="hidden" name="pickup" value={pickupStr} />}
                        {returnStr && <input type="hidden" name="return" value={returnStr} />}
                        <div className="flex items-center bg-surface-200 rounded-lg border-2 border-accent-500 overflow-hidden">
                            <div className="flex-1 flex items-center px-3 py-2">
                                <Search className="w-4 h-4 text-surface-500 mr-2 shrink-0" />
                                <input
                                    type="text"
                                    name="q"
                                    defaultValue={searchQuery || ""}
                                    placeholder={t("browse.searchPlaceholder")}
                                    className="w-full bg-transparent text-sm text-primary-900 placeholder:text-surface-500 outline-none"
                                />
                            </div>
                            <button type="button" className="px-3 py-2 hover:bg-surface-300 transition-colors border-l border-surface-300">
                                <Camera className="w-4 h-4 text-surface-500" />
                            </button>
                            <button type="submit" className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                    <button className="relative p-2 hover:bg-surface-100 rounded-lg shrink-0">
                        <ShoppingBag className="w-5 h-5 text-primary-900" />
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-flash text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            0
                        </span>
                    </button>
                </div>
            </header>

            {/* ═══ GLOBAL DATE FILTER (STICKY) ═══ */}
            <Suspense fallback={<div className="h-12 bg-surface-100 animate-pulse" />}>
                <DateRangeFilter />
            </Suspense>

            {/* ── Category Filter Chips ── */}
            <section className="px-4 py-3 bg-white border-b border-surface-300">
                <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <Link
                        href={`/browse?${new URLSearchParams({ ...(pickupStr ? { pickup: pickupStr } : {}), ...(returnStr ? { return: returnStr } : {}) }).toString()}`}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap ${!categoryFilter ? "bg-accent-500 text-white" : "bg-surface-100 text-primary-900 border border-surface-300"
                            }`}
                    >
                        <Flame className="w-3 h-3" />
                        {t("browse.allCategories")}
                    </Link>
                    {categories.map((cat) => {
                        const isActive = categoryFilter === cat.id;
                        const catParams = new URLSearchParams({
                            ...(pickupStr ? { pickup: pickupStr } : {}),
                            ...(returnStr ? { return: returnStr } : {}),
                            category: cat.id,
                        });
                        return (
                            <Link
                                key={cat.id}
                                href={`/browse?${catParams.toString()}`}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${isActive
                                    ? "bg-accent-500 text-white"
                                    : "bg-surface-100 hover:bg-accent-50 text-primary-900 border border-surface-300 hover:border-accent-500/30"
                                    }`}
                            >
                                {cat.nameLo}
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* ── Theme & Body Type Filter ── */}
            <section className="px-4 py-2 bg-surface-50 border-b border-surface-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                        <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider shrink-0">Theme:</span>
                        {Object.entries(themeLabels).map(([key, label]) => {
                            const isActive = themeFilter === key;
                            const themeParams = new URLSearchParams({
                                ...(pickupStr ? { pickup: pickupStr } : {}),
                                ...(returnStr ? { return: returnStr } : {}),
                                ...(categoryFilter ? { category: categoryFilter } : {}),
                                ...(isActive ? {} : { theme: key }),
                            });
                            return (
                                <Link
                                    key={key}
                                    href={`/browse?${themeParams.toString()}`}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${isActive
                                        ? "bg-primary-900 text-white"
                                        : "bg-white text-surface-600 border border-surface-300 hover:border-primary-900/30"
                                        }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mt-1.5">
                        <span className="text-[10px] font-bold text-surface-500 uppercase tracking-wider shrink-0">Body:</span>
                        {Object.entries(bodyTypeLabels).map(([key, label]) => {
                            const isActive = bodyFilter === key;
                            const bodyParams = new URLSearchParams({
                                ...(pickupStr ? { pickup: pickupStr } : {}),
                                ...(returnStr ? { return: returnStr } : {}),
                                ...(categoryFilter ? { category: categoryFilter } : {}),
                                ...(themeFilter ? { theme: themeFilter } : {}),
                                ...(isActive ? {} : { bodyType: key }),
                            });
                            return (
                                <Link
                                    key={key}
                                    href={`/browse?${bodyParams.toString()}`}
                                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${isActive
                                        ? "bg-primary-900 text-white"
                                        : "bg-white text-surface-600 border border-surface-300 hover:border-primary-900/30"
                                        }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Sort & Results Count ── */}
            <section className="px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <p className="text-sm text-surface-500">
                        <span className="font-bold text-primary-900">{available.length}</span>{" "}
                        {t("browse.results")}
                        {soldOut.length > 0 && (
                            <span className="text-xs text-surface-400 ml-1">
                                ({soldOut.length} ຕິດຈອງ)
                            </span>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        {[
                            { key: "recommended", label: "ແນະນຳ" },
                            { key: "priceAsc", label: "ລາຄາ ↑" },
                            { key: "priceDesc", label: "ລາຄາ ↓" },
                            { key: "popular", label: "ນິຍົມ" },
                        ].map((s) => {
                            const sortParams = new URLSearchParams({
                                ...(pickupStr ? { pickup: pickupStr } : {}),
                                ...(returnStr ? { return: returnStr } : {}),
                                ...(categoryFilter ? { category: categoryFilter } : {}),
                                ...(themeFilter ? { theme: themeFilter } : {}),
                                ...(bodyFilter ? { bodyType: bodyFilter } : {}),
                                sort: s.key,
                            });
                            return (
                                <Link
                                    key={s.key}
                                    href={`/browse?${sortParams.toString()}`}
                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${sortBy === s.key
                                        ? "bg-accent-500 text-white"
                                        : "bg-white text-surface-500 hover:text-primary-900 border border-surface-300"
                                        }`}
                                >
                                    {s.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══ AVAILABLE PRODUCTS GRID ═══ */}
            <section className="px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {available.map((garment) => {
                        const grade = gradeColors[garment.conditionGrade] || gradeColors.A;
                        return (
                            <Link
                                key={garment.id}
                                href={`/browse/${garment.id}${hasDates ? `?pickup=${pickupStr}&return=${returnStr}` : ""}`}
                                className="bg-white rounded-xl border border-surface-300 overflow-hidden card-hover group animate-fade-in"
                            >
                                {/* Image */}
                                <div className="relative aspect-[3/4] bg-surface-100">
                                    {garment.images[0] ? (
                                        <Image src={garment.images[0].url} alt={garment.titleLo} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-b from-surface-100 to-surface-200" />
                                    )}
                                    {garment.isFeatured && (
                                        <span className="absolute top-2 left-2 bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                                            ⭐ ແນະນຳ
                                        </span>
                                    )}
                                    {/* Condition Grade Badge */}
                                    <span className={`absolute top-2 right-2 ${grade.bg} ${grade.text} text-[10px] font-bold px-1.5 py-0.5 rounded z-10`}>
                                        {grade.label}
                                    </span>
                                    {/* Available badge */}
                                    <span className="absolute bottom-2 left-2 badge-available text-[10px] flex items-center gap-0.5">
                                        <Shield className="w-2.5 h-2.5" /> ວ່າງ
                                    </span>
                                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-accent-500 hover:bg-accent-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-lg font-bold leading-none">+</span>
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="p-2.5">
                                    <p className="text-[11px] text-accent-500 font-medium mb-0.5">
                                        {garment.category.nameLo}
                                    </p>
                                    <h3 className="text-xs font-medium text-primary-900 line-clamp-2 leading-tight mb-1.5 min-h-[32px]">
                                        {garment.titleLo}
                                    </h3>
                                    {/* Event Theme Tags */}
                                    {garment.eventThemes.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-1.5">
                                            {garment.eventThemes.slice(0, 2).map((theme) => (
                                                <span key={theme} className="text-[9px] bg-primary-900/5 text-primary-900/70 px-1.5 py-0.5 rounded-full">
                                                    {themeLabels[theme]?.split(" ")[0]}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mb-1.5">
                                        <span className="price-accent text-base">
                                            {garment.rentalPrice.toLocaleString()} ₭
                                        </span>
                                        <span className="text-[10px] text-surface-400 ml-1">/ຄັ້ງ</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-surface-500">
                                        <span className="flex items-center gap-0.5">
                                            <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                                            5.0
                                        </span>
                                        <span>|</span>
                                        <span>{garment.size}</span>
                                        {garment.shop && (
                                            <span className="ml-auto truncate max-w-[80px]">
                                                🏪 {garment.shop.nameLo}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Empty State */}
                    {available.length === 0 && soldOut.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <ShoppingBag className="w-16 h-16 text-surface-400 mx-auto mb-4" />
                            <p className="text-lg font-bold text-primary-900">
                                {t("browse.noResults")}
                            </p>
                            <p className="text-surface-500 text-sm mt-1">
                                ລອງປ່ຽນໝວດໝູ່ ຫຼື ຄຳຄົ້ນຫາ
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ SOLD OUT FOR YOUR DATE (greyed out) ═══ */}
            {soldOut.length > 0 && (
                <section className="px-4 mt-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarX className="w-4 h-4 text-surface-400" />
                            <p className="text-sm font-bold text-surface-400">
                                ຕິດຈອງໃນວັນທີ່ເລືອກ ({soldOut.length})
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 opacity-50">
                            {soldOut.map((garment) => (
                                <div
                                    key={garment.id}
                                    className="bg-white rounded-xl border border-surface-300 overflow-hidden relative"
                                >
                                    {/* Sold Out Overlay */}
                                    <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                                        <span className="bg-surface-800/80 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                            ❌ ຕິດຈອງ
                                        </span>
                                    </div>
                                    {/* Image */}
                                    <div className="aspect-[3/4] bg-surface-100 grayscale relative">
                                        {garment.images[0] ? (
                                            <Image src={garment.images[0].url} alt={garment.titleLo} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-b from-surface-100 to-surface-200" />
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="p-2.5">
                                        <p className="text-[11px] text-surface-400 font-medium mb-0.5">
                                            {garment.category.nameLo}
                                        </p>
                                        <h3 className="text-xs font-medium text-surface-400 line-clamp-2 leading-tight mb-2 min-h-[32px]">
                                            {garment.titleLo}
                                        </h3>
                                        <span className="text-sm font-bold text-surface-400">
                                            {garment.rentalPrice.toLocaleString()} ₭
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Load More ── */}
            {available.length > 0 && (
                <div className="mt-6 text-center">
                    <button className="px-8 py-3 bg-white border-2 border-accent-500 text-accent-500 font-bold rounded-xl hover:bg-accent-50 transition-colors">
                        {t("browse.loadMore")}
                        <ChevronRight className="w-4 h-4 inline-block ml-1" />
                    </button>
                </div>
            )}

            {/* ── Bottom Navigation ── */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-300 shadow-lg sm:hidden">
                <div className="flex items-center justify-around py-1.5 px-2">
                    {[
                        { icon: Home, label: "ໜ້າຫຼັກ", active: false, href: "/" },
                        { icon: Grid3X3, label: "ໝວດໝູ່", active: true, href: "/browse" },
                        { icon: Play, label: "Feed", active: false, href: "/" },
                        { icon: Bell, label: "ແຈ້ງເຕືອນ", active: false, href: "/" },
                        { icon: User, label: "ຂ້ອຍ", active: false, href: "/account" },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-colors ${item.active ? "text-accent-500" : "text-surface-500"
                                }`}
                        >
                            <item.icon className="w-5 h-5" fill={item.active ? "currentColor" : "none"} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* ── Support FAB ── */}
            <Link href="/sos" className="fixed bottom-20 sm:bottom-6 right-4 w-14 h-14 bg-status-success hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 transition-transform hover:scale-110">
                <MessageCircle className="w-6 h-6" fill="white" />
            </Link>
        </div>
    );
}
