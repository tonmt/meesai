import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "ມີໃສ່ — Fashion Bank of Laos",
        template: "%s | ມີໃສ່",
    },
    description:
        "ທະນາຄານແຟຊັ່ນ ແຫ່ງທຳອິດຂອງ ສປປ.ລາວ — ເຊົ່າຊຸດແບຣນເນມ ສະອາດ ປອດໄພ ຈອງງ່າຍຜ່ານມືຖື",
    keywords: ["MeeSai", "ມີໃສ່", "fashion rental", "Laos", "Vientiane"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
