"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getTour, spotMap, ensureSeeded } from "@/lib/store";
import type { Tour, ScenicSpot } from "@/lib/types";
import { cny } from "@/lib/format";
import { useRole } from "@/lib/useRole";

export default function TourDetail({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const role = useRole();
  const isAdmin = role === "admin";
  const [tour, setTour] = useState<Tour | undefined>(undefined);
  const [map, setMap] = useState<Record<string, ScenicSpot>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeeded();
    setTour(getTour(decodeURIComponent(code)));
    setMap(spotMap());
    setReady(true);
  }, [code]);

  if (!ready) {
    return <main className="mx-auto max-w-5xl px-6 py-10 text-sm text-[var(--text-muted)]">Đang tải…</main>;
  }
  if (!tour) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="text-sm text-[var(--text-muted)]">Không tìm thấy tour này.</p>
        <Link href="/tours" className="mt-3 inline-block rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">← Tất cả tour</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/tours" className="text-sm text-[var(--text-muted)] hover:underline">← Tất cả tour</Link>

      <div className="mt-4 overflow-hidden rounded-2xl border">
        <div className="relative h-64">
          {tour.cover ? (
            <img src={tour.cover} alt={tour.title_vn} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-5xl text-slate-300">🗺</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
          <div className="absolute bottom-0 p-6 text-white">
            {tour.title_cn && <div className="text-sm text-white/80">{tour.title_cn}</div>}
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{tour.title_vn}</h1>
            {tour.tagline_vn && <p className="mt-1 text-white/85">{tour.tagline_vn}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t bg-[var(--muted)] px-6 py-3 text-sm">
          <span><b>{tour.days}</b> ngày <b>{tour.nights}</b> đêm</span>
          {tour.airline && <span>✈ {tour.airline}</span>}
          {tour.departures.length > 0 && (
            <span className="text-[var(--text-muted)]">Từ <b className="text-[var(--text)]">{cny(Math.min(...tour.departures.map((d) => d.adult)))}</b>/khách</span>
          )}
          {isAdmin && (
            <div className="ml-auto flex gap-2">
              <Link href={`/tour/new?edit=${encodeURIComponent(tour.code)}`} className="rounded-lg border px-4 py-1.5 font-medium hover:bg-white">
                ✎ Sửa tour
              </Link>
              <Link href={`/quotes/new?itinerary=`} className="rounded-lg bg-[var(--text)] px-4 py-1.5 font-medium text-white hover:opacity-90">
                Tạo báo giá
              </Link>
            </div>
          )}
        </div>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">Lịch trình</h2>
      <div className="mt-5 space-y-5">
        {tour.itinerary.map((d) => (
          <div key={d.day_no} className="rounded-xl border bg-white p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="flex h-8 items-center rounded-md bg-[var(--accent)] px-2.5 text-sm font-semibold text-white">N{d.day_no}</span>
              <h3 className="font-semibold tracking-tight">{d.route_vn}</h3>
              {d.route_cn && <span className="text-sm text-[var(--text-muted)]">{d.route_cn}</span>}
            </div>
            {d.spots.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {d.spots.map((slug) => {
                  const s = map[slug];
                  if (!s) return null;
                  return (
                    <div key={slug} className="overflow-hidden rounded-lg border">
                      {s.image ? (
                        <img src={s.image} alt={s.name_vn} className="h-24 w-full object-cover" />
                      ) : (
                        <div className="flex h-24 w-full items-center justify-center bg-[var(--muted)] text-2xl">⛰</div>
                      )}
                      <div className="p-2">
                        <div className="text-xs font-medium leading-tight">{s.name_vn}</div>
                        {s.name_cn && <div className="text-[10px] text-[var(--text-muted)]">{s.name_cn}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--text-muted)]">
              {d.meals && <span><span className="text-slate-400">Ẩm thực:</span> {d.meals}</span>}
              {d.hotel && <span><span className="text-slate-400">Lưu trú:</span> {d.hotel}</span>}
            </div>
          </div>
        ))}
      </div>

      {tour.departures.length > 0 && (
        <>
          <h2 className="mt-10 text-xl font-semibold tracking-tight">Giá theo ngày khởi hành <span className="text-sm font-normal text-[var(--text-muted)]">(CNY/khách)</span></h2>
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-[var(--muted)] text-left text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Tháng</th>
                  <th className="px-4 py-2.5 font-medium">Ngày khởi hành</th>
                  <th className="px-4 py-2.5 text-right font-medium">Người lớn</th>
                  <th className="px-4 py-2.5 text-right font-medium">Trẻ 2–11</th>
                  <th className="px-4 py-2.5 text-right font-medium">Dưới 2</th>
                </tr>
              </thead>
              <tbody>
                {tour.departures.map((d, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2.5 font-medium">{d.month}</td>
                    <td className="px-4 py-2.5 text-[var(--text-muted)]">{d.dates}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{cny(d.adult)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{cny(d.child)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{cny(d.infant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(tour.includes || tour.excludes) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold text-emerald-700">Bao gồm</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{tour.includes}</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold text-rose-700">Không bao gồm</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{tour.excludes}</p>
          </div>
        </div>
      )}
      {tour.hotels_note && <p className="mt-4 text-xs text-[var(--text-muted)]">Khách sạn tham khảo: {tour.hotels_note}</p>}
    </main>
  );
}
