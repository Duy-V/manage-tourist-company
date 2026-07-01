import type { Metadata } from "next";
import Link from "next/link";
import { SPOTS, spotImage } from "@/lib/data";

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

const CITY_ORDER = ["Thanh Đảo", "Uy Hải", "Yên Đài", "Bồng Lai", "Tế Nam", "Na Hương Hải"];

export default function SpotsPage() {
  const spots = Object.values(SPOTS);
  const present = Array.from(new Set(spots.map((s) => s.city)));
  const orderedCities = [
    ...CITY_ORDER.filter((c) => present.includes(c)),
    ...present.filter((c) => !CITY_ORDER.includes(c)),
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Cảnh điểm Sơn Đông</h1>
      <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
        {spots.length} điểm tham quan ở Thanh Đảo, Uy Hải, Yên Đài, Bồng Lai và Tế Nam — chọn nơi bạn thích để lên lịch trình tour riêng cùng Ghiền Đi.
      </p>

      {orderedCities.map((city) => (
        <section key={city} className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">{city}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {spots.filter((s) => s.city === city).map((s) => (
              <Link
                key={s.slug}
                href={`/spots/${s.slug}`}
                className="group overflow-hidden rounded-xl border bg-white transition hover:shadow-md"
              >
                <img
                  src={spotImage(s)}
                  alt={`${s.name_vn} — ${s.city}, Sơn Đông`}
                  className={s.image ? "h-32 w-full object-cover transition duration-500 group-hover:scale-105" : "h-32 w-full bg-[var(--muted)] object-contain p-4 opacity-70"}
                />
                <div className="p-3">
                  <div className="text-sm font-medium leading-tight">{s.name_vn}</div>
                  {s.name_cn && <div className="text-xs text-[var(--text-muted)]">{s.name_cn}</div>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
