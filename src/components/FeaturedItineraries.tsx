"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureSeeded, getTours } from "@/lib/store";
import type { Tour } from "@/lib/types";
import { cny } from "@/lib/format";

export default function FeaturedItineraries() {
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    ensureSeeded();
    setTours(getTours());
  }, []);

  // Chi lay toi da 2 chuong trinh noi bat
  const featured = tours.slice(0, 2);

  function minPrice(t: Tour): number {
    return t.departures.length ? Math.min(...t.departures.map((d) => d.adult)) : 0;
  }
  function spotCount(t: Tour): number {
    return t.itinerary.reduce((n, d) => n + d.spots.length, 0);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Tour nổi bật</h2>

      {featured.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-[var(--muted)] p-10 text-center text-sm text-[var(--text-muted)]">
          Chưa có chương trình nào để hiển thị.{" "}
          <Link href="/tours" className="text-[var(--accent)] hover:underline">Xem tất cả tour →</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {featured.map((t) => {
            const price = minPrice(t);
            return (
              <Link key={t.code} href={`/tours/${encodeURIComponent(t.code)}`}
                className="group overflow-hidden rounded-2xl border bg-white transition hover:shadow-md">
                <div className="relative h-52 overflow-hidden">
                  {t.cover ? (
                    <img src={t.cover} alt={t.title_vn} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-5xl text-slate-300">🗺</div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-1">
                    <span className="rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">{t.days}N{t.nights}Đ</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold tracking-tight">{t.title_vn}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.cities.length === 0 ? (
                      <span className="text-xs text-[var(--text-muted)]">{spotCount(t)} cảnh điểm</span>
                    ) : t.cities.map((c) => (
                      <span key={c} className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--text-muted)]">{c}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm">
                    {price > 0 ? (
                      <>
                        <span className="text-[var(--text-muted)]">Từ </span>
                        <span className="font-semibold">{cny(price)}</span>
                        <span className="text-[var(--text-muted)]"> /khách</span>
                      </>
                    ) : (
                      <span className="text-[var(--text-muted)]">{t.days} ngày · {spotCount(t)} cảnh điểm</span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/tours" className="inline-block rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-[var(--muted)]">
          Tất cả tour →
        </Link>
      </div>
    </section>
  );
}
