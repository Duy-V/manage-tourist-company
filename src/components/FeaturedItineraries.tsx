"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureSeeded, getItineraries, countSpots, spotMap, type Itinerary } from "@/lib/store";
import type { ScenicSpot } from "@/lib/types";
import { cny } from "@/lib/format";

export default function FeaturedItineraries() {
  const [itins, setItins] = useState<Itinerary[]>([]);
  const [map, setMap] = useState<Record<string, ScenicSpot>>({});

  useEffect(() => {
    ensureSeeded();
    setItins(getItineraries().sort((a, b) => b.createdAt - a.createdAt));
    setMap(spotMap());
  }, []);

  // Chi lay du lieu tu Hanh trinh, toi da 2
  const featured = itins.slice(0, 2);

  function itinCities(it: Itinerary): string[] {
    const s = new Set<string>();
    for (const d of it.days) for (const slug of d.spots) {
      const c = map[slug]?.city;
      if (c) s.add(c);
    }
    return [...s];
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-semibold tracking-tight">Tour nổi bật</h2>

      {featured.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-[var(--muted)] p-10 text-center text-sm text-[var(--text-muted)]">
          Chưa có hành trình nào để hiển thị.{" "}
          <Link href="/tours" className="text-[var(--accent)] hover:underline">Xem tất cả tour →</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {featured.map((it) => {
            const cities = itinCities(it);
            return (
              <Link key={it.id} href="/tours"
                className="group overflow-hidden rounded-2xl border bg-white transition hover:shadow-md">
                <div className="relative h-52 overflow-hidden">
                  {it.cover ? (
                    <img src={it.cover} alt={it.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-5xl text-slate-300">🗺</div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-1">
                    <span className="rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">{it.days.length} ngày</span>
                    <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white">Tự tạo</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold tracking-tight">{it.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cities.length === 0 ? (
                      <span className="text-xs text-[var(--text-muted)]">{countSpots(it)} cảnh điểm</span>
                    ) : cities.map((c) => (
                      <span key={c} className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--text-muted)]">{c}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm">
                    {it.price > 0 ? (
                      <>
                        <span className="text-[var(--text-muted)]">Từ </span>
                        <span className="font-semibold">{cny(it.price)}</span>
                        <span className="text-[var(--text-muted)]"> /khách</span>
                      </>
                    ) : (
                      <span className="text-[var(--text-muted)]">{it.days.length} ngày · {countSpots(it)} cảnh điểm</span>
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
