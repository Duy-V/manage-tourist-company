import Link from "next/link";
import { notFound } from "next/navigation";
import { getTour, SPOTS, TOURS } from "@/lib/data";
import { cny } from "@/lib/format";

export function generateStaticParams() {
  return TOURS.map((t) => ({ code: t.code }));
}

export default async function TourDetail({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const tour = getTour(code);
  if (!tour) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/tours" className="text-sm text-[var(--text-muted)] hover:underline">← Tất cả tour</Link>

      {/* Header */}
      <div className="mt-4 overflow-hidden rounded-2xl border">
        <div className="relative h-64">
          <img src={tour.cover} alt={tour.title_vn} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
          <div className="absolute bottom-0 p-6 text-white">
            <div className="text-sm text-white/80">{tour.title_cn}</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{tour.title_vn}</h1>
            <p className="mt-1 text-white/85">{tour.tagline_vn}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t bg-[var(--muted)] px-6 py-3 text-sm">
          <span><b>{tour.days}</b> ngày <b>{tour.nights}</b> đêm</span>
          <span>✈ {tour.airline}</span>
          <span className="text-[var(--text-muted)]">Từ <b className="text-[var(--text)]">{cny(Math.min(...tour.departures.map((d) => d.adult)))}</b>/khách</span>
          <Link href={`/quotes/new?tour=${tour.code}`} className="ml-auto rounded-lg bg-[var(--text)] px-4 py-1.5 font-medium text-white hover:opacity-90">
            Tạo báo giá tour này
          </Link>
        </div>
      </div>

      {/* Lịch trình theo ngày */}
      <h2 className="mt-10 text-xl font-semibold tracking-tight">Lịch trình</h2>
      <div className="mt-5 space-y-5">
        {tour.itinerary.map((d) => (
          <div key={d.day_no} className="rounded-xl border bg-white p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="flex h-8 items-center rounded-md bg-[var(--accent)] px-2.5 text-sm font-semibold text-white">N{d.day_no}</span>
              <h3 className="font-semibold tracking-tight">{d.route_vn}</h3>
              <span className="text-sm text-[var(--text-muted)]">{d.route_cn}</span>
            </div>

            {/* Cảnh điểm trong ngày */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {d.spots.map((slug) => {
                const s = SPOTS[slug];
                if (!s) return null;
                return (
                  <div key={slug} className="overflow-hidden rounded-lg border">
                    {s.image ? (
                      <img src={s.image} alt={s.name_vn} className="h-24 w-full object-cover" />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center bg-[var(--muted)] text-2xl">⛰</div>
                    )}
                    <div className="p-2">
                      <div className="text-xs font-medium leading-tight">{s.name_vn}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{s.name_cn}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--text-muted)]">
              <span><span className="text-slate-400">Ẩm thực:</span> {d.meals}</span>
              <span><span className="text-slate-400">Lưu trú:</span> {d.hotel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bảng giá */}
      <h2 className="mt-10 text-xl font-semibold tracking-tight">Giá theo ngày khởi hành <span className="text-sm font-normal text-[var(--text-muted)]">(CNY/khách)</span></h2>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-[var(--muted)] text-left text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-2.5 font-medium">Tháng</th>
              <th className="px-4 py-2.5 font-medium">Ngày khởi hành</th>
              <th className="px-4 py-2.5 text-right font-medium">Người lớn</th>
              <th className="px-4 py-2.5 text-right font-medium">Trẻ 2–11</th>
              <th className="px-4 py-2.5 text-right font-medium">Dưới 2</th>
            </tr>
          </thead>
          <tbody>
            {tour.departures.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2.5 font-medium">{d.month}</td>
                <td className="px-4 py-2.5 text-[var(--text-muted)]">{d.dates}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{cny(d.adult)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{cny(d.child)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{cny(d.infant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bao gồm / không bao gồm */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-emerald-700">Bao gồm</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{tour.includes}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-rose-700">Không bao gồm</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{tour.excludes}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--text-muted)]">Khách sạn tham khảo: {tour.hotels_note}</p>
    </main>
  );
}
