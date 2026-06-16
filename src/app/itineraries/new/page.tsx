"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ScenicSpot } from "@/lib/types";
import { getAllSpots, addItinerary, getItinerary, updateItinerary } from "@/lib/store";
import { slugify } from "@/lib/slug";
import { resizeImage } from "@/lib/image";

function ItineraryBuilder() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const editing = Boolean(editId);

  const [allSpots, setAllSpots] = useState<ScenicSpot[]>([]);
  const [name, setName] = useState("");
  const [numDays, setNumDays] = useState(3);
  const [days, setDays] = useState<string[][]>([[], [], []]);
  const [price, setPrice] = useState(0);
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setAllSpots(getAllSpots()); }, []);

  useEffect(() => {
    if (!editId) return;
    const it = getItinerary(editId);
    if (it) {
      setName(it.name);
      setNumDays(it.days.length);
      setDays(it.days.map((d) => d.spots));
      setPrice(it.price);
      setCover(it.cover);
    }
  }, [editId]);

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      setCover(await resizeImage(f));
    } finally {
      setBusy(false);
    }
  }

  const map = useMemo(() => {
    const m: Record<string, ScenicSpot> = {};
    for (const s of allSpots) m[s.slug] = s;
    return m;
  }, [allSpots]);

  function setDayCount(n: number) {
    const clamped = Math.max(1, Math.min(14, n || 1));
    setNumDays(clamped);
    setDays((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) next.push([]);
      return next;
    });
  }

  function addSpotToDay(dayIdx: number, slug: string) {
    if (!slug) return;
    setDays((prev) => prev.map((d, i) => (i === dayIdx && !d.includes(slug) ? [...d, slug] : d)));
  }
  function removeSpotFromDay(dayIdx: number, slug: string) {
    setDays((prev) => prev.map((d, i) => (i === dayIdx ? d.filter((s) => s !== slug) : d)));
  }

  const totalSpots = days.reduce((n, d) => n + d.length, 0);
  const canCreate = name.trim().length > 0 && totalSpots > 0;

  function create() {
    if (!canCreate) return;
    const payload = {
      name: name.trim(),
      days: days.map((spots, i) => ({ day_no: i + 1, spots })),
      price: Math.max(0, price),
      cover,
    };
    if (editing && editId) {
      updateItinerary(editId, payload);
    } else {
      addItinerary({
        id: slugify(name) + "-" + Date.now().toString(36),
        ...payload,
        createdAt: Date.now(),
      });
    }
    router.push("/itineraries");
  }

  const input =
    "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";
  const label = "text-xs font-medium text-[var(--text-muted)]";

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/itineraries" className="text-sm text-[var(--text-muted)] hover:underline">← Hành trình</Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{editing ? "Sửa hành trình" : "Tạo hành trình"}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Chọn cảnh điểm cho từng ngày từ thư viện có sẵn.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <label className="block">
              <span className={label}>Tên hành trình *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Sơn Đông 4 ngày tinh gọn" className={input} />
            </label>
            <label className="block">
              <span className={label}>Số ngày</span>
              <input type="number" min={1} max={14} value={numDays} onChange={(e) => setDayCount(Number(e.target.value))} className={input} />
            </label>
          </div>

          {days.map((daySpots, i) => (
            <div key={i} className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 items-center rounded-md bg-[var(--accent)] px-2 text-sm font-semibold text-white">N{i + 1}</span>
                <span className="text-sm text-[var(--text-muted)]">{daySpots.length} cảnh điểm</span>
              </div>

              {daySpots.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {daySpots.map((slug) => (
                    <span key={slug} className="flex items-center gap-1.5 rounded-full border bg-[var(--muted)] py-1 pl-2 pr-1 text-xs">
                      {map[slug]?.name_vn ?? slug}
                      <button onClick={() => removeSpotFromDay(i, slug)} className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 hover:bg-rose-500 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              )}

              <select
                value=""
                onChange={(e) => { addSpotToDay(i, e.target.value); e.target.value = ""; }}
                className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm text-[var(--text-muted)] outline-none focus:border-[var(--accent)]"
              >
                <option value="">+ Thêm cảnh điểm vào ngày {i + 1}…</option>
                {allSpots
                  .filter((s) => !daySpots.includes(s.slug))
                  .map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name_vn}{s.city ? ` — ${s.city}` : ""}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border bg-white p-5">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Tổng quan</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Số ngày</dt><dd className="font-medium">{numDays}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-muted)]">Số cảnh điểm</dt><dd className="font-medium">{totalSpots}</dd></div>
          </dl>

          <div className="mt-4">
            <span className={label}>Ảnh đại diện</span>
            <div className="mt-1 overflow-hidden rounded-xl border">
              {cover ? (
                <img src={cover} alt="ảnh đại diện" className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-[var(--muted)] text-3xl text-slate-300">🖼</div>
              )}
              <label className="block cursor-pointer border-t px-3 py-2 text-center text-sm text-[var(--accent)] hover:bg-[var(--muted)]">
                {busy ? "Đang xử lý…" : cover ? "Đổi ảnh" : "Tải ảnh lên"}
                <input type="file" accept="image/*" onChange={onPickCover} className="hidden" />
              </label>
            </div>
            {cover && (
              <button onClick={() => setCover(undefined)} className="mt-1 w-full text-center text-xs text-rose-600 hover:underline">
                Xóa ảnh
              </button>
            )}
          </div>

          <label className="mt-4 block">
            <span className={label}>Giá tham khảo (¥/khách)</span>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="3980" className={input} />
          </label>
          <button onClick={create} disabled={!canCreate}
            className="mt-5 w-full rounded-lg bg-[var(--text)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">
            {editing ? "Lưu thay đổi" : "Xác nhận tạo hành trình"}
          </button>
          {!canCreate && <p className="mt-2 text-center text-xs text-[var(--text-muted)]">Cần tên + ít nhất 1 cảnh điểm</p>}
        </aside>
      </div>
    </main>
  );
}

export default function NewItineraryPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-12 text-sm text-[var(--text-muted)]">Đang tải…</div>}>
      <ItineraryBuilder />
    </Suspense>
  );
}
