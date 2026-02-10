import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    AlertTriangle,
    Shirt,
    Droplets,
    Scissors,
    ZapOff,
    Clock,
    MapPin,
    Shield,
    ChevronRight,
    LifeBuoy,
} from "lucide-react";

export default async function SOSHelpPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const t = await getTranslations();

    // Get active booking (currently rented)
    const activeBooking = await prisma.booking.findFirst({
        where: {
            renterId: session.user.id as string,
            status: { in: ["SHIPPING", "PICKED_UP", "IN_USE"] },
        },
        include: {
            garment: { select: { titleLo: true, code: true, shop: { select: { nameLo: true, phone: true } } } },
        },
        orderBy: { eventDate: "asc" },
    });

    return (
        <div className="min-h-screen bg-surface-150 pb-12">
            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-red-600 shadow-sm">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link href="/account" className="p-1 hover:bg-red-700 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <LifeBuoy className="w-5 h-5 text-white" />
                        <h1 className="font-bold text-white">SOS ຊ່ວຍເຫຼືອສຸກເສີນ</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {/* ═══ ACTIVE BOOKING CONTEXT ═══ */}
                {activeBooking && (
                    <div className="bg-white rounded-2xl border border-surface-300 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shirt className="w-4 h-4 text-accent-500" />
                            <p className="text-xs font-bold text-primary-900">ການຈອງທີ່ກຳລັງໃຊ້:</p>
                        </div>
                        <p className="text-sm font-bold text-primary-900">{activeBooking.garment.titleLo}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{activeBooking.garment.code}</p>
                        {activeBooking.garment.shop && (
                            <p className="text-xs text-status-success mt-0.5">✅ Verified Partner</p>
                        )}
                    </div>
                )}

                {/* ═══ EMERGENCY SITUATIONS ═══ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4">
                    <h2 className="text-sm font-bold text-primary-900 mb-3">⚡ ສະຖານະການສຸກເສີນ</h2>
                    <div className="space-y-3">
                        {/* Stain */}
                        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <Droplets className="w-6 h-6 text-amber-500 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-amber-700">☕ ເປື້ອນ / ກາເຟໜົກ</p>
                                <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">
                                    1. ຢ່າຂັດ! ໃຊ້ຜ້າຊຸບນ້ຳ ກົດເບົາໆ<br />
                                    2. ຖ່າຍຮູບເປື້ອນ<br />
                                    3. ກົດ &quot;ແຈ້ງທີມ&quot; ດ້ານລຸ່ມ → ເຮົາມີຊ່າງຊັກ On-Call
                                </p>
                            </div>
                        </div>

                        {/* Tear */}
                        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <Scissors className="w-6 h-6 text-red-500 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-red-700">🧵 ຊີກ / ກະດຸມຫຼຸດ</p>
                                <p className="text-[10px] text-red-600 mt-1 leading-relaxed">
                                    1. ຖ່າຍຮູບ Close-up<br />
                                    2. ຢ່າດຶງ! ຍ່ິງຂາດ<br />
                                    3. ມີ Emergency Kit ໃນກ່ອງ ✂️ (ກິ໊ບຕິດ, ເຂັມ+ດ້າຍ)
                                </p>
                            </div>
                        </div>

                        {/* Zipper stuck */}
                        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                            <ZapOff className="w-6 h-6 text-blue-500 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-blue-700">🔗 ຊິບຕິດ / ໃສ່ບໍ່ໄດ້</p>
                                <p className="text-[10px] text-blue-600 mt-1 leading-relaxed">
                                    1. ກົດ &quot;ໂທຫາຮ້ານ&quot; ດ້ານລຸ່ມ<br />
                                    2. ໃຊ້ຜ້າເຫຼື້ອມ ຫຼື ສະບູ &gt; ຖູບ່ອນຊິບ<br />
                                    3. ຖ້າໃສ່ບໍ່ໄດ້ → ໃຊ້ Backup Size (ຖ້າສັ່ງໄວ້)
                                </p>
                            </div>
                        </div>

                        {/* Late Return */}
                        <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                            <Clock className="w-6 h-6 text-purple-500 shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-purple-700">⏰ ສົ່ງຄືນບໍ່ທັນ</p>
                                <p className="text-[10px] text-purple-600 mt-1 leading-relaxed">
                                    1. ກົດ &quot;ຂໍຂະຫຍາຍ&quot; ໃນໜ້າ Booking<br />
                                    2. ຖ້າຊ້າ ≤ 3 ຊມ → ບໍ່ມີຄ່າປັບ<br />
                                    3. ຖ້າຊ້າ &gt; 1 ວັນ → ຄ່າເຊົ່າເພີ່ມ ตาม ອັດຕາ/ວັນ
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ QUICK ACTIONS ═══ */}
                <section className="bg-white rounded-2xl border border-surface-300 p-4 space-y-3">
                    <h2 className="text-sm font-bold text-primary-900 mb-1">📞 ຕິດຕໍ່ສຸກເສີນ</h2>

                    {/* Call MeeSai Support */}
                    <a
                        href="tel:02099999999"
                        className="flex items-center gap-3 p-3 bg-accent-50 border border-accent-200 rounded-xl hover:bg-accent-100 transition-colors"
                    >
                        <Phone className="w-6 h-6 text-accent-500" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-primary-900">ໂທຫາ MeeSai Support</p>
                            <p className="text-[10px] text-surface-500">MeeSai ສາຍດ່ວນ — ພ້ອມຊ່ວຍເຫຼືອທຸກກໍລະນີ</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-400" />
                    </a>

                    {/* WhatsApp Support */}
                    <a
                        href="https://wa.me/85620XXXXXXX?text=SOS+ຕ້ອງການຊ່ວຍເຫຼືອ"
                        target="_blank"
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                    >
                        <MessageCircle className="w-6 h-6 text-green-600" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-primary-900">ແຊັດ MeeSai Support</p>
                            <p className="text-[10px] text-surface-500">ຕອບໄວ ພາຍໃນ 5 ນາທີ</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-400" />
                    </a>

                    {/* Report Issue */}
                    <Link href="/account/bookings" className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors w-full text-left">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        <div className="flex-1">
                            <p className="text-xs font-bold text-primary-900">ແຈ້ງ Damage / ຮ້ອງທຸກ</p>
                            <p className="text-[10px] text-surface-500">ຖ່າຍຮູບ + ອະທິບາຍ → ທີມ QC ຕິດຕໍ່ກັບ</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-surface-400" />
                    </Link>
                </section>

                {/* Insurance Banner */}
                <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-2xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5" />
                        <p className="text-xs font-bold">ປະກັນ MeeSai Shield</p>
                    </div>
                    <p className="text-[10px] leading-relaxed opacity-80">
                        ທຸກການເຊົ່າ ປະກັນ Damage ≤ 500,000₭ ໂດຍອັດຕະໂນມັດ.
                        ເໝາະສຳລັບອຸບັດຕິເຫດ (ກາເຟໜົກ, ຕະກ້ຽວ, ເກິບໄຈ).
                        ບໍ່ຄຸ້ມ: ໃຊ້ຜິດປະເພດ, ຕັ້ງໃຈທຳລາຍ.
                    </p>
                </div>
            </div>
        </div>
    );
}
