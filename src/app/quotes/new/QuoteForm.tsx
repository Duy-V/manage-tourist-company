"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTours, addQuote, updateQuote, getQuote, spotMap, getCustomers, ensureSeeded, type Customer } from "@/lib/store";
import { useCloudRefresh } from "@/lib/cloud";
import { useRole } from "@/lib/useRole";
import type { ScenicSpot, Tour, Departure } from "@/lib/types";
import { cny } from "@/lib/format";
import { slugify } from "@/lib/slug";

// ---- Chuong trinh chon de bao gia = Tour (khai niem duy nhat) ----
interface Program {
  code: string;
  name: string;
  days: { day_no: number; spots: string[] }[];
  cover?: string;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  departures: Departure[];
}
function progSpots(p: Program): number {
  return p.days.reduce((n, d) => n + d.spots.length, 0);
}
function tourToProgram(t: Tour): Program {
  const dep = t.departures.length
    ? t.departures.reduce((a, b) => (b.adult < a.adult ? b : a))
    : undefined;
  return {
    code: t.code,
    name: t.title_vn,
    days: t.itinerary.map((d) => ({ day_no: d.day_no, spots: d.spots })),
    cover: t.cover,
    adultPrice: dep?.adult ?? 0, childPrice: dep?.child ?? 0, infantPrice: dep?.infant ?? 0,
    departures: t.departures,
  };
}

// ---- Do lich khoi hanh cua tour thanh bang ngay dd/mm/yyyy ----
const VI_DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
interface DateOpt { iso: string; day: number; dow: string; }
interface MonthGroup { key: string; title: string; price?: number; opts: DateOpt[]; }
function monthNumFrom(s: string): number | null {
  const m = s.match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return n >= 1 && n <= 12 ? n : null;
}
function parseDays(s: string): number[] {
  return s
    .split(/[,\s/]+/)
    .map((x) => parseInt(x, 10))
    .filter((n) => !isNaN(n) && n >= 1 && n <= 31);
}
function isoToLabel(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function labelToIso(label: string): string | null {
  const m = label.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}
function expandDepartures(deps: Departure[]): MonthGroup[] {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const groups: MonthGroup[] = [];
  for (const dep of deps) {
    const mn = monthNumFrom(dep.month);
    const days = parseDays(dep.dates);
    if (mn === null || days.length === 0) continue;
    const year = mn >= cm ? cy : cy + 1;
    const mm = String(mn).padStart(2, "0");
    const opts: DateOpt[] = days.map((d) => {
      const dt = new Date(year, mn - 1, d);
      return { iso: `${year}-${mm}-${String(d).padStart(2, "0")}`, day: d, dow: VI_DOW[dt.getDay()] };
    });
    groups.push({ key: `${year}-${mm}`, title: `Tháng ${mn}/${year}`, price: dep.adult || undefined, opts });
  }
  groups.sort((a, b) => a.key.localeCompare(b.key));
  return groups;
}

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const editing = Boolean(editId);
  const isAdmin = useRole() === "admin";

  const [programs, setPrograms] = useState<Program[]>([]);
  const [map, setMap] = useState<Record<string, ScenicSpot>>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [code, setCode] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [dates, setDates] = useState<string[]>([]); // iso yyyy-mm-dd
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [adultPrice, setAdultPrice] = useState(0);
  const [childPrice, setChildPrice] = useState(0);
  const [infantPrice, setInfantPrice] = useState(0);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    ensureSeeded();
    const list = getTours().map(tourToProgram);
    setPrograms(list);
    setMap(spotMap());
    setCustomers(getCustomers().sort((a, b) => a.company.localeCompare(b.company)));
    if (editId) {
      const eq = getQuote(editId);
      if (eq) {
        setCode(eq.itineraryId);
        setCustomerId(eq.customerId || "");
        setDates((eq.departureDate || "").split(",").map((s) => labelToIso(s)).filter((x): x is string => !!x));
        setAdults(eq.adults); setChildren(eq.children); setInfants(eq.infants);
        setAdultPrice(eq.adultPrice); setChildPrice(eq.childPrice); setInfantPrice(eq.infantPrice);
        setNote(eq.note || "");
      }
      return;
    }
    const wanted = params.get("itinerary");
    const initial = (wanted && list.find((p) => p.code === wanted)) || list[0];
    if (initial) {
      setCode(initial.code);
      setAdultPrice(initial.adultPrice);
      setChildPrice(initial.childPrice);
      setInfantPrice(initial.infantPrice);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Sau khi dong bo cloud xong thi doc lai danh sach chuong trinh/canh diem/khach hang
  // (giu nguyen lua chon va gia dang dien do)
  useCloudRefresh(() => {
    setPrograms(getTours().map(tourToProgram));
    setMap(spotMap());
    setCustomers(getCustomers().sort((a, b) => a.company.localeCompare(b.company)));
  });

  const program = useMemo(() => programs.find((x) => x.code === code), [programs, code]);
  const customer = useMemo(() => customers.find((c) => c.id === customerId), [customers, customerId]);
  const dateGroups = useMemo(() => expandDepartures(program?.departures ?? []), [program]);
  const dateSet = useMemo(() => new Set(dates), [dates]);
  const sortedDates = useMemo(() => [...dates].sort(), [dates]);
  const departureText = sortedDates.map(isoToLabel).join(", ");

  function onSelect(newCode: string) {
    setCode(newCode);
    setDates([]); // ngay khoi hanh thuoc ve chuong trinh -> reset khi doi
    const p = programs.find((x) => x.code === newCode);
    if (p) {
      setAdultPrice(p.adultPrice);
      setChildPrice(p.childPrice);
      setInfantPrice(p.infantPrice);
    }
  }
  function toggleDate(iso: string) {
    setDates((prev) => (prev.includes(iso) ? prev.filter((x) => x !== iso) : [...prev, iso]));
  }

  const total = adults * adultPrice + children * childPrice + infants * infantPrice;
  const canSubmit = Boolean(program) && Boolean(customer) && adults + children + infants > 0;

  const inputCls =
    "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";
  const labelCls = "text-xs font-medium text-[var(--text-muted)]";

  if (!isAdmin) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">Trang này chỉ dành cho quản trị viên. Vui lòng đăng nhập admin.</p>
        <Link href="/tours" className="mt-3 inline-block rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">← Xem tour</Link>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">Chưa có chương trình nào để báo giá.</p>
        <Link href="/tour/new" className="mt-3 inline-block rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
          Tạo chương trình trước
        </Link>
      </div>
    );
  }

  if (submitted && program && customer) {
    return (
      <div className="mt-8">
        <div className="rounded-2xl border bg-white p-8 print:border-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Báo giá hành trình</div>
              <h2 className="mt-1 text-xl font-semibold">{program.name}</h2>
              <div className="text-sm text-[var(--text-muted)]">{program.days.length} ngày · {progSpots(program)} cảnh điểm</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">睿扬旅游 · GHIỀN ĐI</div>
              <div className="text-[var(--text-muted)]">{new Date().toLocaleDateString("vi-VN")}</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--muted)] p-4 text-sm">
              <div className="text-xs font-medium text-[var(--text-muted)]">Khách hàng</div>
              <div className="mt-1 font-medium">{customer.company}</div>
              {customer.contactName && <div className="text-[var(--text-muted)]">Người liên hệ: {customer.contactName}</div>}
              {customer.contactPhone && <div className="text-[var(--text-muted)]">ĐT: {customer.contactPhone}</div>}
              {customer.email && <div className="text-[var(--text-muted)]">{customer.email}</div>}
            </div>
            <div className="rounded-lg bg-[var(--muted)] p-4 text-sm">
              <div className="text-xs font-medium text-[var(--text-muted)]">Ngày khởi hành</div>
              <div className="mt-1 font-medium">{departureText || "(thỏa thuận)"}</div>
            </div>
          </div>

          <table className="mt-6 w-full text-sm">
            <thead className="border-b text-left text-[var(--text-muted)]">
              <tr><th className="py-2 font-medium">Hạng khách</th><th className="py-2 text-right font-medium">SL</th><th className="py-2 text-right font-medium">Đơn giá</th><th className="py-2 text-right font-medium">Thành tiền</th></tr>
            </thead>
            <tbody>
              <Row label="Người lớn" qty={adults} unit={adultPrice} />
              <Row label="Trẻ em 2–11" qty={children} unit={childPrice} />
              <Row label="Trẻ dưới 2" qty={infants} unit={infantPrice} />
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="py-3 text-right font-semibold">Tổng cộng</td>
                <td className="py-3 text-right text-lg font-bold tabular-nums">{cny(total)}</td>
              </tr>
            </tfoot>
          </table>
          {note && <p className="mt-4 text-sm text-[var(--text-muted)]">Ghi chú: {note}</p>}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 print:hidden">
          <button onClick={saveQuote} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">Lưu vào danh sách báo giá</button>
          <button onClick={() => window.print()} className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">In / Lưu PDF</button>
          <button onClick={() => setSubmitted(false)} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">Sửa lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        {/* Chon chuong trinh */}
        <label className="block">
          <span className={labelCls}>Hành trình</span>
          <select value={code} onChange={(e) => onSelect(e.target.value)} className={inputCls}>
            {programs.map((p) => (
              <option key={p.code} value={p.code}>{p.name} · {p.days.length} ngày</option>
            ))}
          </select>
        </label>

        {/* Preview chuong trinh da chon */}
        {program && (
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              {program.cover ? (
                <img src={program.cover} alt={program.name} className="h-14 w-20 rounded-md object-cover" />
              ) : (
                <div className="flex h-14 w-20 items-center justify-center rounded-md bg-[var(--muted)] text-xl">🗺</div>
              )}
              <div>
                <div className="font-medium">{program.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{program.days.length} ngày · {progSpots(program)} cảnh điểm</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t pt-3">
              {program.days.map((d) => (
                <div key={d.day_no} className="flex gap-2 text-xs">
                  <span className="shrink-0 font-medium text-[var(--accent)]">N{d.day_no}</span>
                  <span className="text-[var(--text-muted)] line-clamp-1">
                    {d.spots.length === 0 ? "—" : d.spots.map((s) => map[s]?.name_vn ?? s).join(" · ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chon khach hang */}
        {customers.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-[var(--muted)] p-4 text-sm">
            <p className="text-[var(--text-muted)]">Chưa có khách hàng nào trong danh sách.</p>
            <Link href="/customers/new" className="mt-2 inline-block rounded-lg border bg-white px-3 py-1.5 text-sm font-medium hover:bg-[var(--muted)]">
              + Thêm khách hàng
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            <label className="block">
              <span className={labelCls}>Khách hàng *</span>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputCls}>
                <option value="">— Chọn khách hàng —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.company}{c.contactName ? ` · ${c.contactName}` : ""}</option>
                ))}
              </select>
            </label>
            {customer && (
              <div className="rounded-lg bg-[var(--muted)] p-3 text-sm">
                <div className="font-medium">{customer.company}</div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {[customer.contactName, customer.contactPhone, customer.email].filter(Boolean).join(" · ") || "Không có thông tin liên hệ"}
                </div>
                <Link href={`/customers/new?edit=${customer.id}`} className="mt-1 inline-block text-xs text-[var(--accent)] hover:underline">Sửa thông tin →</Link>
              </div>
            )}
          </div>
        )}

        {/* Ngay khoi hanh - bang click chon nhieu ngay tu lich tour */}
        <div>
          <div className="flex items-center justify-between">
            <span className={labelCls}>Ngày khởi hành <span className="text-[var(--text-muted)]">(bấm chọn, có thể nhiều ngày)</span></span>
            {dates.length > 0 && (
              <button type="button" onClick={() => setDates([])} className="text-xs text-[var(--text-muted)] hover:underline">Bỏ chọn hết</button>
            )}
          </div>

          {dateGroups.length === 0 ? (
            <div className="mt-1 rounded-lg border border-dashed bg-[var(--muted)] p-3 text-xs text-[var(--text-muted)]">
              Chương trình này chưa khai lịch khởi hành. Thêm lịch ở phần sửa chương trình để chọn ngày.
            </div>
          ) : (
            <div className="mt-1 space-y-3">
              {dateGroups.map((g) => (
                <div key={g.key} className="rounded-xl border bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{g.title}</div>
                    {g.price ? <div className="text-xs text-[var(--text-muted)]">Từ {cny(g.price)}/khách</div> : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.opts.map((o) => {
                      const on = dateSet.has(o.iso);
                      return (
                        <button
                          key={o.iso}
                          type="button"
                          onClick={() => toggleDate(o.iso)}
                          aria-pressed={on}
                          className={`flex w-11 flex-col items-center rounded-lg border py-1 text-xs transition ${on ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "bg-white hover:bg-[var(--muted)]"}`}
                        >
                          <span className={`text-[10px] ${on ? "opacity-90" : "text-[var(--text-muted)]"}`}>{o.dow}</span>
                          <span className="font-semibold tabular-nums">{String(o.day).padStart(2, "0")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {dates.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[var(--text-muted)]">Đã chọn {dates.length} ngày:</span>
              {sortedDates.map((iso) => (
                <span key={iso} className="flex items-center gap-1 rounded-full border bg-[var(--muted)] py-0.5 pl-2 pr-1 text-xs">
                  {isoToLabel(iso)}
                  <button type="button" onClick={() => toggleDate(iso)} className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 hover:bg-rose-500 hover:text-white">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Muc dien bao gia */}
        <div className="rounded-xl border bg-[var(--muted)] p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Điền báo giá (¥ / khách)</div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <PriceField label="Người lớn" value={adultPrice} setValue={setAdultPrice} />
            <PriceField label="Trẻ 2–11" value={childPrice} setValue={setChildPrice} />
            <PriceField label="Dưới 2" value={infantPrice} setValue={setInfantPrice} />
          </div>
        </div>

        {/* So khach */}
        <div className="grid grid-cols-3 gap-4">
          <NumField label="SL người lớn" value={adults} setValue={setAdults} />
          <NumField label="SL trẻ 2–11" value={children} setValue={setChildren} />
          <NumField label="SL dưới 2" value={infants} setValue={setInfants} />
        </div>

        <label className="block">
          <span className={labelCls}>Ghi chú</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={inputCls} placeholder="Yêu cầu riêng của khách…" />
        </label>
      </div>

      {/* Tong ket */}
      <aside className="h-fit rounded-2xl border bg-white p-5">
        <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Tạm tính</div>
        <div className="mt-3 space-y-2 text-sm">
          <Line label={`Người lớn × ${adults}`} val={adults * adultPrice} />
          <Line label={`Trẻ 2–11 × ${children}`} val={children * childPrice} />
          <Line label={`Dưới 2 × ${infants}`} val={infants * infantPrice} />
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t pt-3">
          <span className="font-semibold">Tổng</span>
          <span className="text-xl font-bold tabular-nums">{cny(total)}</span>
        </div>
        <button
          disabled={!canSubmit}
          onClick={() => setSubmitted(true)}
          className="mt-5 w-full rounded-lg bg-[var(--text)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Xuất báo giá
        </button>
        {!canSubmit && <p className="mt-2 text-center text-xs text-[var(--text-muted)]">Chọn hành trình + chọn khách hàng</p>}
      </aside>
    </div>
  );

  function saveQuote() {
    if (!program || !customer) return;
    const data = {
      customerId: customer.id,
      contactName: customer.contactName || undefined,
      contactPhone: customer.contactPhone || undefined,
      itineraryId: program.code,
      itineraryName: program.name,
      days: program.days.length,
      spotsCount: progSpots(program),
      cover: program.cover,
      customerName: customer.company,
      customerEmail: customer.email,
      departureDate: departureText,
      adults,
      children,
      infants,
      adultPrice,
      childPrice,
      infantPrice,
      total,
      note: note.trim() || undefined,
    };
    if (editing && editId) {
      updateQuote(editId, data);
    } else {
      addQuote({ id: slugify(customer.company) + "-" + Date.now().toString(36), createdAt: Date.now(), ...data });
    }
    router.push("/quotes");
  }
}

function Row({ label, qty, unit }: { label: string; qty: number; unit: number }) {
  if (qty <= 0) return null;
  return (
    <tr className="border-b border-dashed">
      <td className="py-2">{label}</td>
      <td className="py-2 text-right tabular-nums">{qty}</td>
      <td className="py-2 text-right tabular-nums">{cny(unit)}</td>
      <td className="py-2 text-right tabular-nums">{cny(qty * unit)}</td>
    </tr>
  );
}

function PriceField({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <input type="number" min={0} value={value}
        onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
        className="mt-1 w-full rounded-lg border bg-white px-2 py-2 text-sm outline-none focus:border-[var(--accent)]" />
    </label>
  );
}

function NumField({ label, value, setValue }: { label: string; value: number; setValue: (n: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
      <input type="number" min={0} value={value}
        onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
        className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]" />
    </label>
  );
}

function Line({ label, val }: { label: string; val: number }) {
  return (
    <div className="flex justify-between text-[var(--text-muted)]">
      <span>{label}</span><span className="tabular-nums">{cny(val)}</span>
    </div>
  );
}

export default function QuoteForm() {
  return (
    <Suspense fallback={<div className="mt-8 text-sm text-[var(--text-muted)]">Đang tải…</div>}>
      <Form />
    </Suspense>
  );
}
