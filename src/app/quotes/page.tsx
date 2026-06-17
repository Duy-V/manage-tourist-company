"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getQuotes, deleteQuote, getItinerary, spotMap, type SavedQuote } from "@/lib/store";
import { downloadQuoteDoc } from "@/lib/quoteDoc";
import { cny } from "@/lib/format";
import { useRole } from "@/lib/useRole";
import { matches } from "@/lib/search";
import SearchBox from "@/components/SearchBox";

export default function QuotesPage() {
  const role = useRole();
  const isAdmin = role === "admin";
  const [items, setItems] = useState<SavedQuote[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());

  function refresh() {
    setItems(getQuotes().sort((a, b) => b.createdAt - a.createdAt));
  }
  useEffect(() => { refresh(); }, []);

  function exportDoc(qt: SavedQuote) {
    downloadQuoteDoc(qt, getItinerary(qt.itineraryId), spotMap());
  }

  const pool = useMemo(() => {
    const p: Array<string | undefined> = [];
    for (const it of items) p.push(it.customerName, it.itineraryName, it.contactName, it.departureDate);
    return p;
  }, [items]);

  const shown = items.filter((it) =>
    matches([it.customerName, it.customerEmail, it.itineraryName, it.contactName, it.contactPhone, it.departureDate], q)
  );

  const shownIds = shown.map((x) => x.id);
  const allSelected = shownIds.length > 0 && shownIds.every((k) => sel.has(k));
  function toggle(id: string) {
    setSel((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSel((prev) => {
      const n = new Set(prev);
      if (allSelected) shownIds.forEach((k) => n.delete(k));
      else shownIds.forEach((k) => n.add(k));
      return n;
    });
  }
  function bulkDelete() {
    if (sel.size === 0) return;
    if (!confirm(`Xóa ${sel.size} báo giá đã chọn?`)) return;
    sel.forEach((id) => deleteQuote(id));
    setSel(new Set());
    refresh();
  }

  const cb = "h-4 w-4 cursor-pointer accent-[var(--accent)]";

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Báo giá</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {q ? `${shown.length} kết quả` : `${items.length} báo giá đã lưu · bấm "Tải file Word" để xuất.`}
          </p>
        </div>
        {isAdmin && (
          <Link href="/quotes/new" className="shrink-0 rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            + Tạo báo giá
          </Link>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <SearchBox query={q} setQuery={setQ} pool={pool} placeholder="Tìm khách hàng, hành trình, ngày khởi hành…" />
        </div>
      )}

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

      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">Chưa có báo giá nào được lưu.</p>
          {isAdmin && (
            <Link href="/quotes/new" className="mt-3 inline-block rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
              Tạo báo giá đầu tiên
            </Link>
          )}
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">Không tìm thấy báo giá nào khớp “{q}”.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((qt) => {
            const pax = qt.adults + qt.children + qt.infants;
            return (
              <article key={qt.id} className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white ${sel.has(qt.id) ? "ring-2 ring-[var(--accent)]" : ""}`}>
                {isAdmin && (
                  <>
                    <label className="absolute left-3 top-3 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow ring-1 ring-black/5">
                      <input type="checkbox" checked={sel.has(qt.id)} onChange={() => toggle(qt.id)} className={cb} />
                    </label>
                    <div className="absolute right-3 top-3 z-20 hidden gap-1 group-hover:flex">
                      <Link href={`/quotes/new?edit=${qt.id}`} title="Sửa báo giá"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs shadow ring-1 ring-black/5 hover:bg-[var(--accent)] hover:text-white">✎</Link>
                      <button onClick={() => { if (confirm("Xóa báo giá này?")) { deleteQuote(qt.id); refresh(); } }} title="Xóa báo giá"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow ring-1 ring-black/5 hover:bg-rose-600 hover:text-white">×</button>
                    </div>
                  </>
                )}

                {qt.cover ? (
                  <img src={qt.cover} alt={qt.itineraryName} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-[var(--muted)] text-3xl text-slate-300">🗺</div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="pr-8 font-semibold tracking-tight">{qt.customerName}</h3>
                  {qt.customerEmail && <div className="text-sm text-[var(--text-muted)]">{qt.customerEmail}</div>}

                  <div className="mt-2 text-sm text-[var(--text-muted)]">{qt.itineraryName}</div>
                  <div className="text-xs text-[var(--text-muted)]">{qt.days} ngày · {pax} khách{qt.departureDate ? ` · ${qt.departureDate}` : ""}</div>

                  <div className="mt-4 flex items-baseline justify-between border-t pt-3">
                    <span className="text-xs text-[var(--text-muted)]">Tổng</span>
                    <span className="text-lg font-bold tabular-nums">{cny(qt.total)}</span>
                  </div>

                  <button
                    onClick={() => exportDoc(qt)}
                    className="mt-4 w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    ⬇ Tải file Word
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
