import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import ContactFab from "@/components/ContactFab";

export const metadata: Metadata = {
  title: "RUIYANG · Sơn Đông",
  description: "Công cụ tạo báo giá tour Sơn Đông (Thanh Đảo) nội bộ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-white text-[var(--text)]">
        <NavBar />
        {children}
        <footer className="mt-20 border-t py-8 text-center text-xs text-[var(--text-muted)]">
          RUIYANG · Công cụ báo giá nội bộ · Dữ liệu tour Sơn Đông
        </footer>
        <ContactFab />
      </body>
    </html>
  );
}
