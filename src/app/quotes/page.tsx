"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getQuotes, deleteQuote, getItinerary, spotMap, type SavedQuote } from "@/lib/store";
import { downloadQuoteDoc } from "@/lib/quoteDoc";
import { cny } from "@/lib/format";
import { useRole } from "@/lib/useRole";

export default function QuotesPage() {
  const role = useRole();
  const [items, setItems] = useState<SavedQuote[]>([]);

  function refresh() {
    setItems(getQuotes().sort((a, b) => b.createdAt - a.createdAt));
  }
  useEffect(() => { refresh(); }, []);

  function exportDoc(q: SavedQuote) {
    downloadQuoteDoc(q, getItinerary(q.itineraryId), spotMap());
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Báo giá</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{items.length} báo giá đã lưu · bấm "Tải file Word" để xuất.</p>
        </div>
        <Link href="/quotes/new" className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          + Tạo báo giá
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">Chưa có báo giá nào được lưu.</p>
          <Link href="/quotes/new" className="mt-3 inline-block rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
            Tạo báo giá đầu tiên
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((q) => {
            const pax = q.adults + q.children + q.infants;
            return (
              <article key={q.id} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white">
                {role === "admin" && (
                  <button
                    onClick={() => { deleteQuote(q.id); refresh(); }}
                    title="Xóa báo giá"
                    className="absolute right-3 top-3 z-10 hidden h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white group-hover:flex hover:bg-rose-600"
                  >×</button>
                )}

                {q.cover ? (
                  <img src={q.cover} alt={q.itineraryName} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-[var(--muted)] text-3xl text-slate-300">🗺</div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="pr-8 font-semibold tracking-tight">{q.customerName}</h3>
                  {q.customerEmail && <div className="text-sm text-[var(--text-muted)]">{q.customerEmail}</div>}

                  <div className="mt-2 text-sm text-[var(--text-muted)]">{q.itineraryName}</div>
                  <div className="text-xs text-[var(--text-muted)]">{q.days} ngày · {pax} khách{q.departureDate ? ` · ${q.departureDate}` : ""}</div>

                  <div className="mt-4 flex items-baseline justify-between border-t pt-3">
                    <span className="text-xs text-[var(--text-muted)]">Tổng</span>
                    <span className="text-lg font-bold tabular-nums">{cny(q.total)}</span>
                  </div>

                  <button
                    onClick={() => exportDoc(q)}
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
