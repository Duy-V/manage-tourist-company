import Link from "next/link";
import { TOURS } from "@/lib/data";
import { cny } from "@/lib/format";

export default function ToursPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Tour Sơn Đông</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{TOURS.length} chương trình · bay thẳng Shandong Airlines</p>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        {TOURS.map((t) => (
          <Link key={t.code} href={`/tours/${t.code}`}
            className="group overflow-hidden rounded-2xl border bg-white transition hover:shadow-md">
            <div className="relative h-56 overflow-hidden">
              <img src={t.cover} alt={t.title_vn} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">{t.days}N{t.nights}Đ</span>
            </div>
            <div className="p-5">
              <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{t.code}</div>
              <h3 className="mt-1 font-semibold tracking-tight">{t.title_vn}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t.tagline_vn}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.cities.map((c) => (
                  <span key={c} className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--text-muted)]">{c}</span>
                ))}
              </div>
              <p className="mt-4 text-sm">
                <span className="text-[var(--text-muted)]">Từ </span>
                <span className="font-semibold">{cny(Math.min(...t.departures.map((d) => d.adult)))}</span>
                <span className="text-[var(--text-muted)]"> /khách</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
