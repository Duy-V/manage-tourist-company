"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getItineraries, deleteItinerary, countSpots, spotMap, type Itinerary } from "@/lib/store";
import type { ScenicSpot } from "@/lib/types";
import { cny } from "@/lib/format";
import { useRole } from "@/lib/useRole";

export default function ItinerariesPage() {
  const role = useRole();
  const isAdmin = role === "admin";
  const [items, setItems] = useState<Itinerary[]>([]);
  const [map, setMap] = useState<Record<string, ScenicSpot>>({});

  function refresh() {
    setItems(getItineraries().sort((a, b) => b.createdAt - a.createdAt));
    setMap(spotMap());
  }
  useEffect(() => { refresh(); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hành trình</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{items.length} hành trình tự tạo.</p>
        </div>
        {isAdmin && (
          <Link href="/itineraries/new" className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            + Tạo hành trình
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">Chưa có hành trình nào.</p>
          {isAdmin ? (
            <Link href="/itineraries/new" className="mt-3 inline-block rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
              Tạo hành trình đầu tiên
            </Link>
          ) : (
            <p className="mt-2 text-xs text-[var(--text-muted)]">Đăng nhập admin để tạo hành trình.</p>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.id} className="group relative overflow-hidden rounded-2xl border bg-white">
              {isAdmin && (
                <div className="absolute right-3 top-3 z-10 hidden gap-1 group-hover:flex">
                  <Link href={`/itineraries/new?edit=${it.id}`} title="Sửa hành trình"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-xs text-white hover:bg-[var(--accent)]">✎</Link>
                  <button onClick={() => { deleteItinerary(it.id); refresh(); }} title="Xóa hành trình"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white hover:bg-rose-600">×</button>
                </div>
              )}

              {it.cover ? (
                <img src={it.cover} alt={it.name} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-[var(--muted)] text-4xl text-slate-300">🗺</div>
              )}

              <div className="p-5">
                <h3 className="pr-8 font-semibold tracking-tight">{it.name}</h3>

                <div className="mt-4 flex gap-5 text-sm">
                  <div><div className="text-lg font-semibold tabular-nums">{it.days.length}</div><div className="text-xs text-[var(--text-muted)]">ngày</div></div>
                  <div><div className="text-lg font-semibold tabular-nums">{countSpots(it)}</div><div className="text-xs text-[var(--text-muted)]">cảnh điểm</div></div>
                  <div><div className="text-lg font-semibold tabular-nums">{it.price > 0 ? cny(it.price) : "—"}</div><div className="text-xs text-[var(--text-muted)]">/khách</div></div>
                </div>

                <div className="mt-4 space-y-1.5 border-t pt-3">
                  {it.days.map((d) => (
                    <div key={d.day_no} className="flex gap-2 text-xs">
                      <span className="shrink-0 font-medium text-[var(--accent)]">N{d.day_no}</span>
                      <span className="text-[var(--text-muted)] line-clamp-1">
                        {d.spots.length === 0 ? "—" : d.spots.map((s) => map[s]?.name_vn ?? s).join(" · ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
