"use client";

// Bang "SOAN BAO GIA" (mo tu nut o /requests):
// - Do ra chuong trinh tour ma khach yeu cau (canh diem tung ngay)
// - Admin them / bot canh diem theo y khach, chinh 3 muc gia
// - Tong tien tinh lai truc tiep theo so khach cua yeu cau
// - Bam "Gui bao gia" thi email voi noi dung + gia DA CHINH moi duoc gui

import { useMemo, useState } from "react";
import { getTour, getAllSpots, type QuoteRequest } from "@/lib/store";
import { pickDeparture, sendQuoteEmail, emailConfigured, type ComposedQuote } from "@/lib/emailQuote";
import { cny } from "@/lib/format";
import type { ScenicSpot } from "@/lib/types";

interface DayDraft {
  day_no: number;
  spots: string[]; // slug
}

export default function QuoteComposer({
  request,
  onClose,
  onSent,
}: {
  request: QuoteRequest;
  onClose: () => void;
  onSent: () => void;
}) {
  // Doc 1 lan luc mo bang (component chi mount sau khi admin bam nut)
  const [tour] = useState(() => getTour(request.tourCode));
  const [allSpots] = useState<ScenicSpot[]>(() =>
    [...getAllSpots()].sort((a, b) => a.name_vn.localeCompare(b.name_vn))
  );
  const dep = useMemo(
    () => (tour ? pickDeparture(tour, request.departureDate) : undefined),
    [tour, request.departureDate]
  );

  const [days, setDays] = useState<DayDraft[]>(() =>
    tour ? tour.itinerary.map((d) => ({ day_no: d.day_no, spots: [...d.spots] })) : []
  );
  const [adultPrice, setAdultPrice] = useState(dep?.adult ?? 0);
  const [childPrice, setChildPrice] = useState(dep?.child ?? 0);
  const [infantPrice, setInfantPrice] = useState(dep?.infant ?? 0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const spotMap = useMemo(() => {
    const m: Record<string, ScenicSpot> = {};
    for (const s of allSpots) m[s.slug] = s;
    return m;
  }, [allSpots]);

  function removeSpot(dayNo: number, slug: string) {
    setDays((ds) => ds.map((d) => (d.day_no === dayNo ? { ...d, spots: d.spots.filter((s) => s !== slug) } : d)));
  }
  function addSpot(dayNo: number, slug: string) {
    if (!slug) return;
    setDays((ds) =>
      ds.map((d) => (d.day_no === dayNo && !d.spots.includes(slug) ? { ...d, spots: [...d.spots, slug] } : d))
    );
  }

  const total =
    request.adults * adultPrice + request.children * childPrice + request.infants * infantPrice;

  async function send() {
    setError("");
    setSending(true);
    const composed: ComposedQuote = {
      days: days.map((d) => ({
        day_no: d.day_no,
        spotNames: d.spots.map((s) => spotMap[s]?.name_vn ?? s),
      })),
      adultPrice,
      childPrice,
      infantPrice,
    };
    const result = await sendQuoteEmail(request, tour, composed);
    setSending(false);
    if (result === "sent") onSent();
    else if (result === "mailto") onClose(); // da mo ung dung email cua admin voi noi dung soan san
    else setError("Gửi email thất bại — kiểm tra cấu hình EmailJS trong .env.local.");
  }

  const inputCls =
    "mt-1 w-full rounded-lg border bg-white px-2 py-2 text-sm outline-none focus:border-[var(--accent)]";

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Soạn báo giá</h2>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Gửi tới <b>{request.name}</b> · {request.email}
            </p>
          </div>
          <button onClick={onClose} aria-label="Đóng"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--muted)] hover:text-[var(--text)]">×</button>
        </div>

        {/* Thong tin tour khach muon */}
        <div className="mt-4 rounded-xl bg-[var(--muted)] p-3 text-sm">
          <div className="font-medium">{request.tourName}</div>
          <div className="mt-0.5 text-xs text-[var(--text-muted)]">
            {request.adults} NL{request.children > 0 ? ` · ${request.children} trẻ 2–11` : ""}{request.infants > 0 ? ` · ${request.infants} bé <2` : ""}
            {request.departureDate ? ` · KH mong muốn ${request.departureDate.split("-").reverse().join("/")}` : ""}
          </div>
          {request.note && <div className="mt-1 text-xs text-[var(--text-muted)]">Ghi chú của khách: “{request.note}”</div>}
        </div>

        {/* Lich trinh — dieu chinh canh diem */}
        {tour ? (
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Chương trình tham quan <span className="font-normal normal-case">(bấm × để bớt, chọn để thêm theo yêu cầu khách)</span>
            </div>
            <div className="mt-2 max-h-72 space-y-3 overflow-y-auto pr-1">
              {days.map((d) => (
                <div key={d.day_no} className="rounded-xl border p-3">
                  <div className="text-sm font-semibold text-[var(--accent)]">Ngày {d.day_no}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {d.spots.length === 0 && <span className="text-xs text-[var(--text-muted)]">(chưa có cảnh điểm)</span>}
                    {d.spots.map((slug) => (
                      <span key={slug} className="flex items-center gap-1 rounded-full border bg-white py-0.5 pl-2.5 pr-1 text-xs">
                        {spotMap[slug]?.name_vn ?? slug}
                        <button onClick={() => removeSpot(d.day_no, slug)} title="Bớt cảnh điểm này"
                          className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[10px] hover:bg-rose-500 hover:text-white">×</button>
                      </span>
                    ))}
                    <select value="" onChange={(e) => addSpot(d.day_no, e.target.value)}
                      className="rounded-full border bg-white px-2 py-0.5 text-xs text-[var(--text-muted)] outline-none hover:border-[var(--accent)]">
                      <option value="">+ thêm cảnh điểm…</option>
                      {allSpots.filter((s) => !d.spots.includes(s.slug)).map((s) => (
                        <option key={s.slug} value={s.slug}>{s.name_vn}{s.city ? ` · ${s.city}` : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Không tìm thấy tour "{request.tourCode}" — email sẽ chỉ gồm phần giá, không kèm lịch trình.
          </p>
        )}

        {/* Gia — dieu chinh */}
        <div className="mt-4 rounded-xl border bg-[var(--muted)] p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Điều chỉnh giá (¥/khách){dep?.month ? ` — gợi ý từ bảng giá ${dep.month}` : ""}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs text-[var(--text-muted)]">Người lớn × {request.adults}</span>
              <input type="number" min={0} value={adultPrice} onChange={(e) => setAdultPrice(Math.max(0, Number(e.target.value)))} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-xs text-[var(--text-muted)]">Trẻ 2–11 × {request.children}</span>
              <input type="number" min={0} value={childPrice} onChange={(e) => setChildPrice(Math.max(0, Number(e.target.value)))} className={inputCls} />
            </label>
            <label className="block">
              <span className="text-xs text-[var(--text-muted)]">Dưới 2 × {request.infants}</span>
              <input type="number" min={0} value={infantPrice} onChange={(e) => setInfantPrice(Math.max(0, Number(e.target.value)))} className={inputCls} />
            </label>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t pt-2">
            <span className="text-sm font-semibold">Tổng cộng</span>
            <span className="text-xl font-bold tabular-nums">{cny(total)}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">Hủy</button>
          <button onClick={() => void send()} disabled={sending}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
            {sending ? "Đang gửi…" : emailConfigured ? "✉ Gửi báo giá" : "✉ Mở email với nội dung đã soạn"}
          </button>
        </div>
      </div>
    </div>
  );
}
