import Link from "next/link";
import FeaturedItineraries from "@/components/FeaturedItineraries";
import FeaturedSpots from "@/components/FeaturedSpots";

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img src="/images/hero/thanh-dao-1.jpg" alt="Thanh Đảo"
          className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 py-20 text-white sm:gap-5 sm:py-28">
          <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            睿扬旅游 · Ruiyang Travel
          </span>
          <h1 className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl sm:leading-[1.05]">
            Báo giá tour Sơn Đông,<br />
            <span className="text-white/70">đẹp và nhất quán trong vài phút.</span>
          </h1>
          <p className="max-w-xl text-base text-white/80 sm:text-lg">
            Thanh Đảo · Uy Hải · Bồng Lai tiên cảnh · Tế Nam thành phố suối.
            Chọn tour, nhập thông tin khách — xuất báo giá ngay.
          </p>
          <div className="flex gap-3 pt-1">
            <Link href="/quotes/new" className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90">
              Tạo báo giá
            </Link>
            <Link href="/tours" className="rounded-lg border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10">
              Xem tour
            </Link>
          </div>
        </div>
      </section>

      {/* TOUR NỔI BẬT — lay tu Hanh trinh (toi da 2) */}
      <FeaturedItineraries />

      {/* CẢNH ĐIỂM THỰC TẾ — lay tu store (toi da 12) */}
      <FeaturedSpots />
    </main>
  );
}
