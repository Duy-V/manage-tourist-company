"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { addSpot, getUserSpot, updateSpot } from "@/lib/store";
import { slugify } from "@/lib/slug";
import { resizeImage } from "@/lib/image";

function SpotForm() {
  const router = useRouter();
  const params = useSearchParams();
  const editSlug = params.get("edit");
  const editing = Boolean(editSlug);

  const [name, setName] = useState("");
  const [nameCn, setNameCn] = useState("");
  const [city, setCity] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editSlug) return;
    const s = getUserSpot(editSlug);
    if (s) {
      setName(s.name_vn); setNameCn(s.name_cn || ""); setCity(s.city === "Khác" ? "" : s.city || "");
      setDesc(s.description || ""); setImage(s.image);
    }
  }, [editSlug]);

  const input = "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";
  const label = "text-xs font-medium text-[var(--text-muted)]";

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try { setImage(await resizeImage(f)); } finally { setBusy(false); }
  }

  function save() {
    if (!name.trim()) return;
    const data = {
      name_vn: name.trim(),
      name_cn: nameCn.trim() || undefined,
      city: city.trim() || "Khác",
      description: desc.trim() || undefined,
      image,
    };
    if (editing && editSlug) updateSpot(editSlug, data);
    else addSpot({ slug: slugify(name), ...data });
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:underline">← Cảnh điểm</Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{editing ? "Sửa cảnh điểm" : "Thêm cảnh điểm"}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{editing ? "Cập nhật thông tin thẻ cảnh điểm." : "Tạo thẻ cảnh điểm mới để dùng khi dựng hành trình."}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_240px]">
        <div className="space-y-4">
          <label className="block">
            <span className={label}>Tên cảnh điểm *</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Núi Yên Đài" className={input} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className={label}>Tên tiếng Trung</span>
              <input value={nameCn} onChange={(e) => setNameCn(e.target.value)} placeholder="烟台山" className={input} />
            </label>
            <label className="block">
              <span className={label}>Thành phố</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Yên Đài" className={input} />
            </label>
          </div>
          <label className="block">
            <span className={label}>Nội dung / mô tả</span>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="Giới thiệu ngắn về cảnh điểm…" className={input} />
          </label>
        </div>

        <div>
          <span className={label}>Hình ảnh</span>
          <div className="mt-1 overflow-hidden rounded-xl border">
            {image ? (
              <img src={image} alt="preview" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-[var(--muted)] text-3xl text-slate-300">⛰</div>
            )}
            <label className="block cursor-pointer border-t px-3 py-2 text-center text-sm text-[var(--accent)] hover:bg-[var(--muted)]">
              {busy ? "Đang xử lý…" : image ? "Đổi ảnh" : "Tải ảnh lên"}
              <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
            </label>
          </div>
          {image && (
            <button onClick={() => setImage(undefined)} className="mt-2 w-full text-center text-xs text-rose-600 hover:underline">Xóa ảnh</button>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={save} disabled={!name.trim()}
          className="rounded-lg bg-[var(--text)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">
          {editing ? "Lưu thay đổi" : "Tạo thẻ cảnh điểm"}
        </button>
        <Link href="/dashboard" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-[var(--muted)]">Hủy</Link>
      </div>
    </main>
  );
}

export default function NewSpotPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-12 text-sm text-[var(--text-muted)]">Đang tải…</div>}>
      <SpotForm />
    </Suspense>
  );
}
