import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    ArrowLeft,
    Camera,
    CheckCircle,
    AlertCircle,
    Package,
    Upload,
    Shield,
    Shirt,
    ChevronRight,
    Eye,
} from "lucide-react";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PreReturnPage({ params }: Props) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) redirect("/login");

    const booking = await prisma.booking.findUnique({
        where: { id, renterId: session.user.id as string },
        include: {
            garment: {
                select: {
                    titleLo: true,
                    code: true,
                    conditionGrade: true,
                    defectNotes: true,
                    images: { take: 1 },
                },
            },
        },
    });

    if (!booking) notFound();

    const checklist = [
        { icon: "👗", label: "ຊຸດຄົບ ບໍ່ຂາດ?", desc: "ກວດນັບ ເສື້ອ/ກະໂປ່ງ/ສະໄບ/ເຂັມຂັດ ທຸກຊິ້ນ", done: false },
        { icon: "🧵", label: "ບໍ່ມີຮອຍຊີກ?", desc: "ກວດ ຕະແກ, ຊິບ, ກະດຸມ", done: false },
        { icon: "☕", label: "ບໍ່ມີຮອຍເປື້ອນ?", desc: "ກວດ ຫົວ/ແຂນ/ຊາຍ", done: false },
        { icon: "👃", label: "ບໍ່ມີກິ່ນ?", desc: "ເຊັ່ນ ນ້ຳຫອມ, ກິ່ນເຫື່ອ, ກິ່ນກາເຟ", done: false },
        { icon: "📦", label: "ໃສ່ກ່ອງ/ຖົງ ກຽມສົ່ງ?", desc: "ໃຊ້ Return Kit ທີ່ແຖມມາ", done: false },
    ];

    return (
        <div className="min-h-screen bg-surface-150 pb-12">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href={`/account/bookings/${id}`} className="p-1 hover:bg-surface-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-primary-900" />
                    </Link>
                    <div>
                        <h1 className="font-bold text-primary-900 text-sm">ກວດກ່ອນສົ່ງຄືນ</h1>
                        <p className="text-[10px] text-surface-500">Self-Check → ຖ່າຍຮູບ → ສົ່ງ</p>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {/* ═══ GARMENT INFO ═══ */}
                <div className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-surface-200 rounded-xl flex items-center justify-center">
                            <Shirt className="w-6 h-6 text-surface-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary-900">{booking.garment.titleLo}</p>
                            <p className="text-xs text-surface-500">{booking.garment.code}</p>
                            <p className="text-xs text-surface-500 mt-0.5">
                                ຄືນກ່ອນ: {booking.returnDate.toLocaleDateString("lo-LA", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ═══ SELF-CHECK CHECKLIST ═══ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-5 h-5 text-accent-500" />
                        <h2 className="text-sm font-bold text-primary-900">Checklist ກວດກ່ອນສົ່ງ</h2>
                    </div>

                    <div className="space-y-3">
                        {checklist.map((item, i) => (
                            <label
                                key={i}
                                className="flex items-start gap-3 p-3 bg-surface-50 border border-surface-200 rounded-xl cursor-pointer hover:border-accent-500/30 transition-colors"
                            >
                                <input type="checkbox" className="mt-1 accent-accent-500 w-4 h-4" />
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-primary-900">{item.icon} {item.label}</p>
                                    <p className="text-[10px] text-surface-500 mt-0.5">{item.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>

                {/* ═══ PHOTO UPLOAD ═══ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Camera className="w-5 h-5 text-accent-500" />
                        <h2 className="text-sm font-bold text-primary-900">📸 ຖ່າຍຮູບ ກ່ອນສົ່ງ (2-4 ຮູບ)</h2>
                    </div>

                    <p className="text-[10px] text-surface-500 mb-3 leading-relaxed">
                        ຖ່າຍ: ໜ້າ, ຫຼັງ, ລາຍລະອຽດ (close-up). ຮູບເຫຼົ່ານີ້ ຊ່ວຍປົກປ້ອງທ່ານ ກໍລະນີ QC ເກີດປັນຫາ.
                    </p>

                    {/* Already uploaded photos */}
                    {booking.preReturnPhotos.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto">
                            {booking.preReturnPhotos.map((url, i) => (
                                <div key={i} className="w-20 h-20 bg-surface-200 rounded-xl shrink-0 border-2 border-emerald-400 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload grid placeholders */}
                    <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((i) => (
                            <button
                                key={i}
                                className="aspect-square bg-surface-100 border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-accent-500 hover:bg-accent-50 transition-colors"
                            >
                                <Upload className="w-5 h-5 text-surface-400" />
                                <span className="text-[9px] text-surface-400">{i === 0 ? "ໜ້າ" : i === 1 ? "ຫຼັງ" : i === 2 ? "Close" : "+"}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ═══ RETURN METHOD ═══ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-accent-500" />
                        <h2 className="text-sm font-bold text-primary-900">📦 ວິທີຄືນຊຸດ</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border-2 border-accent-500 bg-accent-50 rounded-xl cursor-pointer">
                            <input type="radio" name="returnMethod" defaultChecked className="accent-accent-500" />
                            <div>
                                <p className="text-xs font-bold text-primary-900">🚚 ສົ່ງ Rider ມາຮັບ (ຟຣີ)</p>
                                <p className="text-[10px] text-surface-500">ນັດ Rider ມາຮັບ ພາຍໃນ 2 ຊມ</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-surface-300 rounded-xl cursor-pointer hover:border-surface-400 transition-colors">
                            <input type="radio" name="returnMethod" className="accent-accent-500" />
                            <div>
                                <p className="text-xs font-bold text-primary-900">🏪 ສົ່ງຄືນໜ້າຮ້ານ</p>
                                <p className="text-[10px] text-surface-500">ເອົາມາສົ່ງ ບ່ອນຮ້ານ ດ້ວຍຕົວເອງ</p>
                            </div>
                        </label>
                    </div>
                </section>

                {/* ═══ DEPOSIT INFO ═══ */}
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300 rounded-2xl p-4">
                    <div className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-emerald-700">🔓 ປົດລ໋ອກ ວົງເງິນປະກັນ</p>
                            <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                                {booking.holdAmount.toLocaleString()} ₭
                            </p>
                            <p className="text-[10px] text-emerald-600 mt-1 leading-relaxed">
                                ✅ ສົ່ງຊຸດ → QC Team ກວດ (≤ 4 ຊມ) → ປົດລ໋ອກທັນທີ!<br />
                                ❌ ຖ້າມີ Damage → Claim ສ່ວນຕ່າງ, ສ່ວນທີ່ເຫຼືອ ປົດລ໋ອກ.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ═══ CONFIRM BUTTON ═══ */}
                <button className="w-full py-4 bg-accent-500 hover:bg-accent-600 text-white font-extrabold text-base rounded-2xl transition-colors shadow-xl shadow-accent-500/25 flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    ຢືນຢັນ ພ້ອມສົ່ງຄືນ
                </button>

                {/* SOS link */}
                <Link
                    href="/sos"
                    className="flex items-center gap-2 justify-center text-xs text-red-500 font-bold hover:underline py-2"
                >
                    <AlertCircle className="w-3 h-3" />
                    ມີປັນຫາກັບຊຸດ? ກົດ SOS ບ່ອນນີ້
                </Link>
            </div>
        </div>
    );
}
