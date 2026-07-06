"use client";

// Danh gia tour: ai cung doc duoc; chi tai khoan da xac thuc email
// (Supabase Auth) moi viet duoc. Du lieu doc/ghi truc tiep tu bang
// `reviews` tren Supabase (khong qua localStorage) — RLS dam bao moi
// nguoi chi sua/xoa duoc danh gia cua chinh minh.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useUser, displayNameOf } from "@/lib/useUser";

interface Review {
  id: string;
  tour_code: string;
  user_id: string;
  author_name: string | null;
  rating: number;
  content: string;
  created_at: string;
}

function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`text-amber-500 ${className}`} aria-label={`${n}/5 sao`}>
      {"★".repeat(n)}
      <span className="text-slate-300">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function TourReviews({ tourCode }: { tourCode: string }) {
  const { user } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("tour_code", tourCode)
      .order("created_at", { ascending: false });
    if (!error && data) setReviews(data as Review[]);
    setLoaded(true);
  }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tourCode]);

  if (!isSupabaseConfigured) return null;

  async function submit() {
    if (!supabase || !user) return;
    if (!content.trim()) { setError("Vui lòng viết vài dòng nhận xét."); return; }
    setError("");
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      tour_code: tourCode,
      user_id: user.id,
      author_name: displayNameOf(user),
      rating,
      content: content.trim(),
    });
    setBusy(false);
    if (error) { setError("Gửi đánh giá thất bại — vui lòng thử lại."); return; }
    setContent("");
    setRating(5);
    void load();
  }

  async function remove(id: string) {
    if (!supabase || !confirm("Xóa đánh giá này?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    void load();
  }

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Đánh giá</h2>
        {reviews.length > 0 && (
          <span className="text-sm text-[var(--text-muted)]">
            <b className="text-[var(--text)]">{avg}</b>/5 · {reviews.length} đánh giá
          </span>
        )}
      </div>

      {/* Form viet danh gia */}
      {user ? (
        <div className="mt-4 rounded-2xl border bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">{displayNameOf(user)}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} sao`}
                  className={`text-xl transition ${n <= rating ? "text-amber-500" : "text-slate-300 hover:text-amber-300"}`}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Chia sẻ trải nghiệm của bạn về tour này…"
            className="mt-3 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
          />
          {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
          <button
            onClick={() => void submit()}
            disabled={busy}
            className="mt-3 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Đang gửi…" : "Gửi đánh giá"}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed bg-[var(--muted)] p-5 text-sm text-[var(--text-muted)]">
          <Link href="/account" className="font-medium text-[var(--accent)] hover:underline">Đăng nhập / Đăng ký</Link>{" "}
          (xác thực qua email) để viết đánh giá về tour này.
        </div>
      )}

      {/* Danh sach danh gia */}
      <div className="mt-5 space-y-4">
        {!loaded ? (
          <p className="text-sm text-[var(--text-muted)]">Đang tải đánh giá…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Chưa có đánh giá nào — hãy là người đầu tiên!</p>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="group relative rounded-xl border bg-white p-4">
              {user?.id === r.user_id && (
                <button
                  onClick={() => void remove(r.id)}
                  title="Xóa đánh giá của bạn"
                  className="absolute right-3 top-3 hidden h-6 w-6 items-center justify-center rounded-full text-rose-600 hover:bg-rose-50 group-hover:flex"
                >×</button>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{r.author_name || "Khách"}</span>
                <Stars n={r.rating} className="text-sm" />
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(r.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--text)]">{r.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
