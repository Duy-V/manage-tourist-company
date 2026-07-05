import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ContactFab from "@/components/ContactFab";
import CloudSync from "@/components/CloudSync";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tour Sơn Đông Trung Quốc | Thanh Đảo · Uy Hải · Bồng Lai — Ghiền Đi",
    template: "%s | Ghiền Đi · Tour Sơn Đông",
  },
  description:
    "Tour Sơn Đông (Thanh Đảo, Uy Hải, Yên Đài, Bồng Lai, Tế Nam) cùng Ghiền Đi. Khám phá cảnh điểm đẹp nhất, chọn điểm bạn thích để lên lịch trình riêng.",
  keywords: [
    "tour Sơn Đông",
    "tour Thanh Đảo",
    "du lịch Sơn Đông Trung Quốc",
    "tour Uy Hải",
    "tour Bồng Lai",
    "tour Tế Nam",
    "tour Yên Đài",
    "Ghiền Đi",
    "cảnh điểm Sơn Đông",
  ],
  authors: [{ name: "Ghiền Đi" }],
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "Ghiền Đi · Tour Sơn Đông",
    title: "Tour Sơn Đông Trung Quốc — Ghiền Đi",
    description:
      "Khám phá Thanh Đảo, Uy Hải, Bồng Lai tiên cảnh, Tế Nam thành phố suối.",
    images: [
      { url: "/images/hero/thanh-dao-1.jpg", width: 1200, height: 630, alt: "Tour Sơn Đông — Thanh Đảo" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tour Sơn Đông Trung Quốc — Ghiền Đi",
    description: "Thanh Đảo · Uy Hải · Bồng Lai tiên cảnh · Tế Nam thành phố suối.",
    images: ["/images/hero/thanh-dao-1.jpg"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "Ghiền Đi",
  description: "Tour Sơn Đông Trung Quốc: Thanh Đảo, Uy Hải, Yên Đài, Bồng Lai, Tế Nam.",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/images/hero/thanh-dao-1.jpg`,
  areaServed: { "@type": "Place", name: "Sơn Đông, Trung Quốc" },
  knowsLanguage: ["vi", "zh"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-[var(--text)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <CloudSync />
        <NavBar />
        {children}
        <footer className="mt-20 border-t py-8 text-center text-xs text-[var(--text-muted)]">
          Ghiền Đi · Tour Sơn Đông · Thanh Đảo – Uy Hải – Yên Đài – Bồng Lai – Tế Nam
        </footer>
        <ContactFab />
      </body>
    </html>
  );
}
