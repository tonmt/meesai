import Link from "next/link";
import {
    ArrowLeft,
    FileText,
    Shield,
    AlertTriangle,
    CheckCircle,
    Ban,
    Scale,
    Eye,
} from "lucide-react";

const agreementSections = [
    {
        icon: Shield,
        title: "ຂໍ້ 1: ການຮັກສາຄວາມລັບແພລດຟອມ",
        content: `ຮ້ານຄ້າຕ້ອງບໍ່ເປີດເຜີຍຂໍ້ມູນລູກຄ້າ (ຊື່, ເບີ, ທີ່ຢູ່) ໃຫ້ບຸກຄົນທີສາມ ຫຼື ໃຊ້ເພື່ອການຕະຫຼາດນອກ MeeSai`,
        severity: "high",
    },
    {
        icon: Ban,
        title: "ຂໍ້ 2: ຫ້າມດຶງລູກຄ້າດີລນອກແພລດຟອມ",
        content: `ຫ້າມແນບນາມບັດ, Line ID, Facebook, ເບີໂທ, ຫຼື ຊ່ອງທາງສ່ວນຕົວໃດໆ ໃນສິນຄ້າ/ຖົງ/ກ່ອງ\n\n⚖️ ບົດລົງໂທດ: ປັບ 10 ເທົ່າຂອງມູນຄ່າ Order + ແບນ 30 ວັນ (ລະເມີດຊ້ຳ = ແບນຖາວອນ)`,
        severity: "critical",
    },
    {
        icon: Eye,
        title: "ຂໍ້ 3: Mystery Shopper Program",
        content: `MeeSai ສາມາດສຸ່ມກວດ (Mystery Shopper) ທຸກເດືອນ ໂດຍບໍ່ແຈ້ງລ່ວງໜ້າ\n\nກວດ: ນາມບັດ, QR Code, ປ້າຍ Line/FB, ວັດສະດຸໂຄສະນາ ໃນ order`,
        severity: "high",
    },
    {
        icon: Scale,
        title: "ຂໍ້ 4: ການສື່ສານຜ່ານ Concierge",
        content: `ທຸກການສື່ສານກັບລູກຄ້າ ຕ້ອງຜ່ານ MeeSai Concierge ເທົ່ານັ້ນ\n\nຮ້ານຄ້າບໍ່ສາມາດຕິດຕໍ່ລູກຄ້າໂດຍກົງ ເວັ້ນແຕ່ໄດ້ຮັບອະນຸຍາດຈາກ MeeSai`,
        severity: "high",
    },
    {
        icon: CheckCircle,
        title: "ຂໍ້ 5: ມາດຕະຖານ QC",
        content: `ສິນຄ້າທຸກຊີ້ນ ຕ້ອງຜ່ານ MeeSai Hub QC ກ່ອນສົ່ງລູກຄ້າ\n\nChecklist: ສະພາບຊຸດ, Hygiene Seal, ປ້າຍໄຊສ໌, ການແພັກ, ບໍ່ມີວັດສະດຸໂຄສະນາ`,
        severity: "normal",
    },
];

const severityStyles = {
    critical: "border-red-200 bg-red-50",
    high: "border-amber-200 bg-amber-50",
    normal: "border-surface-200 bg-surface-50",
};

const severityBadges = {
    critical: "bg-red-500 text-white",
    high: "bg-amber-500 text-white",
    normal: "bg-green-500 text-white",
};

export default function PartnerAgreementPage() {
    return (
        <div className="min-h-screen bg-[#0f0f23] pb-12">
            {/* ── Header ── */}
            <header className="bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f3460] text-white px-4 pt-6 pb-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <Link href="/admin/concierge" className="p-1 hover:bg-white/10 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-red-400" />
                            <h1 className="font-bold text-lg">Partner Agreement</h1>
                        </div>
                    </div>
                    <p className="text-xs text-white/60">
                        ສັນຍາ Anti-Platform Leakage — ຂໍ້ກຳນົດສຳລັບ Partner ທຸກຮ້ານ
                    </p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 -mt-4 space-y-4">
                {/* Warning Banner */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-white">⚠️ ນະໂຍບາຍ Zero-Tolerance</p>
                        <p className="text-xs text-white/70 mt-1">
                            MeeSai ດຳເນີນການທັນທີເມື່ອພົ. ການລະເມີດ ບໍ່ມີການຕັກເຕືອນ
                        </p>
                    </div>
                </div>

                {/* Agreement Sections */}
                {agreementSections.map((section, i) => {
                    const Icon = section.icon;
                    const sev = section.severity as keyof typeof severityStyles;
                    return (
                        <div key={i} className={`bg-white rounded-2xl border overflow-hidden ${severityStyles[sev]}`}>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="w-5 h-5 text-primary-900" />
                                    <h3 className="text-sm font-bold text-primary-900 flex-1">{section.title}</h3>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${severityBadges[sev]}`}>
                                        {sev}
                                    </span>
                                </div>
                                <p className="text-xs text-surface-600 whitespace-pre-line leading-relaxed">
                                    {section.content}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {/* Summary Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-xs text-white/60">
                        Partner ທີ່ລົງທະບຽນ ຖືວ່າຍອມຮັບເງື່ອນໄຂທັງໝົດ
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">
                        MeeSai Iron Wall Policy v1.0 — Effective Date: February 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
