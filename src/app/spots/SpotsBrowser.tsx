"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { spotImage } from "@/lib/data";
import { coordOf } from "@/lib/coords";
import type { ScenicSpot } from "@/lib/types";

const CITY_ORDER = ["Thanh Đảo", "Uy Hải", "Yên Đài", "Bồng Lai", "Tế Nam", "Na Hương Hải"];

export default function SpotsBrowser({ spots }: { spots: ScenicSpot[] }) {
  const [active, setActive] = useState<ScenicSpot | null>(null);

  const present = Array.from(new Set(spots.map((s) => s.city)));
  const orderedCities = [
    ...CITY_ORDER.filter((c) => present.includes(c)),
    ...present.filter((c) => !CITY_ORDER.includes(c)),
  ];

  // Đóng popup bằng phím Esc + khoá cuộn nền khi popup mở.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      {orderedCities.map((city) => (
        <section key={city} className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">{city}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {spots.filter((s) => s.city === city).map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setActive(s)}
                className="group overflow-hidden rounded-xl border bg-white text-left transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
              </button>
            ))}
          </div>
        </section>
      ))}

      {active && <SpotModal spot={active} onClose={() => setActive(null)} />}
    </>
  );
}

function SpotModal({ spot, onClose }: { spot: ScenicSpot; onClose: () => void }) {
  const coord = coordOf(spot.slug);
  const mapUrl = coord
    ? `https://uri.amap.com/marker?position=${coord.lng},${coord.lat}&name=${encodeURIComponent(spot.name_cn || spot.name_vn)}&coordinate=gaode`
    : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={spot.name_vn}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-lg text-white transition hover:bg-black/70"
        >
          ✕
        </button>

        <img
          src={spotImage(spot)}
          alt={`${spot.name_vn} — ${spot.city}, Sơn Đông`}
          className={spot.image ? "h-56 w-full rounded-t-2xl object-cover" : "h-56 w-full rounded-t-2xl bg-[var(--muted)] object-contain p-10 opacity-70"}
        />

        <div className="p-5">
          <h3 className="text-2xl font-semibold tracking-tight">{spot.name_vn}</h3>
          {spot.name_cn && <div className="mt-0.5 text-[var(--text-muted)]">{spot.name_cn}</div>}

          <div className="mt-2 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
            <span aria-hidden>📍</span>
            <span>{spot.city}, Sơn Đông (Trung Quốc)</span>
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                · Xem bản đồ
              </a>
            )}
          </div>

          {spot.duration_min && (
            <div className="mt-1 text-sm text-[var(--text-muted)]">
              ⏱️ Thời gian tham quan gợi ý: {spot.duration_min} phút
            </div>
          )}

          {spot.description && (
            <p className="mt-4 leading-relaxed">{spot.description}</p>
          )}

          {spot.highlight && (
            <p className="mt-3 rounded-xl bg-[var(--muted)] px-4 py-3 text-sm">✨ {spot.highlight}</p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/spots/${spot.slug}`}
              className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Xem trang chi tiết
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
