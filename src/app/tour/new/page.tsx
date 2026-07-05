"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ScenicSpot, Tour, TourDay, Departure } from "@/lib/types";
import { getAllSpots, addTour, getTour, updateTour, ensureSeeded } from "@/lib/store";
import { useCloudRefresh } from "@/lib/cloud";
import { slugify } from "@/lib/slug";
import { resizeImage } from "@/lib/image";

function emptyDay(n: number): TourDay {
  return { day_no: n, route_vn: "", route_cn: "", meals: "", hotel: "", spots: [] };
}
function emptyDep(): Departure {
  return { month: "", dates: "", adult: 0, child: 0, infant: 0 };
}

function TourEditor() {
  const router = useRouter();
  const params = useSearchParams();
  const editCode = params.get("edit");
  const editing = Boolean(editCode);

  const [allSpots, setAllSpots] = useState<ScenicSpot[]>([]);
  const [code, setCode] = useState("");
  const [titleVn, setTitleVn] = useState("");
  const [titleCn, setTitleCn] = useState("");
  const [tagline, setTagline] = useState("");
  const [nights, setNights] = useState(4);
  const [airline, setAirline] = useState("");
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [cities, setCities] = useState("");
  const [hotels, setHotels] = useState("");
  const [includes, setIncludes] = useState("");
  const [excludes, setExcludes] = useState("");
  const [itinerary, setItinerary] = useState<TourDay[]>([emptyDay(1), emptyDay(2), emptyDay(3), emptyDay(4), emptyDay(5)]);
  const [departures, setDepartures] = useState<Departure[]>([emptyDep()]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { ensureSeeded(); setAllSpots(getAllSpots()); }, []);
  useCloudRefresh(() => setAllSpots(getAllSpots()));

  useEffect(() => {
    if (!editCode) return;
    const t = getTour(editCode);
    if (t) {
      setCode(t.code); setTitleVn(t.title_vn); setTitleCn(t.title_cn || ""); setTagline(t.tagline_vn || "");
      setNights(t.nights); setAirline(t.airline || ""); setCover(t.cover);
      setCities((t.cities || []).join(", ")); setHotels(t.hotels_note || "");
      setIncludes(t.includes || ""); setExcludes(t.excludes || "");
      setItinerary(t.itinerary.length ? t.itinerary : [emptyDay(1)]);
      setDepartures(t.departures.length ? t.departures : [emptyDep()]);
    }
  }, [editCode]);

  const map = useMemo(() => {
    const m: Record<string, ScenicSpot> = {};
    for (const s of allSpots) m[s.slug] = s;
    return m;
  }, [allSpots]);

  const input = "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";
  const label = "text-xs font-medium text-[var(--text-muted)]";

  function setDayCount(n: number) {
    const c = Math.max(1, Math.min(20, n || 1));
    setItinerary((prev) => {
      const next = prev.slice(0, c);
      while (next.length < c) next.push(emptyDay(next.length + 1));
      return next.map((d, i) => ({ ...d, day_no: i + 1 }));
    });
  }
  function patchDay(i: number, k: keyof TourDay, v: string) {
    setItinerary((prev) => prev.map((d, idx) => (idx === i ? { ...d, [k]: v } : d)));
  }
  function addSpotToDay(i: number, slug: string) {
    if (!slug) return;
    setItinerary((prev) => prev.map((d, idx) => (idx === i && !d.spots.includes(slug) ? { ...d, spots: [...d.spots, slug] } : d)));
  }
  function removeSpotFromDay(i: number, slug: string) {
    setItinerary((prev) => prev.map((d, idx) => (idx === i ? { ...d, spots: d.spots.filter((s) => s !== slug) } : d)));
  }

  function patchDep(i: number, k: keyof Departure, v: string) {
    setDepartures((prev) => prev.map((d, idx) => {
      if (idx !== i) return d;
      if (k === "adult" || k === "child" || k === "infant") return { ...d, [k]: Math.max(0, Number(v) || 0) };
      return { ...d, [k]: v };
    }));
  }
  function addDep() { setDepartures((p) => [...p, emptyDep()]); }
  function removeDep(i: number) { setDepartures((p) => p.filter((_, idx) => idx !== i)); }

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try { setCover(await resizeImage(f)); } finally { setBusy(false); }
  }

  const canSave = titleVn.trim().length > 0;

  function save() {
    if (!canSave) return;
    const finalCode = (editing && editCode) ? editCode : (code.trim() || slugify(titleVn).toUpperCase());
    const payload: Tour = {
      code: finalCode,
      title_vn: titleVn.trim(),
      title_cn: titleCn.trim() || undefined,
      tagline_vn: tagline.trim() || undefined,
      days: itinerary.length,
      nights: Math.max(0, nights),
      airline: airline.trim() || undefined,
      cover,
      cities: cities.split(",").map((c) => c.trim()).filter(Boolean),
      hotels_note: hotels.trim() || undefined,
      includes: includes.trim() || undefined,
      excludes: excludes.trim() || undefined,
      itinerary: itinerary.map((d, i) => ({ ...d, day_no: i + 1 })),
      departures: departures.filter((d) => d.month || d.dates || d.adult > 0),
    };
    if (editing && editCode) updateTour(editCode, payload);
    else addTour(payload);
    router.push("/tours");
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/tours" className="text-sm text-[var(--text-muted)] hover:underline">← Tour & Hành trình</Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{editing ? "Sửa tour mẫu" : "Tạo tour mẫu"}</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Chương trình tour đầy đủ: lịch trình theo ngày + bảng giá khởi hành.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <label className="block">
            <span className={label}>Tên tour (VN) *</span>
            <input value={titleVn} onChange={(e) => setTitleVn(e.target.value)} placeholder="VD: Thanh Đảo – Uy Hải – Bồng Lai 5N4Đ" className={input} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={label}>Tên tiếng Trung</span><input value={titleCn} onChange={(e) => setTitleCn(e.target.value)} className={input} /></label>
            <label className="block"><span className={label}>Mã tour {editing ? "(không đổi)" : ""}</span><input value={editing ? editCode || "" : code} onChange={(e) => setCode(e.target.value)} disabled={editing} placeholder="TD-5N4D" className={input + (editing ? " opacity-60" : "")} /></label>
          </div>
          <label className="block"><span className={label}>Tagline</span><input value={tagline} onChange={(e) => setTagline(e.target.value)} className={input} /></label>
          <label className="block"><span className={label}>Thành phố (cách nhau bằng dấu phẩy)</span><input value={cities} onChange={(e) => setCities(e.target.value)} placeholder="Thanh Đảo, Uy Hải, Bồng Lai" className={input} /></label>

          <h2 className="pt-2 font-semibold tracking-tight">Lịch trình theo ngày</h2>
          {itinerary.map((d, i) => (
            <div key={i} className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 items-center rounded-md bg-[var(--accent)] px-2 text-sm font-semibold text-white">N{i + 1}</span>
                <span className="text-sm text-[var(--text-muted)]">{d.spots.length} cảnh điểm</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block"><span className={label}>Lộ trình (VN)</span><input value={d.route_vn} onChange={(e) => patchDay(i, "route_vn", e.target.value)} placeholder="Hồ Chí Minh – Thanh Đảo" className={input} /></label>
                <label className="block"><span className={label}>Lộ trình (CN)</span><input value={d.route_cn || ""} onChange={(e) => patchDay(i, "route_cn", e.target.value)} className={input} /></label>
                <label className="block"><span className={label}>Ẩm thực</span><input value={d.meals} onChange={(e) => patchDay(i, "meals", e.target.value)} placeholder="Sáng · Trưa · Tối" className={input} /></label>
                <label className="block"><span className={label}>Lưu trú</span><input value={d.hotel} onChange={(e) => patchDay(i, "hotel", e.target.value)} placeholder="Uy Hải" className={input} /></label>
              </div>
              {d.spots.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.spots.map((slug) => (
                    <span key={slug} className="flex items-center gap-1.5 rounded-full border bg-[var(--muted)] py-1 pl-2 pr-1 text-xs">
                      {map[slug]?.name_vn ?? slug}
                      <button onClick={() => removeSpotFromDay(i, slug)} className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 hover:bg-rose-500 hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              )}
              <select value="" onChange={(e) => { addSpotToDay(i, e.target.value); e.target.value = ""; }}
                className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm text-[var(--text-muted)] outline-none focus:border-[var(--accent)]">
                <option value="">+ Thêm cảnh điểm vào ngày {i + 1}…</option>
                {allSpots.filter((s) => !d.spots.includes(s.slug)).map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name_vn}{s.city ? ` — ${s.city}` : ""}</option>
                ))}
              </select>
            </div>
          ))}

          <h2 className="pt-2 font-semibold tracking-tight">Bảng giá khởi hành <span className="text-sm font-normal text-[var(--text-muted)]">(CNY/khách)</span></h2>
          <div className="space-y-3">
            {departures.map((dep, i) => (
              <div key={i} className="rounded-xl border bg-white p-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                  <input value={dep.month} onChange={(e) => patchDep(i, "month", e.target.value)} placeholder="Tháng 9" className="rounded-lg border px-2 py-1.5 text-sm sm:col-span-1" />
                  <input value={dep.dates} onChange={(e) => patchDep(i, "dates", e.target.value)} placeholder="5, 6, 12, 13" className="rounded-lg border px-2 py-1.5 text-sm sm:col-span-2" />
                  <input type="number" min={0} value={dep.adult} onChange={(e) => patchDep(i, "adult", e.target.value)} placeholder="Người lớn" className="rounded-lg border px-2 py-1.5 text-sm" />
                  <input type="number" min={0} value={dep.child} onChange={(e) => patchDep(i, "child", e.target.value)} placeholder="Trẻ em" className="rounded-lg border px-2 py-1.5 text-sm" />
                  <div className="flex gap-1">
                    <input type="number" min={0} value={dep.infant} onChange={(e) => patchDep(i, "infant", e.target.value)} placeholder="Dưới 2" className="w-full rounded-lg border px-2 py-1.5 text-sm" />
                    <button onClick={() => removeDep(i)} title="Xóa dòng" className="shrink-0 rounded-lg border px-2 text-[var(--text-muted)] hover:bg-rose-50 hover:text-rose-600">×</button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addDep} className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-[var(--muted)]">+ Thêm dòng giá</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={label}>Bao gồm</span><textarea value={includes} onChange={(e) => setIncludes(e.target.value)} rows={3} className={input} /></label>
            <label className="block"><span className={label}>Không bao gồm</span><textarea value={excludes} onChange={(e) => setExcludes(e.target.value)} rows={3} className={input} /></label>
          </div>
          <label className="block"><span className={label}>Ghi chú khách sạn</span><input value={hotels} onChange={(e) => setHotels(e.target.value)} className={input} /></label>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border bg-white p-5">
          <div>
            <span className={label}>Ảnh bìa</span>
            <div className="mt-1 overflow-hidden rounded-xl border">
              {cover ? <img src={cover} alt="bìa" className="h-32 w-full object-cover" /> : <div className="flex h-32 w-full items-center justify-center bg-[var(--muted)] text-3xl text-slate-300">🖼</div>}
              <label className="block cursor-pointer border-t px-3 py-2 text-center text-sm text-[var(--accent)] hover:bg-[var(--muted)]">
                {busy ? "Đang xử lý…" : cover ? "Đổi ảnh" : "Tải ảnh lên"}
                <input type="file" accept="image/*" onChange={onPickCover} className="hidden" />
              </label>
            </div>
            {cover && <button onClick={() => setCover(undefined)} className="mt-1 w-full text-center text-xs text-rose-600 hover:underline">Xóa ảnh</button>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className={label}>Số ngày</span><input type="number" min={1} value={itinerary.length} onChange={(e) => setDayCount(Number(e.target.value))} className={input} /></label>
            <label className="block"><span className={label}>Số đêm</span><input type="number" min={0} value={nights} onChange={(e) => setNights(Math.max(0, Number(e.target.value)))} className={input} /></label>
          </div>
          <label className="block"><span className={label}>Hãng bay</span><input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Shandong Airlines" className={input} /></label>
          <button onClick={save} disabled={!canSave}
            className="w-full rounded-lg bg-[var(--text)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">
            {editing ? "Lưu thay đổi" : "Tạo tour"}
          </button>
          {!canSave && <p className="text-center text-xs text-[var(--text-muted)]">Cần tên tour</p>}
        </aside>
      </div>
    </main>
  );
}

export default function NewTourPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-12 text-sm text-[var(--text-muted)]">Đang tải…</div>}>
      <TourEditor />
    </Suspense>
  );
}
