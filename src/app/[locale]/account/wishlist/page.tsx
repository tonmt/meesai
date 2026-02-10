import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
    ArrowLeft,
    Heart,
    Star,
    ShoppingBag,
} from "lucide-react";
import RemoveWishlistButton from "@/components/RemoveWishlistButton";

export default async function WishlistPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const t = await getTranslations();

    const wishlists = await prisma.wishlist.findMany({
        where: { userId: session.user.id },
        include: {
            garment: {
                include: { images: { take: 1 }, category: true, shop: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-surface-150 pb-20">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/account" className="p-1 hover:bg-surface-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-primary-900" />
                    </Link>
                    <h1 className="font-bold text-primary-900">Favorite ({wishlists.length})</h1>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4">
                {wishlists.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {wishlists.map((w) => (
                            <div
                                key={w.id}
                                className="bg-white rounded-xl border border-surface-300 overflow-hidden card-hover group relative"
                            >
                                {/* Remove btn */}
                                <RemoveWishlistButton garmentId={w.garmentId} userId={session.user.id} />

                                {/* ❤️ Heart */}
                                < div className="absolute top-2 left-2 z-10" >
                                    <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                                </div>

                                {/* Image */}
                                <Link href={`/browse/${w.garment.id}`}>
                                    <div className="aspect-[3/4] bg-gradient-to-b from-surface-100 to-surface-200">
                                        {w.garment.status === "AVAILABLE" && (
                                            <span className="absolute bottom-2 left-2 badge-available text-[10px]">✅ ວ່າງ</span>
                                        )}
                                        {w.garment.status === "RENTED" && (
                                            <span className="absolute bottom-2 left-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                                🔴 ມີຄົນເຊົ່າ
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="p-2.5">
                                    <p className="text-[11px] text-accent-500 font-medium mb-0.5">
                                        {w.garment.category.nameLo}
                                    </p>
                                    <h3 className="text-xs font-medium text-primary-900 line-clamp-2 leading-tight mb-2 min-h-[32px]">
                                        {w.garment.titleLo}
                                    </h3>
                                    <div className="mb-1.5">
                                        <span className="price-accent text-base">
                                            {w.garment.rentalPrice.toLocaleString()} ₭
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-surface-500">
                                        <span className="flex items-center gap-0.5">
                                            <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                                            5.0
                                        </span>
                                        <span className="ml-auto truncate max-w-[80px]">
                                            🏪 {w.garment.shop?.nameLo}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Heart className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                        <p className="font-bold text-primary-900 text-lg">ບໍ່ມີລາຍການທີ່ມັກ</p>
                        <p className="text-surface-500 text-sm mt-1">
                            ກົດ ❤️ ທີ່ຊຸດທີ່ມັກ ແລ້ວມາດູໄດ້ທີ່ນີ້
                        </p>
                        <Link
                            href="/browse"
                            className="inline-block mt-4 px-6 py-2.5 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-colors"
                        >
                            ເລືອກຊຸດ
                        </Link>
                    </div>
                )
                }
            </div >
        </div >
    );
}
