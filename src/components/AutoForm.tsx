"use client";

import { useState } from "react";
import Link from "next/link";
import { resizeImage } from "@/lib/image";
import type { FieldDef, FormData } from "@/lib/schema";

export default function AutoForm({
  schema,
  initial = {},
  onSubmit,
  submitLabel,
  cancelHref,
  extra,
}: {
  schema: FieldDef[];
  initial?: FormData;
  onSubmit: (data: FormData) => void;
  submitLabel: string;
  cancelHref: string;
  extra?: React.ReactNode;
}) {
  const [data, setData] = useState<FormData>(() => ({ ...initial }));
  const [busy, setBusy] = useState(false);

  const input = "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";
  const labelCls = "text-xs font-medium text-[var(--text-muted)]";

  function set(key: string, val: string | undefined) {
    setData((d) => ({ ...d, [key]: val }));
  }
  async function pickImage(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try { set(key, await resizeImage(f)); } finally { setBusy(false); }
  }

  const canSave = schema.filter((f) => f.required).every((f) => (data[f.key] || "").toString().trim().length > 0);

  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {schema.map((f) => {
          const span = f.half ? "" : "sm:col-span-2";

          if (f.type === "image") {
            const img = data[f.key];
            return (
              <div key={f.key} className="sm:col-span-2">
                <span className={labelCls}>{f.label}</span>
                <div className="mt-1 overflow-hidden rounded-xl border sm:w-64">
                  {img ? (
                    <img src={img} alt="preview" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-[var(--muted)] text-3xl text-slate-300">🖼</div>
                  )}
                  <label className="block cursor-pointer border-t px-3 py-2 text-center text-sm text-[var(--accent)] hover:bg-[var(--muted)]">
                    {busy ? "Đang xử lý…" : img ? "Đổi ảnh" : "Tải ảnh lên"}
                    <input type="file" accept="image/*" onChange={(e) => pickImage(f.key, e)} className="hidden" />
                  </label>
                </div>
                {img && <button onClick={() => set(f.key, undefined)} className="mt-2 text-xs text-rose-600 hover:underline">Xóa ảnh</button>}
              </div>
            );
          }

          if (f.type === "textarea") {
            return (
              <label key={f.key} className={`block ${span}`}>
                <span className={labelCls}>{f.label}{f.required ? " *" : ""}</span>
                <textarea value={data[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} rows={4} placeholder={f.placeholder} className={input} />
              </label>
            );
          }

          return (
            <label key={f.key} className={`block ${span}`}>
              <span className={labelCls}>{f.label}{f.required ? " *" : ""}</span>
              <input
                type={f.type === "number" ? "number" : f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
                value={data[f.key] || ""}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className={input}
              />
            </label>
          );
        })}
      </div>

      {extra}

      <div className="mt-8 flex gap-3">
        <button onClick={() => onSubmit(data)} disabled={!canSave}
          className="rounded-lg bg-[var(--text)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">
          {submitLabel}
        </button>
        <Link href={cancelHref} className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-[var(--muted)]">Hủy</Link>
      </div>
    </div>
  );
}
