import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SPOTS, spotImage } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// Tạo sẵn HTML tĩnh cho tất cả cảnh điểm (Google đọc được ngay).
export function generateStaticParams() {
  return Object.keys(SPOTS).map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const s = SPOTS[slug];
  if (!s) return { title: "Không tìm thấy cảnh điểm" };
  const title = `${s.name_vn} — ${s.city}, Sơn Đông`;
  const desc = `${s.name_vn}${s.name_cn ? ` (${s.name_cn})` : ""} tại ${s.city}, Sơn Đông. ${s.description ?? ""} Khám phá cùng tour Ghiền Đi.`.trim();
  return {
    title,
    description: desc,
    alternates: { canonical: `/spots/${slug}` },
    openGraph: {
      title,
      description: s.description ?? title,
      url: `/spots/${slug}`,
      images: [s.image ?? "/logo.png"],
    },
  };
}

export default async function SpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SPOTS[slug];
  if (!s) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: s.name_vn,
    alternateName: s.name_cn,
    description: s.description,
    image: `${SITE_URL}${spotImage(s)}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: s.city,
      addressRegion: "Sơn Đông",
      addressCountry: "CN",
    },
    isAccessibleForFree: true,
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <nav className="text-sm text-[var(--text-muted)]">
        <Link href="/spots" className="hover:underline">Cảnh điểm</Link>
        <span className="px-1">/</span>
        <span>{s.city}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{s.name_vn}</h1>
      <p className="mt-1 text-[var(--text-muted)]">
        {s.name_cn ? `${s.name_cn} · ` : ""}{s.city}, Sơn Đông (Trung Quốc)
      </p>

      <img
        src={spotImage(s)}
        alt={`${s.name_vn} — ${s.city}, Sơn Đông`}
        className={s.image ? "mt-5 w-full rounded-2xl object-cover" : "mt-5 w-full rounded-2xl bg-[var(--muted)] object-contain p-12 opacity-70"}
      />

      {s.description && <p className="mt-5 text-lg leading-relaxed">{s.description}</p>}
      {s.highlight && <p className="mt-3 rounded-xl bg-[var(--muted)] px-4 py-3 text-sm">✨ {s.highlight}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tours" className="rounded-lg bg-[var(--text)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
          Xem tour Sơn Đông
        </Link>
        <Link href="/spots" className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-[var(--muted)]">
          ← Tất cả cảnh điểm
        </Link>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
