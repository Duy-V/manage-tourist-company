"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getItinerary, countSpots, spotMap, ensureSeeded, type Itinerary } from "@/lib/store";
import type { ScenicSpot } from "@/lib/types";
import { cny } from "@/lib/format";
import { useRole } from "@/lib/useRole";

export default function ItineraryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const role = useRole();
  const isAdmin = role === "admin";
  const [it, setIt] = useState<Itinerary | undefined>(undefined);
  const [map, setMap] = useState<Record<string, ScenicSpot>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeeded();
    setIt(getItinerary(decodeURIComponent(id)));
    setMap(spotMap());
    setReady(true);
  }, [id]);

  if (!ready) {
    return <main className="mx-auto max-w-5xl px-6 py-10 text-sm text-[var(--text-muted)]">Đang tải…</main>;
  }
  if (!it) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="text-sm text-[var(--text-muted)]">Không tìm thấy hành trình này.</p>
        <Link href="/tours" className="mt-3 inline-block rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">← Tất cả tour</Link>
      </main>
    );
  }

  const cities = Array.from(new Set(
    it.days.flatMap((d) => d.spots.map((s) => map[s]?.city).filter(Boolean) as string[])
  ));

  // Bao gia chua co thoi gian -> mac dinh hom nay; do tuoi khac -> 0 dong
  const today = new Date();
  const todayStr = today.toLocaleDateString("vi-VN");
  const monthLabel = `Tháng ${today.getMonth() + 1}`;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/tours" className="text-sm text-[var(--text-muted)] hover:underline">← Tất cả tour</Link>

      <div className="mt-4 overflow-hidden rounded-2xl border">
        <div className="relative h-64">
          {it.cover ? (
            <img src={it.cover} alt={it.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-5xl text-slate-300">🗺</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
          <div className="absolute bottom-0 p-6 text-white">
            <div className="text-sm text-white/80">Hành trình tự tạo</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{it.name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t bg-[var(--muted)] px-6 py-3 text-sm">
          <span><b>{it.days.length}</b> ngày</span>
          <span><b>{countSpots(it)}</b> cảnh điểm</span>
          {it.price > 0 && <span className="text-[var(--text-muted)]">Từ <b className="text-[var(--text)]">{cny(it.price)}</b>/khách</span>}
          {isAdmin && (
            <div className="ml-auto flex gap-2">
              <Link href={`/itineraries/new?edit=${encodeURIComponent(it.id)}`} className="rounded-lg border px-4 py-1.5 font-medium hover:bg-white">
                ✎ Sửa hành trình
              </Link>
              <Link href={`/quotes/new?itinerary=${encodeURIComponent(it.id)}`} className="rounded-lg bg-[var(--text)] px-4 py-1.5 font-medium text-white hover:opacity-90">
                Tạo báo giá
              </Link>
            </div>
          )}
        </div>
      </div>

      {cities.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5">
          {cities.map((c) => (
            <span key={c} className="rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs text-[var(--text-muted)]">{c}</span>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-xl font-semibold tracking-tight">Lịch trình</h2>
      <div className="mt-5 space-y-5">
        {it.days.map((d) => (
          <div key={d.day_no} className="rounded-xl border bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 items-center rounded-md bg-[var(--accent)] px-2.5 text-sm font-semibold text-white">N{d.day_no}</span>
              <span className="text-sm text-[var(--text-muted)]">{d.spots.length} cảnh điểm</span>
            </div>
            {d.spots.length > 0 ? (
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
            ) : (
              <p className="mt-3 text-sm text-[var(--text-muted)]">Chưa có cảnh điểm cho ngày này.</p>
            )}
          </div>
        ))}
      </div>

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
            <tr className="border-t">
              <td className="px-4 py-2.5 font-medium">{monthLabel}</td>
              <td className="px-4 py-2.5 text-[var(--text-muted)]">{todayStr}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{cny(it.price)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{cny(0)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">{cny(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-emerald-700">Bao gồm</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">—</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-rose-700">Không bao gồm</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">—</p>
        </div>
      </div>
    </main>
  );
}
