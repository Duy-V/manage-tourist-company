"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCustomers, deleteCustomer, type Customer } from "@/lib/store";
import { useCloudRefresh } from "@/lib/cloud";
import { useRole } from "@/lib/useRole";
import { matches } from "@/lib/search";
import SearchBox from "@/components/SearchBox";

export default function CustomersPage() {
  const role = useRole();
  const isAdmin = role === "admin";
  const [items, setItems] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());

  function refresh() {
    setItems(getCustomers().sort((a, b) => b.createdAt - a.createdAt));
  }
  useEffect(() => { refresh(); }, []);
  useCloudRefresh(refresh);

  function fields(c: Customer): Array<string | undefined> {
    return [c.company, c.contactName, c.contactPhone, c.email, c.address, c.taxCode, c.legalRep,
      ...c.progress.flatMap((p) => [p.week, p.content])];
  }

  const pool = useMemo(() => {
    const p: Array<string | undefined> = [];
    for (const c of items) {
      p.push(c.company, c.contactName, c.email, c.contactPhone, c.legalRep, c.taxCode);
      for (const pr of c.progress) p.push(pr.week);
    }
    return p;
  }, [items]);

  const shown = items.filter((c) => matches(fields(c), q));

  const shownIds = shown.map((c) => c.id);
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
    if (!confirm(`Xóa ${sel.size} khách hàng đã chọn?`)) return;
    sel.forEach((id) => deleteCustomer(id));
    setSel(new Set());
    refresh();
  }

  const cb = "h-4 w-4 cursor-pointer accent-[var(--accent)]";

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-lg font-semibold tracking-tight">Khu vực nội bộ</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Bạn cần đăng nhập admin để xem trang Khách hàng.</p>
        <Link href="/" className="mt-5 inline-block text-sm text-[var(--accent)] hover:underline">← Về trang chủ</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Khách hàng</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {q ? `${shown.length} kết quả` : `${items.length} khách hàng · theo dõi tiến độ công việc theo tuần.`}
          </p>
        </div>
        {isAdmin && (
          <Link href="/customers/new" className="shrink-0 rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            + Thêm khách hàng
          </Link>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-5">
          <SearchBox query={q} setQuery={setQ} pool={pool} placeholder="Tìm công ty, người liên hệ, SĐT, email…" />
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
          <p className="text-sm text-[var(--text-muted)]">Chưa có khách hàng nào.</p>
          {isAdmin ? (
            <Link href="/customers/new" className="mt-3 inline-block rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
              Thêm khách hàng đầu tiên
            </Link>
          ) : (
            <p className="mt-2 text-xs text-[var(--text-muted)]">Đăng nhập admin để thêm khách hàng.</p>
          )}
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">Không tìm thấy khách hàng nào khớp “{q}”.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {shown.map((c) => {
            const latest = [...c.progress].sort((a, b) => b.createdAt - a.createdAt)[0];
            return (
              <article key={c.id} className={`group relative overflow-hidden rounded-2xl border bg-white p-5 ${sel.has(c.id) ? "ring-2 ring-[var(--accent)]" : ""}`}>
                {isAdmin && (
                  <>
                    <label className="absolute left-3 top-3 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow ring-1 ring-black/5">
                      <input type="checkbox" checked={sel.has(c.id)} onChange={() => toggle(c.id)} className={cb} />
                    </label>
                    <div className="absolute right-3 top-3 z-20 hidden gap-1 group-hover:flex">
                      <Link href={`/customers/new?edit=${c.id}`} title="Sửa khách hàng"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs shadow ring-1 ring-black/5 hover:bg-[var(--accent)] hover:text-white">✎</Link>
                      <button onClick={() => { if (confirm("Xóa khách hàng này?")) { deleteCustomer(c.id); refresh(); } }} title="Xóa khách hàng"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow ring-1 ring-black/5 hover:bg-rose-600 hover:text-white">×</button>
                    </div>
                  </>
                )}

                <h3 className="pl-9 pr-8 font-semibold tracking-tight">{c.company || "—"}</h3>

                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Người liên hệ</dt><dd>{c.contactName || "—"}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Điện thoại</dt>
                    <dd>{c.contactPhone ? <a href={`tel:${c.contactPhone}`} className="text-[var(--accent)] hover:underline">{c.contactPhone}</a> : "—"}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Email</dt>
                    <dd className="break-all">{c.email ? <a href={`mailto:${c.email}`} className="text-[var(--accent)] hover:underline">{c.email}</a> : "—"}</dd></div>
                  {c.address && <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Địa chỉ</dt><dd>{c.address}</dd></div>}
                  {c.taxCode && <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Mã số thuế</dt><dd className="tabular-nums">{c.taxCode}</dd></div>}
                  {c.legalRep && <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Đại diện PL</dt><dd>{c.legalRep}</dd></div>}
                </dl>

                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-muted)]">Tiến độ ({c.progress.length} tuần)</span>
                    {isAdmin && <Link href={`/customers/new?edit=${c.id}`} className="text-xs text-[var(--accent)] hover:underline">Cập nhật →</Link>}
                  </div>
                  {latest ? (
                    <div className="mt-2 rounded-lg bg-[var(--muted)] p-3">
                      <div className="text-xs font-semibold text-[var(--accent)]">{latest.week}</div>
                      <p className="mt-1 whitespace-pre-wrap text-sm line-clamp-4">{latest.content}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">Chưa có ghi nhận tiến độ.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
