import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import {
    Search,
    ShoppingBag,
    MessageCircle,
    ChevronRight,
    Flame,
    Clock,
    Star,
    Truck,
    Shield,
    Sparkles,
    Crown,
    Briefcase,
    Gem,
    Snowflake,
    Ticket,
    Heart,
    BadgePercent,
    ArrowRight,
    Home,
    Grid3X3,
    Play,
    Bell,
    User,
    CalendarDays,
    Ruler,
} from "lucide-react";

// ═══════════════════════════════════════════════════
// MeeSai Marketplace Edition — Landing Page
// Server Component — Real data from DB
// ═══════════════════════════════════════════════════

export default async function HomePage() {
    const t = await getTranslations();

    // ── Fetch real garments from DB ──
    const featuredGarments = await prisma.garment.findMany({
        where: { status: "AVAILABLE", isFeatured: true },
        include: { images: true, category: true },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    const latestGarments = await prisma.garment.findMany({
        where: { status: "AVAILABLE" },
        include: { images: true, category: true, shop: { select: { nameLo: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ══════════════════════════════════════════════
          1. STICKY HEADER
          ══════════════════════════════════════════════ */}

            {/* Top Promo Bar */}
            <div className="bg-accent-500 text-white text-xs py-1.5 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap flex gap-12">
                    <span>🚚 ສ່ງຟຣີທົ່ວວຽງຈັນ</span>
                    <span>🛡️ ຮັບປະກັນຄວາມເສຍຫາຍວົງເງິນ 1 ລ້ານກີບ</span>
                    <span>✨ ຊັກແຫ້ງມາດຕະຖານໂຮງແຮມ ຟຣີ</span>
                    <span>🚚 ສ່ງຟຣີທົ່ວວຽງຈັນ</span>
                    <span>🛡️ ຮັບປະກັນຄວາມເສຍຫາຍວົງເງິນ 1 ລ້ານກີບ</span>
                    <span>✨ ຊັກແຫ້ງມາດຕະຖານໂຮງແຮມ ຟຣີ</span>
                </div>
            </div>

            {/* Main Header */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5 shrink-0">
                        <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-extrabold text-sm">M</span>
                        </div>
                        <span className="text-lg font-extrabold text-primary-900 hidden sm:block">
                            {t("common.appName")}
                        </span>
                    </Link>

                    {/* Search Bar — functional form */}
                    <form className="flex-1 relative" action="/browse" method="GET">
                        <div className="flex items-center bg-surface-200 rounded-lg border-2 border-accent-500 overflow-hidden">
                            <div className="flex-1 flex items-center px-3 py-2">
                                <Search className="w-4 h-4 text-surface-500 mr-2 shrink-0" />
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="🔍 ຫາງານດອງ?... ຕີມສີຊົມພູ?... ຫຼືຊຸດແບຣນເນມ?"
                                    className="w-full bg-transparent text-sm text-primary-900 placeholder:text-surface-500 outline-none"
                                />
                            </div>
                            <button type="submit" className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white transition-colors">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </form>

                    {/* Right Icons */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Link href="/account/bookings" className="relative p-2 hover:bg-surface-100 rounded-lg transition-colors">
                            <ShoppingBag className="w-5 h-5 text-primary-900" />
                        </Link>
                        <Link href="/sos" className="relative p-2 hover:bg-surface-100 rounded-lg transition-colors">
                            <MessageCircle className="w-5 h-5 text-primary-900" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════
          2. HERO CAROUSEL BANNER
          ══════════════════════════════════════════════ */}
            <section className="relative">
                {/* Banner */}
                <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
                    <Image
                        src="/images/banners/hero.png"
                        alt="MeeSai Fashion Boutique"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-900/75 to-primary-800/70" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center px-6" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.4)' }}>
                            <p className="text-accent-400 text-sm font-semibold mb-2 tracking-wider uppercase">
                                Fashion Bank of Laos
                            </p>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold !text-white mb-3 leading-tight" style={{ color: 'white' }}>
                                {t("landing.hero.title")}
                            </h1>
                            <p className="!text-white/90 text-sm sm:text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                {t("landing.hero.subtitle")}
                            </p>
                        </div>
                    </div>
                    {/* Decorative */}
                    <div className="absolute -bottom-1 left-0 right-0 h-6 bg-surface-150 rounded-t-3xl" />
                </div>

                {/* Floating Date Filter Bar — links to browse */}
                <div className="relative -mt-8 mx-4 sm:mx-auto max-w-2xl bg-white rounded-2xl shadow-xl p-4 border border-surface-300">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full flex items-center gap-2 px-3 py-2.5 bg-surface-100 rounded-xl border border-surface-300">
                            <CalendarDays className="w-5 h-5 text-accent-500 shrink-0" />
                            <span className="text-sm text-surface-500">ເລືອກວັນໃຊ້ງານ</span>
                        </div>
                        <div className="flex-1 w-full flex items-center gap-2 px-3 py-2.5 bg-surface-100 rounded-xl border border-surface-300">
                            <Ruler className="w-5 h-5 text-accent-500 shrink-0" />
                            <span className="text-sm text-surface-500">ໄຊສ໌</span>
                        </div>
                        <Link
                            href="/browse"
                            className="w-full sm:w-auto px-6 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20"
                        >
                            <Search className="w-4 h-4" />
                            <span>ເຊັກຂອງວ່າງ</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
          2.5 TRUST STRIP — Service Lock-in
          ══════════════════════════════════════════════ */}
            <section className="mt-4 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                        {[
                            { icon: "🔒", text: "ບໍ່ໂອນມັດຈຳສົດ" },
                            { icon: "🚚", text: "ສົ່ງຟຣີ ຮັບ-ສົ່ງຖືງທີ່" },
                            { icon: "🛡️", text: "ປະກັນ MeeSai" },
                            { icon: "✨", text: "ຊັກແຫ້ງຟຣີ" },
                        ].map((item) => (
                            <div key={item.text} className="flex items-center gap-1.5 bg-accent-50 border border-accent-100 rounded-full px-3 py-1.5 shrink-0">
                                <span className="text-sm">{item.icon}</span>
                                <span className="text-[11px] font-semibold text-accent-700 whitespace-nowrap">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
          3. ICON MENU (Categories)
          ══════════════════════════════════════════════ */}
            <section className="mt-6 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                        {[
                            { icon: Flame, label: "Flash Rent", color: "text-flash", href: "/browse" },
                            { icon: Heart, label: "Wedding", color: "text-pink-500", href: "/browse?theme=WEDDING" },
                            { icon: Sparkles, label: "Gala/Party", color: "text-purple-500", href: "/browse?theme=GALA" },
                            { icon: Crown, label: "Traditional", color: "text-amber-600", href: "/browse?theme=TEMPLE" },
                            { icon: Briefcase, label: "Men Suits", color: "text-primary-700", href: "/browse?category=suit" },
                            { icon: Gem, label: "Brandname", color: "text-emerald-500", href: "/browse" },
                            { icon: ShoppingBag, label: "Bags/Shoes", color: "text-rose-500", href: "/browse" },
                            { icon: Snowflake, label: "Winter", color: "text-sky-500", href: "/browse" },
                            { icon: Ticket, label: "Coupons", color: "text-orange-500", href: "/browse" },
                            { icon: BadgePercent, label: "MeeSai Mall", color: "text-accent-500", href: "/browse" },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex flex-col items-center gap-1.5 min-w-[64px] group"
                            >
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-surface-300 flex items-center justify-center group-hover:shadow-md group-hover:border-accent-500/30 transition-all">
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <span className="text-[11px] font-medium text-primary-900 text-center leading-tight whitespace-nowrap">
                                    {item.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
          4. FLASH RENT ZONE — Real Featured Garments
          ══════════════════════════════════════════════ */}
            <section className="mt-6 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-flash px-3 py-1 rounded-lg">
                                <Flame className="w-4 h-4 text-white" fill="white" />
                                <span className="text-white text-sm font-extrabold tracking-wide">
                                    FLASH RENT
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-primary-900">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-mono font-bold">
                                    02:15:40
                                </span>
                            </div>
                        </div>
                        <Link
                            href="/browse"
                            className="flex items-center gap-1 text-accent-500 text-sm font-semibold hover:underline"
                        >
                            ເບິ່ງທັງໝົດ
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Flash Products Scroll — Real data */}
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        {featuredGarments.map((garment) => {
                            const flashPrice = Math.round(garment.rentalPrice * 0.2);
                            const discount = Math.round((1 - flashPrice / garment.rentalPrice) * 100);
                            const imgUrl = garment.images[0]?.url || "/images/garments/gold-sequin-dress.png";
                            return (
                                <Link
                                    key={garment.id}
                                    href={`/browse/${garment.id}`}
                                    className="min-w-[140px] max-w-[140px] bg-white rounded-xl border border-surface-300 overflow-hidden card-hover group"
                                >
                                    {/* Image */}
                                    <div className="relative h-[180px] bg-surface-100">
                                        <Image src={imgUrl} alt={garment.titleLo} fill className="object-cover" sizes="140px" />
                                        <span className="absolute top-2 left-2 badge-flash">
                                            -{discount}%
                                        </span>
                                    </div>
                                    <div className="p-2.5">
                                        <p className="text-xs text-primary-900 font-medium line-clamp-2 mb-1.5 leading-tight">
                                            {garment.titleLo}
                                        </p>
                                        <p className="price-accent text-base">
                                            {flashPrice.toLocaleString()} ₭
                                        </p>
                                        <p className="price-original">
                                            {garment.rentalPrice.toLocaleString()} ₭
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
          5. DAILY DISCOVER — Real Garments from DB
          ══════════════════════════════════════════════ */}
            <section className="mt-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Tabs — linked to browse */}
                    <div className="flex items-center gap-1 bg-white rounded-xl p-1 mb-4 shadow-sm border border-surface-300 overflow-x-auto scrollbar-hide">
                        {[
                            { label: "ແນະນຳ", href: "/browse?sort=recommended", active: true },
                            { label: "ຍອດນິຍົມ", href: "/browse?sort=popular", active: false },
                            { label: "ມາໃໝ່", href: "/browse?sort=newest", active: false },
                            { label: "ຣີວິວ 5 ດາວ", href: "/browse", active: false },
                        ].map((tab) => (
                            <Link
                                key={tab.label}
                                href={tab.href}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${tab.active
                                    ? "bg-accent-500 text-white shadow-sm"
                                    : "text-surface-500 hover:text-primary-900 hover:bg-surface-100"
                                    }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>

                    {/* Product Grid — Real data */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {latestGarments.map((garment, i) => {
                            const imgUrl = garment.images[0]?.url || "/images/garments/gold-sequin-dress.png";
                            return (
                                <Link
                                    key={garment.id}
                                    href={`/browse/${garment.id}`}
                                    className="bg-white rounded-xl border border-surface-300 overflow-hidden card-hover group animate-fade-in"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[3/4] bg-surface-100">
                                        <Image src={imgUrl} alt={garment.titleLo} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                                        {/* Category Badge */}
                                        <span className="absolute top-2 left-2 badge-available text-[10px]">
                                            {garment.category.nameLo}
                                        </span>
                                        {/* Free Tags */}
                                        <div className="absolute bottom-2 left-2 flex gap-1">
                                            <span className="badge-free text-[10px]">🏷️ ສ່ງຟຣີ</span>
                                            <span className="badge-free text-[10px]">🏷️ ຊັກຟຣີ</span>
                                        </div>
                                        {garment.isFeatured && (
                                            <span className="absolute top-2 right-2 bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                                                ⭐
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-2.5">
                                        <p className="text-[10px] text-accent-500 font-medium mb-0.5">
                                            {garment.shop?.nameLo || "MeeSai"}
                                        </p>
                                        <h3 className="text-xs font-medium text-primary-900 line-clamp-2 leading-tight mb-2 min-h-[32px]">
                                            {garment.titleLo}
                                        </h3>
                                        {/* Price */}
                                        <div className="mb-1.5">
                                            <span className="price-accent text-base">
                                                {garment.rentalPrice.toLocaleString()} ₭
                                            </span>
                                        </div>
                                        {/* Social Proof */}
                                        <div className="flex items-center gap-2 text-[11px] text-surface-500">
                                            <span className="flex items-center gap-0.5">
                                                <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                                                5.0
                                            </span>
                                            <span className="ml-auto text-primary-400">📍 ວຽງຈັນ</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Load More → Browse page */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/browse"
                            className="inline-flex items-center px-8 py-3 bg-white border-2 border-accent-500 text-accent-500 font-bold rounded-xl hover:bg-accent-50 transition-colors"
                        >
                            ເບິ່ງເພີ່ມເຕີມ
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
          6. TRUST SECTION
          ══════════════════════════════════════════════ */}
            <section className="mt-10 px-4 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl p-6 border border-surface-300 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Shield className="w-6 h-6 text-accent-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary-900">
                                        ຮັບປະກັນຄວາມເສຍຫາຍ
                                    </p>
                                    <p className="text-xs text-surface-500">
                                        ຄວາມເສຍຫາຍ 1 ລ້ານກີບ
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Truck className="w-6 h-6 text-accent-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary-900">
                                        ສ່ງຟຣີ ທົ່ວນະຄອນຫຼວງ
                                    </p>
                                    <p className="text-xs text-surface-500">
                                        ຮັບ-ສ່ງ ເຖິງໜ້າບ້ານ
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-accent-50 rounded-xl flex items-center justify-center shrink-0">
                                    <Sparkles className="w-6 h-6 text-accent-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary-900">
                                        ຊັກແຫ້ງ ມາດຕະຖານ 5 ດາວ
                                    </p>
                                    <p className="text-xs text-surface-500">
                                        ຊັກ-ອົບ-ຂ້າເຊື້ອ ທຸກຊຸດ
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
          7. BOTTOM NAVIGATION (Mobile)
          ══════════════════════════════════════════════ */}
            <nav className="bottom-nav sm:hidden">
                <div className="flex items-center justify-around py-1.5 px-2">
                    {[
                        { icon: Home, label: "ໜ້າຫຼັກ", href: "/", active: true },
                        { icon: Grid3X3, label: "ໝວດໝູ່", href: "/browse", active: false },
                        { icon: Play, label: "Feed", href: "/browse", active: false },
                        { icon: Bell, label: "ແຈ້ງເຕືອນ", href: "/account", active: false },
                        { icon: User, label: "ຂ້ອຍ", href: "/account", active: false },
                    ].map((item) => (
                        <Link key={item.label} href={item.href} className={`bottom-nav-item ${item.active ? "active" : ""}`}>
                            <item.icon className="w-5 h-5" fill={item.active ? "currentColor" : "none"} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* ══════════════════════════════════════════════
          8. FLOATING SUPPORT BUTTON
          ══════════════════════════════════════════════ */}
            <Link href="/sos" className="fixed bottom-20 sm:bottom-6 right-4 w-14 h-14 bg-status-success hover:bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 transition-transform hover:scale-110">
                <MessageCircle className="w-6 h-6" fill="white" />
            </Link>
        </div>
    );
}
