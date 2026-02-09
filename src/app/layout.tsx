import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a1628',
};

export const metadata: Metadata = {
  title: {
    default: "ມີໃສ່ — ທະນາຄານແຟຊັ່ນແຫ່ງທຳອິດຂອງລາວ",
    template: "%s | ມີໃສ່ MeeSai",
  },
  description: "ເຊົ່າຊຸດແບຣນເນມ ສະອາດເໝືອນໃໝ່ ຈອງງ່າຍຜ່ານມືຖື — Fashion Bank of Laos. Rent premium outfits, clean as new. Book via mobile.",
  keywords: ["ເຊົ່າຊຸດ", "ແຟຊັ່ນ", "ລາວ", "MeeSai", "rental fashion", "Laos", "ທະນາຄານແຟຊັ່ນ", "outfit rental"],
  authors: [{ name: "MeeSai by V-Group" }],
  creator: "V-Group Laos",
  metadataBase: new URL("https://meesai.vgroup.work"),
  openGraph: {
    type: "website",
    locale: "lo_LA",
    alternateLocale: "en_US",
    siteName: "ມີໃສ່ MeeSai",
    title: "ມີໃສ່ — ທະນາຄານແຟຊັ່ນແຫ່ງທຳອິດຂອງລາວ",
    description: "ເຊົ່າຊຸດແບຣນເນມ ສະອາດເໝືອນໃໝ່ ຈອງງ່າຍຜ່ານມືຖື",
    url: "https://meesai.vgroup.work",
  },
  twitter: {
    card: "summary_large_image",
    title: "ມີໃສ່ MeeSai — Fashion Bank of Laos",
    description: "ເຊົ່າຊຸດແບຣນເນມ ສະອາດເໝືອນໃໝ່ ຈອງງ່າຍຜ່ານມືຖື",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
