"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getQuoteRequests,
  updateQuoteRequest,
  deleteQuoteRequest,
  type QuoteRequest,
  type QuoteRequestStatus,
} from "@/lib/store";
import { useRole } from "@/lib/useRole";
import { matches } from "@/lib/search";
import SearchBox from "@/components/SearchBox";

const STATUS: { value: QuoteRequestStatus; label: string; cls: string }[] = [
  { value: "new", label: "Mới", cls: "bg-amber-100 text-amber-800" },
  { value: "contacted", label: "Đã liên hệ", cls: "bg-sky-100 text-sky-800" },
  { value: "done", label: "Hoàn tất", cls: "bg-emerald-100 text-emerald-800" },
];
function statusOf(v: QuoteRequestStatus) {
  return STATUS.find((s) => s.value === v) ?? STATUS[0];
}
function fmtDate(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

export default function RequestsPage() {
  const role = useRole();
  const isAdmin = role === "admin";
  const [items, setItems] = useState<QuoteRequest[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<QuoteRequestStatus | "all">("all");

  function refresh() {
    setItems(getQuoteRequests().sort((a, b) => b.createdAt - a.createdAt));
  }
  useEffect(() => { refresh(); }, []);

  const pool = useMemo(() => {
    const p: Array<string | undefined> = [];
    for (const r of items) p.push(r.name, r.phone, r.tourName);
    return p;
  }, [items]);

  const shown = items.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      matches([r.name, r.phone, r.email, r.tourName, r.departureDate], q)
  );

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="text-sm text-[var(--text-muted)]">Trang này chỉ dành cho quản trị viên. Vui lòng đăng nhập admin.</p>
        <Link href="/tours" className="mt-3 inline-block rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">← Xem tour</Link>
      </main>
    );
  }

  const newCount = items.filter((r) => r.status === "new").length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Yêu cầu báo giá</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {q || filter !== "all"
              ? `${shown.length} kết quả`
              : `${items.length} yêu cầu từ khách${newCount > 0 ? ` · ${newCount} chưa xử lý` : ""}`}
          </p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBox query={q} setQuery={setQ} pool={pool} placeholder="Tìm tên khách, SĐT, tour…" />
          </div>
          <div className="flex gap-1.5 text-sm">
            <FilterBtn on={filter === "all"} onClick={() => setFilter("all")}>Tất cả</FilterBtn>
            {STATUS.map((s) => (
              <FilterBtn key={s.value} on={filter === s.value} onClick={() => setFilter(s.value)}>{s.label}</FilterBtn>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Chưa có yêu cầu báo giá nào. Khách gửi yêu cầu từ nút <b>“Nhận báo giá”</b> trên trang chi tiết tour.
          </p>
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">Không có yêu cầu nào khớp bộ lọc.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => {
            const st = statusOf(r.status);
            const pax = r.adults + r.children + r.infants;
            return (
              <article key={r.id} className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white">
                <button
                  onClick={() => { if (confirm("Xóa yêu cầu này?")) { deleteQuoteRequest(r.id); refresh(); } }}
                  title="Xóa yêu cầu"
                  className="absolute right-3 top-3 z-20 hidden h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow ring-1 ring-black/5 hover:bg-rose-600 hover:text-white group-hover:flex"
                >×</button>

                {r.cover ? (
                  <img src={r.cover} alt={r.tourName} className="h-28 w-full object-cover" />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center bg-[var(--muted)] text-3xl text-slate-300">🗺</div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold tracking-tight">{r.name}</h3>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                  </div>
                  <div className="mt-0.5 text-sm text-[var(--text-muted)]">
                    ☎ {r.phone}{r.email ? ` · ${r.email}` : ""}
                  </div>

                  <div className="mt-2 text-sm font-medium">{r.tourName}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {pax} khách ({r.adults} NL{r.children > 0 ? ` · ${r.children} trẻ` : ""}{r.infants > 0 ? ` · ${r.infants} bé` : ""})
                    {r.departureDate ? ` · KH ${fmtDate(r.departureDate)}` : ""}
                  </div>
                  {r.note && <p className="mt-2 rounded-lg bg-[var(--muted)] p-2 text-xs text-[var(--text-muted)]">“{r.note}”</p>}
                  <div className="mt-2 text-xs text-[var(--text-muted)]">
                    Gửi lúc {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t pt-3">
                    <select
                      value={r.status}
                      onChange={(e) => { updateQuoteRequest(r.id, { status: e.target.value as QuoteRequestStatus }); refresh(); }}
                      className="rounded-lg border bg-white px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                    >
                      {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <Link
                      href={`/quotes/new?itinerary=${encodeURIComponent(r.tourCode)}`}
                      className="ml-auto rounded-lg bg-[var(--text)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                    >
                      Tạo báo giá →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function FilterBtn({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 font-medium transition ${on ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "bg-white hover:bg-[var(--muted)]"}`}
    >
      {children}
    </button>
  );
}
