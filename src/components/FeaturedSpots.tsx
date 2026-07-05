"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureSeeded, getAllSpots } from "@/lib/store";
import { useCloudRefresh } from "@/lib/cloud";
import type { ScenicSpot } from "@/lib/types";

export default function FeaturedSpots() {
  const [withImg, setWithImg] = useState<ScenicSpot[]>([]);

  function refresh() {
    setWithImg(getAllSpots().filter((s) => s.image));
  }
  useEffect(() => {
    ensureSeeded();
    refresh();
  }, []);
  useCloudRefresh(refresh);

  const spots = withImg.slice(0, 12);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-4">
      <h2 className="text-2xl font-semibold tracking-tight">Cảnh điểm thực tế</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Hình ảnh thật từ các điểm đến trong hành trình.</p>

      {spots.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-[var(--muted)] p-10 text-center text-sm text-[var(--text-muted)]">
          Chưa có cảnh điểm nào có hình ảnh.{" "}
          <Link href="/dashboard" className="text-[var(--accent)] hover:underline">Quản lý cảnh điểm →</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {spots.map((s) => (
              <Link key={s.slug} href={`/dashboard#spot-${s.slug}`} className="group relative block overflow-hidden rounded-xl border">
                <img src={s.image} alt={s.name_vn}
                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-105" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                  <div className="text-sm font-medium text-white">{s.name_vn}</div>
                  <div className="text-[11px] text-white/70">{s.name_cn} · {s.city}</div>
                </figcaption>
              </Link>
            ))}
          </div>
          {withImg.length > 12 && (
            <div className="mt-8 text-center">
              <Link href="/dashboard" className="inline-block rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-[var(--muted)]">
                Xem thêm cảnh điểm →
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
