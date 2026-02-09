import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ມີໃສ່ — ທະນາຄານແຟຊັ່ນແຫ່ງທຳອິດຂອງລາວ",
  description: "ເຊົ່າຊຸດແບຣນເນມ ສະອາດເໝືອນໃໝ່ ຈອງງ່າຍຜ່ານມືຖື",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
