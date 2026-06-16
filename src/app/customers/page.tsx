"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCustomers, deleteCustomer, type Customer } from "@/lib/store";
import { useRole } from "@/lib/useRole";

export default function CustomersPage() {
  const role = useRole();
  const isAdmin = role === "admin";
  const [items, setItems] = useState<Customer[]>([]);

  function refresh() {
    setItems(getCustomers().sort((a, b) => b.createdAt - a.createdAt));
  }
  useEffect(() => { refresh(); }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-end justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Khách hàng</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{items.length} khách hàng · theo dõi tiến độ công việc theo tuần.</p>
        </div>
        {isAdmin && (
          <Link href="/customers/new" className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            + Thêm khách hàng
          </Link>
        )}
      </div>

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
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {items.map((c) => {
            const latest = [...c.progress].sort((a, b) => b.createdAt - a.createdAt)[0];
            return (
              <article key={c.id} className="group relative overflow-hidden rounded-2xl border bg-white p-5">
                {isAdmin && (
                  <div className="absolute right-3 top-3 z-10 hidden gap-1 group-hover:flex">
                    <Link href={`/customers/new?edit=${c.id}`} title="Sửa khách hàng"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-xs text-white hover:bg-[var(--accent)]">✎</Link>
                    <button onClick={() => { if (confirm("Xóa khách hàng này?")) { deleteCustomer(c.id); refresh(); } }} title="Xóa khách hàng"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white hover:bg-rose-600">×</button>
                  </div>
                )}

                <h3 className="pr-16 font-semibold tracking-tight">{c.company || "—"}</h3>

                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Người liên hệ</dt><dd>{c.contactName || "—"}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Điện thoại</dt>
                    <dd>{c.contactPhone ? <a href={`tel:${c.contactPhone}`} className="text-[var(--accent)] hover:underline">{c.contactPhone}</a> : "—"}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-xs text-[var(--text-muted)]">Email</dt>
                    <dd className="break-all">{c.email ? <a href={`mailto:${c.email}`} className="text-[var(--accent)] hover:underline">{c.email}</a> : "—"}</dd></div>
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
