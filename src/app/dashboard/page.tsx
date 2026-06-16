"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ScenicSpot } from "@/lib/types";
import { getAllSpots, getUserSpots, deleteUserSpot } from "@/lib/store";
import { useRole } from "@/lib/useRole";

export default function ScenicSpotsPage() {
  const role = useRole();
  const isAdmin = role === "admin";
  const [spots, setSpots] = useState<ScenicSpot[]>([]);
  const [userSlugs, setUserSlugs] = useState<Set<string>>(new Set());

  function refresh() {
    setSpots(getAllSpots());
    setUserSlugs(new Set(getUserSpots().map((s) => s.slug)));
  }
  useEffect(() => { refresh(); }, []);

  const cities = Array.from(new Set(spots.map((s) => s.city || "Khác")));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cảnh điểm</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{spots.length} cảnh điểm · dùng để dựng hành trình.</p>
        </div>
        {isAdmin && (
          <Link href="/spots/new" className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            + Thêm cảnh điểm
          </Link>
        )}
      </div>

      {!isAdmin && (
        <p className="mt-4 rounded-lg bg-[var(--muted)] px-4 py-2 text-xs text-[var(--text-muted)]">
          Đăng nhập admin để thêm / sửa / xóa cảnh điểm.
        </p>
      )}

      <div className="mt-10 space-y-12">
        {cities.map((city) => {
          const items = spots.filter((s) => (s.city || "Khác") === city);
          return (
            <section key={city}>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{city}</h2>
                <span className="text-xs text-[var(--text-muted)]">· {items.length}</span>
                <div className="ml-2 h-px flex-1 bg-[var(--border)]" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((s) => {
                  const editable = isAdmin && userSlugs.has(s.slug);
                  return (
                    <article key={s.slug} className="group relative overflow-hidden rounded-xl border bg-white">
                      {editable && (
                        <div className="absolute right-2 top-2 z-10 hidden gap-1 group-hover:flex">
                          <Link href={`/spots/new?edit=${s.slug}`} title="Sửa"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-xs text-white hover:bg-[var(--accent)]">✎</Link>
                          <button onClick={() => { deleteUserSpot(s.slug); refresh(); }} title="Xóa"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white hover:bg-rose-600">×</button>
                        </div>
                      )}
                      {s.image ? (
                        <img src={s.image} alt={s.name_vn} className="h-36 w-full object-cover" />
                      ) : (
                        <div className="flex h-36 w-full items-center justify-center bg-[var(--muted)] text-3xl text-slate-300">⛰</div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-medium leading-tight">{s.name_vn}</h3>
                          {userSlugs.has(s.slug) && <span className="rounded bg-[var(--accent)]/10 px-1 text-[10px] text-[var(--accent)]">mới</span>}
                        </div>
                        {s.name_cn && <div className="text-[11px] text-[var(--text-muted)]">{s.name_cn}</div>}
                        {s.description && <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">{s.description}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
