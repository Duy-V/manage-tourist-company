"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cny } from "@/lib/format";
import { getTours, deleteTour, ensureSeeded } from "@/lib/store";
import type { Tour } from "@/lib/types";
import { useRole } from "@/lib/useRole";
import { matches } from "@/lib/search";
import SearchBox from "@/components/SearchBox";

export default function ToursPage() {
  const role = useRole();
  const isAdmin = role === "admin";
  const [tours, setTours] = useState<Tour[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());

  function refresh() {
    ensureSeeded();
    setTours(getTours());
  }
  useEffect(() => { refresh(); }, []);

  // Cuon toi + lam noi bat the duoc tro toi qua #hash (tu trang chu)
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;
    const id = window.location.hash;
    const t = setTimeout(() => {
      const el = document.querySelector(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-[var(--accent)]", "ring-offset-2");
        setTimeout(() => el.classList.remove("ring-2", "ring-[var(--accent)]", "ring-offset-2"), 2500);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [tours]);

  const pool = useMemo(() => {
    const p: Array<string | undefined> = [];
    for (const t of tours) p.push(t.title_vn, t.title_cn, t.tagline_vn, t.code, t.airline, ...t.cities);
    return p;
  }, [tours]);

  const shown = tours.filter((t) =>
    matches([t.title_vn, t.title_cn, t.tagline_vn, t.code, t.airline, ...t.cities], q)
  );

  const shownKeys = shown.map((t) => t.code);
  const allSelected = shownKeys.length > 0 && shownKeys.every((k) => sel.has(k));
  function toggle(key: string) {
    setSel((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }
  function toggleAll() {
    setSel((prev) => {
      const n = new Set(prev);
      if (allSelected) shownKeys.forEach((k) => n.delete(k));
      else shownKeys.forEach((k) => n.add(k));
      return n;
    });
  }
  function bulkDelete() {
    if (sel.size === 0) return;
    if (!confirm(`Xóa ${sel.size} mục đã chọn?`)) return;
    sel.forEach((code) => deleteTour(code));
    setSel(new Set());
    refresh();
  }

  const cbWrap = "absolute left-3 top-3 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow ring-1 ring-black/5";
  const cb = "h-4 w-4 cursor-pointer accent-[var(--accent)]";
  const actWrap = "absolute right-3 top-3 z-20 hidden gap-1 group-hover:flex";
  const btnEdit = "flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs shadow ring-1 ring-black/5 hover:bg-[var(--accent)] hover:text-white";
  const btnDel = "flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow ring-1 ring-black/5 hover:bg-rose-600 hover:text-white";

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chương trình tour</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {q ? `${shown.length} kết quả` : `${tours.length} chương trình`}
          </p>
        </div>
        {isAdmin && (
          <div className="flex shrink-0 gap-2">
            <Link href="/tour/new" className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">+ Chương trình</Link>
          </div>
        )}
      </div>

      <div className="mt-5">
        <SearchBox query={q} setQuery={setQ} pool={pool} placeholder="Tìm tour, thành phố, chương trình…" />
      </div>

      {isAdmin && shown.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className={cb} /> Chọn tất cả
          </label>
          {sel.size > 0 && (
            <>
              <span className="text-[var(--text-muted)]">Đã chọn {sel.size}</span>
              <button onClick={bulkDelete} className="rounded-lg bg-rose-600 px-3 py-1.5 font-medium text-white hover:bg-rose-700">Xóa đã chọn</button>
              <button onClick={() => setSel(new Set())} className="text-[var(--text-muted)] hover:underline">Bỏ chọn</button>
            </>
          )}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">{q ? `Không tìm thấy chương trình nào khớp “${q}”.` : "Chưa có chương trình nào."}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {shown.map((t) => {
            const key = t.code;
            return (
              <article key={t.code} id={`t-${t.code}`} className={`group relative overflow-hidden rounded-2xl border bg-white transition hover:shadow-md ${sel.has(key) ? "ring-2 ring-[var(--accent)]" : ""}`}>
                {isAdmin && (
                  <>
                    <label className={cbWrap}><input type="checkbox" checked={sel.has(key)} onChange={() => toggle(key)} className={cb} /></label>
                    <div className={actWrap}>
                      <Link href={`/tour/new?edit=${encodeURIComponent(t.code)}`} title="Sửa chương trình" className={btnEdit}>✎</Link>
                      <button onClick={() => { if (confirm(`Xóa chương trình "${t.title_vn}"?`)) { deleteTour(t.code); refresh(); } }} title="Xóa chương trình" className={btnDel}>×</button>
                    </div>
                  </>
                )}
                <Link href={`/tours/${encodeURIComponent(t.code)}`} className="block">
                  <div className="relative h-56 overflow-hidden">
                    {t.cover ? (
                      <img src={t.cover} alt={t.title_vn} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-5xl text-slate-300">🗺</div>
                    )}
                    <div className="absolute bottom-3 left-3 flex gap-1">
                      <span className="rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">{t.days}N{t.nights}Đ</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{t.code}</div>
                    <h3 className="mt-1 font-semibold tracking-tight">{t.title_vn}</h3>
                    {t.tagline_vn && <p className="mt-1 text-sm text-[var(--text-muted)]">{t.tagline_vn}</p>}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t.cities.map((c) => (
                        <span key={c} className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--text-muted)]">{c}</span>
                      ))}
                    </div>
                    {t.departures.length > 0 && (
                      <p className="mt-4 text-sm">
                        <span className="text-[var(--text-muted)]">Từ </span>
                        <span className="font-semibold">{cny(Math.min(...t.departures.map((d) => d.adult)))}</span>
                        <span className="text-[var(--text-muted)]"> /khách</span>
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
