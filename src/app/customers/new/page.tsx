"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { addCustomer, getCustomer, updateCustomer, type ProgressEntry } from "@/lib/store";

function rid() { return Math.random().toString(36).slice(2, 10); }

function CustomerForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const editing = Boolean(editId);

  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [legalRep, setLegalRep] = useState("");
  const [progress, setProgress] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    if (!editId) return;
    const c = getCustomer(editId);
    if (c) {
      setCompany(c.company); setEmail(c.email); setContactName(c.contactName);
      setContactPhone(c.contactPhone); setProgress(c.progress || []);
      setAddress(c.address || ""); setTaxCode(c.taxCode || ""); setLegalRep(c.legalRep || "");
    }
  }, [editId]);

  const input = "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";
  const label = "text-xs font-medium text-[var(--text-muted)]";

  function addEntry() {
    setProgress((p) => [{ id: rid(), week: "", content: "", createdAt: Date.now() }, ...p]);
  }
  function patchEntry(id: string, k: "week" | "content", v: string) {
    setProgress((p) => p.map((e) => (e.id === id ? { ...e, [k]: v } : e)));
  }
  function removeEntry(id: string) {
    setProgress((p) => p.filter((e) => e.id !== id));
  }

  function save() {
    if (!company.trim()) return;
    const cleaned = progress
      .map((e) => ({ ...e, week: e.week.trim(), content: e.content.trim() }))
      .filter((e) => e.week || e.content);
    const data = {
      company: company.trim(),
      email: email.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      address: address.trim() || undefined,
      taxCode: taxCode.trim() || undefined,
      legalRep: legalRep.trim() || undefined,
      progress: cleaned,
    };
    if (editing && editId) updateCustomer(editId, data);
    else addCustomer({ id: rid(), createdAt: Date.now(), ...data });
    router.push("/customers");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/customers" className="text-sm text-[var(--text-muted)] hover:underline">← Khách hàng</Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{editing ? "Sửa khách hàng" : "Thêm khách hàng"}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Thông tin công ty, liên hệ và tiến độ công việc theo tuần.</p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className={label}>Tên công ty *</span>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="VD: Công ty TNHH Du lịch ABC" className={input} />
        </label>
        <label className="block">
          <span className={label}>Địa chỉ công ty</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM" className={input} />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Mã số thuế</span>
            <input value={taxCode} onChange={(e) => setTaxCode(e.target.value)} placeholder="VD: 0312345678" className={input} />
          </label>
          <label className="block">
            <span className={label}>Người đại diện pháp luật</span>
            <input value={legalRep} onChange={(e) => setLegalRep(e.target.value)} placeholder="VD: Bà Trần Thị B" className={input} />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={label}>Người liên hệ</span>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="VD: Anh Nam" className={input} />
          </label>
          <label className="block">
            <span className={label}>Số điện thoại người liên hệ</span>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="VD: 0901 234 567" className={input} />
          </label>
        </div>
        <label className="block">
          <span className={label}>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="VD: lienhe@congty.com" className={input} />
        </label>
      </div>

      <div className="mt-10 border-t pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">Tiến độ công việc theo tuần</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Ghi nội dung tiến độ cho từng tuần.</p>
          </div>
          <button onClick={addEntry} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-[var(--muted)]">+ Thêm tuần</button>
        </div>

        {progress.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed bg-[var(--muted)] p-6 text-center text-sm text-[var(--text-muted)]">Chưa có ghi nhận. Bấm "+ Thêm tuần".</p>
        ) : (
          <div className="mt-4 space-y-4">
            {progress.map((e) => (
              <div key={e.id} className="rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <label className="block w-48 shrink-0">
                    <span className={label}>Tuần</span>
                    <input value={e.week} onChange={(ev) => patchEntry(e.id, "week", ev.target.value)} placeholder="VD: 16/06–22/06" className={input} />
                  </label>
                  <button onClick={() => removeEntry(e.id)} title="Xóa tuần"
                    className="mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[var(--text-muted)] hover:bg-rose-50 hover:text-rose-600">×</button>
                </div>
                <label className="mt-3 block">
                  <span className={label}>Nội dung tiến độ</span>
                  <textarea value={e.content} onChange={(ev) => patchEntry(e.id, "content", ev.target.value)} rows={3} placeholder="Mô tả công việc đã làm / cần làm trong tuần…" className={input} />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={save} disabled={!company.trim()}
          className="rounded-lg bg-[var(--text)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">
          {editing ? "Lưu thay đổi" : "Thêm khách hàng"}
        </button>
        <Link href="/customers" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-[var(--muted)]">Hủy</Link>
      </div>
    </main>
  );
}

export default function NewCustomerPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-12 text-sm text-[var(--text-muted)]">Đang tải…</div>}>
      <CustomerForm />
    </Suspense>
  );
}
