import Link from "next/link";
import {
    ArrowLeft,
    BookOpen,
    Camera,
    CheckCircle,
    AlertCircle,
    Ban,
    Image,
    Palette,
    Maximize,
} from "lucide-react";

const guidelines = [
    {
        icon: Camera,
        title: "📸 ກົດການຖ່າຍຮູບ",
        rules: [
            "ພື້ນຫຼັງສີຂາວ ຫຼື ສີອ່ອນ ສະອາດ (ບໍ່ມີແບຣນ/ໂລໂກ້)",
            "ຊຸດຮີດຮຽບ ກ່ອນຖ່າຍ ທຸກຊີ້ນ",
            "ໄຟສະຫວ່າງ natural light ຫຼື studio light",
            "ຖ່າຍ 4+ ມຸມ: ໜ້າ, ຫຼັງ, ຂ້າງ, ດີເທລ",
        ],
    },
    {
        icon: Ban,
        title: "🚫 ຫ້າມ",
        rules: [
            "ຫ້າມມີ logo/ຊື່ຮ້ານ ໃນຮູບ",
            "ຫ້າມມີ watermark ສ່ວນຕົວ",
            "ຫ້າມປະປົນວັດສະດຸໂຄສະນາ (ນາມບັດ, QR)",
            "ຫ້າມໃຊ້ filter ບິດເບືອນສີ",
        ],
    },
    {
        icon: Image,
        title: "📐 ຂະໜາດຮູບ",
        rules: [
            "ຂະໜາດ: 1080x1350px ຂຶ້ນໄປ (ອັດຕາສ່ວນ 4:5)",
            "ຟໍແມັດ: JPG ຫຼື WebP (ຂະໜາດ < 2MB)",
            "ໃຫ້ຊຸດຢູ່ກາງເຟຣມ 80% ຂອງຮູບ",
        ],
    },
    {
        icon: Palette,
        title: "✨ Tips ຮູບຂາຍດີ",
        rules: [
            "ແຂວນໃສ່ hanger ຫຼູ (ບໍ່ໃຊ້ hanger ລວດ)",
            "ຖ່າຍກັບ mannequin → ລູກຄ້າເຫັນທ່ອນ",
            "ຖ້າມີ accessory → ຈັດລົງ set ຮ່ວມ",
            "ຖ່າຍ label/ແທັກ (ໄຊສ໌, brand) ເປັນ 1 ຮູບ",
        ],
    },
];

export default function PartnerOnboardingPage() {
    return (
        <div className="min-h-screen bg-[#0f0f23] pb-12">
            {/* Header */}
            <header className="bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f3460] text-white px-4 pt-6 pb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/partner" className="p-1 hover:bg-white/10 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-amber-400" />
                            <h1 className="font-bold text-lg">Photo Guidelines</h1>
                        </div>
                    </div>
                    <p className="text-xs text-white/60">
                        ມາດຕະຖານການຖ່າຍຮູບ ສຳລັບ Partner ທຸກໜ້າ — ປະຕິບັດຕາມ = ຂາຍດີ 📈
                    </p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 -mt-4 space-y-4">
                {/* Info Banner */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-white">📷 ຮູບທີ່ບໍ່ຜ່ານມາດຕະຖານ ຈະຖືກປະຕິເສດ</p>
                        <p className="text-xs text-white/60 mt-1">
                            (Future) ລະບົບ AI ຈະ Remove Background ໃຫ້ອັດຕະໂນມັດ
                        </p>
                    </div>
                </div>

                {/* Guideline Sections */}
                {guidelines.map((section, i) => {
                    const Icon = section.icon;
                    return (
                        <div key={i} className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className="w-5 h-5 text-primary-900" />
                                    <h3 className="text-sm font-bold text-primary-900">{section.title}</h3>
                                </div>
                                <ul className="space-y-2">
                                    {section.rules.map((rule, j) => (
                                        <li key={j} className="flex items-start gap-2 text-xs text-surface-600">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                                            <span>{rule}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}

                {/* Example Grid (placeholder for future) */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <Maximize className="w-8 h-8 mx-auto mb-2 text-white/30" />
                    <p className="text-xs text-white/50">
                        ✨ ຕົວຢ່າງ Before/After (AI Background Removal) — Coming Soon
                    </p>
                </div>
            </div>
        </div>
    );
}
