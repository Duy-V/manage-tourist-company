"use client";

// Trang quan tri NGUOI DUNG (chi admin):
// - Danh sach tai khoan: ten, email, role, trang thai, ngay tao + binh luan cua ho
// - Tam ngung / mo lai tai khoan (RLS chan nguoi bi ngung viet danh gia)
// - Cap / ha quyen admin
// - Xoa tai khoan (xoa profile + toan bo binh luan; login goc xoa han trong
//   Supabase Dashboard > Authentication > Users)
// - Kiem duyet: xoa binh luan bat ky

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { useRole } from "@/lib/useRole";
import { matches } from "@/lib/search";
import SearchBox from "@/components/SearchBox";

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  status: string;
  created_at: string;
}
interface ReviewRow {
  id: string;
  tour_code: string;
  user_id: string;
  rating: number;
  content: string;
  created_at: string;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN");
}

export default function UsersPage() {
  const { user: me } = useUser();
  const role = useRole();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);
    if (!p.error && p.data) setProfiles(p.data as ProfileRow[]);
    if (!r.error && r.data) setReviews(r.data as ReviewRow[]);
    setLoaded(true);
  }
  useEffect(() => {
    if (role === "admin") void load();
  }, [role]);

  const reviewsByUser = useMemo(() => {
    const m: Record<string, ReviewRow[]> = {};
    for (const r of reviews) (m[r.user_id] ??= []).push(r);
    return m;
  }, [reviews]);

  const pool = useMemo(() => {
    const p: Array<string | undefined> = [];
    for (const u of profiles) p.push(u.display_name ?? undefined, u.email ?? undefined);
    return p;
  }, [profiles]);

  const shown = profiles.filter((u) => matches([u.display_name ?? "", u.email ?? ""], q));

  if (role !== "admin") {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="text-sm text-[var(--text-muted)]">Trang này chỉ dành cho quản trị viên.</p>
        <Link href="/account" className="mt-3 inline-block rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
          Đăng nhập →
        </Link>
      </main>
    );
  }

  async function setStatus(u: ProfileRow, status: "active" | "suspended") {
    if (!supabase || busyId) return;
    setBusyId(u.id);
    const { error } = await supabase.from("profiles").update({ status }).eq("id", u.id);
    setBusyId(null);
    if (error) alert("Không cập nhật được — kiểm tra đã chạy schema_users.sql mới nhất chưa.");
    else void load();
  }

  async function setRole(u: ProfileRow, newRole: "admin" | "user") {
    if (!supabase || busyId) return;
    if (newRole === "admin" && !confirm(`Cấp quyền QUẢN TRỊ cho ${u.email}?`)) return;
    setBusyId(u.id);
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", u.id);
    setBusyId(null);
    if (error) alert("Không cập nhật được quyền.");
    else void load();
  }

  async function removeUser(u: ProfileRow) {
    if (!supabase || busyId) return;
    const n = reviewsByUser[u.id]?.length ?? 0;
    if (!confirm(`Xóa tài khoản ${u.email}?\n- Xóa hồ sơ + ${n} bình luận của họ khỏi web.\n(Xóa hẳn login gốc: Supabase Dashboard > Authentication > Users)`)) return;
    setBusyId(u.id);
    await supabase.from("reviews").delete().eq("user_id", u.id);
    const { error } = await supabase.from("profiles").delete().eq("id", u.id);
    setBusyId(null);
    if (error) alert("Không xóa được tài khoản.");
    else void load();
  }

  async function removeReview(id: string) {
    if (!supabase || !confirm("Xóa bình luận này?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    void load();
  }

  const total = profiles.length;
  const suspended = profiles.filter((u) => u.status === "suspended").length;
  const admins = profiles.filter((u) => u.role === "admin").length;
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const newThisWeek = profiles.filter((u) => new Date(u.created_at).getTime() > weekAgo).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Người dùng</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Tài khoản đã đăng ký (xác thực qua email) và bình luận của họ.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Stat label="Tổng tài khoản" value={total} />
          <Stat label="Mới 7 ngày" value={newThisWeek} />
          <Stat label="Quản trị viên" value={admins} />
          <Stat label="Đang tạm ngưng" value={suspended} warn={suspended > 0} />
        </div>
      </div>

      {profiles.length > 0 && (
        <div className="mt-5">
          <SearchBox query={q} setQuery={setQ} pool={pool} placeholder="Tìm theo tên hoặc email…" />
        </div>
      )}

      {!loaded ? (
        <p className="mt-10 text-sm text-[var(--text-muted)]">Đang tải danh sách…</p>
      ) : shown.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed bg-[var(--muted)] p-12 text-center text-sm text-[var(--text-muted)]">
          {q ? `Không tìm thấy tài khoản nào khớp "${q}".` : "Chưa có ai đăng ký tài khoản."}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {shown.map((u) => {
            const rs = reviewsByUser[u.id] ?? [];
            const isMe = me?.id === u.id;
            const suspendedU = u.status === "suspended";
            return (
              <article key={u.id} className={`rounded-2xl border bg-white p-5 ${suspendedU ? "opacity-80" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{u.display_name || "(chưa đặt tên)"}</span>
                  {u.role === "admin" && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">● Admin</span>
                  )}
                  {suspendedU && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">⏸ Tạm ngưng</span>
                  )}
                  {isMe && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">Bạn</span>}
                  <span className="ml-auto text-xs text-[var(--text-muted)]">Tạo lúc {fmtTime(u.created_at)}</span>
                </div>
                <div className="mt-0.5 text-sm text-[var(--text-muted)]">{u.email}</div>

                {/* Binh luan cua nguoi nay */}
                {rs.length > 0 && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    <div className="text-xs font-medium text-[var(--text-muted)]">{rs.length} bình luận</div>
                    {rs.map((r) => (
                      <div key={r.id} className="flex items-start gap-2 rounded-lg bg-[var(--muted)] p-2.5 text-sm">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                            <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                            <Link href={`/tours/${encodeURIComponent(r.tour_code)}`} className="hover:underline">{r.tour_code}</Link>
                            <span>{fmtTime(r.created_at)}</span>
                          </div>
                          <p className="mt-1 whitespace-pre-line">{r.content}</p>
                        </div>
                        <button onClick={() => void removeReview(r.id)} title="Xóa bình luận (kiểm duyệt)"
                          className="shrink-0 rounded-full px-2 text-rose-600 hover:bg-rose-50">×</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hanh dong */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-xs font-medium">
                  {suspendedU ? (
                    <button disabled={isMe || busyId === u.id} onClick={() => void setStatus(u, "active")}
                      className="rounded-lg border border-emerald-300 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40">
                      ▶ Mở lại tài khoản
                    </button>
                  ) : (
                    <button disabled={isMe || busyId === u.id} onClick={() => void setStatus(u, "suspended")}
                      title={isMe ? "Không thể tự tạm ngưng chính mình" : ""}
                      className="rounded-lg border border-amber-300 px-3 py-1.5 text-amber-700 hover:bg-amber-50 disabled:opacity-40">
                      ⏸ Tạm ngưng
                    </button>
                  )}
                  {u.role === "admin" ? (
                    <button disabled={isMe || busyId === u.id} onClick={() => void setRole(u, "user")}
                      title={isMe ? "Không thể tự hạ quyền chính mình" : ""}
                      className="rounded-lg border px-3 py-1.5 text-[var(--text-muted)] hover:bg-[var(--muted)] disabled:opacity-40">
                      Hạ quyền admin
                    </button>
                  ) : (
                    <button disabled={busyId === u.id} onClick={() => void setRole(u, "admin")}
                      className="rounded-lg border px-3 py-1.5 text-[var(--text-muted)] hover:bg-[var(--muted)] disabled:opacity-40">
                      ↑ Cấp quyền admin
                    </button>
                  )}
                  <button disabled={isMe || busyId === u.id} onClick={() => void removeUser(u)}
                    title={isMe ? "Không thể tự xóa chính mình" : ""}
                    className="ml-auto rounded-lg bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:opacity-40">
                    Xóa tài khoản
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-xs text-[var(--text-muted)]">
        💡 "Xóa tài khoản" gỡ hồ sơ + bình luận khỏi web (người đó không dùng được nữa). Muốn xóa hẳn
        email khỏi hệ thống đăng nhập: Supabase Dashboard → Authentication → Users → Delete user.
      </p>
    </main>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-2 ${warn ? "border-amber-300 bg-amber-50" : "bg-white"}`}>
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}
