"use client";

// Trang BINH LUAN (cong khai):
// - Tab "Danh gia tour": tong hop moi danh gia tour (doc tu bang reviews).
//   Viet danh gia van lam o trang chi tiet tung tour.
// - Tab "Cam nhan canh diem": nguoi dung da dang nhap viet bai ve canh diem
//   ho thich (bang spot_posts), hien thanh dong bai viet.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useUser, displayNameOf } from "@/lib/useUser";
import { useProfileInfo } from "@/lib/useRole";
import { getTours, getAllSpots, ensureSeeded } from "@/lib/store";
import { useCloudRefresh } from "@/lib/cloud";
import { spotImage } from "@/lib/data";
import type { Tour, ScenicSpot } from "@/lib/types";

interface Review {
  id: string; tour_code: string; user_id: string;
  author_name: string | null; rating: number; content: string; created_at: string;
}
interface SpotPost {
  id: string; spot_slug: string; user_id: string;
  author_name: string | null; content: string; created_at: string;
}

function fmt(iso: string) { return new Date(iso).toLocaleDateString("vi-VN"); }
function Stars({ n }: { n: number }) {
  return <span className="text-amber-500">{"★".repeat(n)}<span className="text-slate-300">{"★".repeat(5 - n)}</span></span>;
}

export default function ReviewsPage() {
  const { user } = useUser();
  const { role, status } = useProfileInfo();
  const [tab, setTab] = useState<"tours" | "spots">("tours");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<SpotPost[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [spots, setSpots] = useState<ScenicSpot[]>([]);
  const [loaded, setLoaded] = useState(false);

  // form viet cam nhan canh diem
  const [spotSlug, setSpotSlug] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function loadLocal() {
    ensureSeeded();
    setTours(getTours());
    setSpots(getAllSpots());
  }
  async function loadCloud() {
    if (!supabase) { setLoaded(true); return; }
    const [r, p] = await Promise.all([
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("spot_posts").select("*").order("created_at", { ascending: false }),
    ]);
    if (!r.error && r.data) setReviews(r.data as Review[]);
    if (!p.error && p.data) setPosts(p.data as SpotPost[]);
    setLoaded(true);
  }
  useEffect(() => { loadLocal(); void loadCloud(); }, []);
  useCloudRefresh(loadLocal);

  const spotMap = useMemo(() => {
    const m: Record<string, ScenicSpot> = {};
    for (const s of spots) m[s.slug] = s;
    return m;
  }, [spots]);
  const tourName = (code: string) => tours.find((t) => t.code === code)?.title_vn ?? code;
  const spotsSorted = useMemo(() => [...spots].sort((a, b) => a.name_vn.localeCompare(b.name_vn)), [spots]);

  const canWrite = Boolean(user) && status === "active";

  async function submitPost() {
    if (!supabase || !user) return;
    if (!spotSlug) { setError("Hãy chọn một cảnh điểm."); return; }
    if (!content.trim()) { setError("Hãy viết vài dòng cảm nhận."); return; }
    setError("");
    setBusy(true);
    const { error } = await supabase.from("spot_posts").insert({
      spot_slug: spotSlug,
      user_id: user.id,
      author_name: displayNameOf(user),
      content: content.trim(),
    });
    setBusy(false);
    if (error) { setError("Đăng bài thất bại — vui lòng thử lại."); return; }
    setContent(""); setSpotSlug("");
    void loadCloud();
  }
  async function delReview(id: string) {
    if (!supabase || !confirm("Xóa đánh giá này?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    void loadCloud();
  }
  async function delPost(id: string) {
    if (!supabase || !confirm("Xóa bài viết này?")) return;
    await supabase.from("spot_posts").delete().eq("id", id);
    void loadCloud();
  }

  if (!isSupabaseConfigured) {
    return <main className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-[var(--text-muted)]">Chức năng bình luận cần cấu hình Supabase.</main>;
  }

  const tabCls = (on: boolean) =>
    `flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${on ? "bg-[var(--text)] text-white" : "hover:bg-[var(--muted)]"}`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Bình luận & Cảm nhận</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Đánh giá của du khách về các tour và cảm nhận về những cảnh điểm yêu thích.
      </p>

      <div className="mt-6 flex rounded-lg border p-1">
        <button onClick={() => setTab("tours")} className={tabCls(tab === "tours")}>
          Đánh giá tour {reviews.length > 0 && <span className="opacity-70">({reviews.length})</span>}
        </button>
        <button onClick={() => setTab("spots")} className={tabCls(tab === "spots")}>
          Cảm nhận cảnh điểm {posts.length > 0 && <span className="opacity-70">({posts.length})</span>}
        </button>
      </div>

      {/* ---------- TAB: DANH GIA TOUR ---------- */}
      {tab === "tours" && (
        <div className="mt-6 space-y-4">
          {!loaded ? (
            <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-[var(--muted)] p-10 text-center text-sm text-[var(--text-muted)]">
              Chưa có đánh giá tour nào. Vào <Link href="/tours" className="text-[var(--accent)] hover:underline">trang tour</Link> để viết đánh giá đầu tiên.
            </div>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="group relative rounded-2xl border bg-white p-5">
                {(user?.id === r.user_id || role === "admin") && (
                  <button onClick={() => void delReview(r.id)} title="Xóa"
                    className="absolute right-3 top-3 hidden h-6 w-6 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50 group-hover:flex">×</button>
                )}
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{r.author_name || "Khách"}</span>
                  <Stars n={r.rating} />
                  <span className="text-xs text-[var(--text-muted)]">{fmt(r.created_at)}</span>
                </div>
                <Link href={`/tours/${encodeURIComponent(r.tour_code)}`}
                  className="mt-1 inline-block text-sm font-medium text-[var(--accent)] hover:underline">
                  {tourName(r.tour_code)} →
                </Link>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{r.content}</p>
              </article>
            ))
          )}
        </div>
      )}

      {/* ---------- TAB: CAM NHAN CANH DIEM ---------- */}
      {tab === "spots" && (
        <div className="mt-6">
          {/* Form viet */}
          {canWrite ? (
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-sm font-medium">Viết cảm nhận về một cảnh điểm bạn thích</div>
              <select value={spotSlug} onChange={(e) => setSpotSlug(e.target.value)}
                className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15">
                <option value="">— Chọn cảnh điểm —</option>
                {spotsSorted.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name_vn}{s.city ? ` · ${s.city}` : ""}</option>
                ))}
              </select>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3}
                placeholder="Điều gì khiến bạn thích cảnh điểm này?"
                className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15" />
              {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
              <button onClick={() => void submitPost()} disabled={busy}
                className="mt-3 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
                {busy ? "Đang đăng…" : "Đăng bài"}
              </button>
            </div>
          ) : user && status === "suspended" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              Tài khoản của bạn đang bị tạm ngưng nên không thể đăng bài.
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-[var(--muted)] p-5 text-sm text-[var(--text-muted)]">
              <Link href="/account" className="font-medium text-[var(--accent)] hover:underline">Đăng nhập / Đăng ký</Link> để viết cảm nhận về cảnh điểm bạn thích.
            </div>
          )}

          {/* Danh sach bai viet */}
          <div className="mt-5 space-y-4">
            {!loaded ? (
              <p className="text-sm text-[var(--text-muted)]">Đang tải…</p>
            ) : posts.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Chưa có bài cảm nhận nào — hãy là người đầu tiên!</p>
            ) : (
              posts.map((p) => {
                const s = spotMap[p.spot_slug];
                return (
                  <article key={p.id} className="group relative overflow-hidden rounded-2xl border bg-white">
                    {(user?.id === p.user_id || role === "admin") && (
                      <button onClick={() => void delPost(p.id)} title="Xóa"
                        className="absolute right-3 top-3 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow hover:bg-rose-50 group-hover:flex">×</button>
                    )}
                    <div className="flex gap-4 p-5">
                      {s && (
                        <img src={spotImage(s)} alt={s.name_vn}
                          className={s.image ? "h-20 w-24 shrink-0 rounded-lg object-cover" : "h-20 w-24 shrink-0 rounded-lg bg-[var(--muted)] object-contain p-2 opacity-70"} />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs text-[var(--text-muted)]">
                          <span className="font-semibold text-[var(--text)]">{p.author_name || "Khách"}</span> · {fmt(p.created_at)}
                        </div>
                        <div className="mt-0.5 text-sm font-medium">
                          {s ? s.name_vn : p.spot_slug}
                          {s?.city && <span className="text-[var(--text-muted)]"> · {s.city}</span>}
                        </div>
                        <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{p.content}</p>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}
    </main>
  );
}
