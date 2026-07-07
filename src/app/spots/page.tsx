import type { Metadata } from "next";
import { SPOTS } from "@/lib/data";
import SpotsBrowser from "./SpotsBrowser";

export const metadata: Metadata = {
  title: "Cảnh điểm Sơn Đông",
  description:
    "Tất cả cảnh điểm nổi bật ở Sơn Đông, Trung Quốc: Thanh Đảo, Uy Hải, Yên Đài, Bồng Lai, Tế Nam. Xem ảnh, mô tả và chọn điểm bạn thích để lên lịch trình tour cùng Ghiền Đi.",
  keywords: ["cảnh điểm Sơn Đông", "địa điểm du lịch Sơn Đông", "cảnh đẹp Thanh Đảo", "du lịch Sơn Đông", "Ghiền Đi"],
  alternates: { canonical: "/spots" },
  openGraph: {
    title: "Cảnh điểm Sơn Đông — Ghiền Đi",
    description: "Thanh Đảo, Uy Hải, Yên Đài, Bồng Lai, Tế Nam.",
    url: "/spots",
  },
};

export default function SpotsPage() {
  const spots = Object.values(SPOTS);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Cảnh điểm Sơn Đông</h1>
      <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
        {spots.length} điểm tham quan ở Thanh Đảo, Uy Hải, Yên Đài, Bồng Lai và Tế Nam — chọn nơi bạn thích để lên lịch trình tour riêng cùng Ghiền Đi.
      </p>

      <SpotsBrowser spots={spots} />
    </main>
  );
}
