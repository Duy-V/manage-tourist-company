"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useUser, displayNameOf } from "@/lib/useUser";
import { login as adminLogin, logout as adminLogout } from "@/lib/auth";
import { useRole } from "@/lib/useRole";

const inputCls =
  "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15";
const labelCls = "text-xs font-medium text-[var(--text-muted)]";

// Doi thong bao loi tieng Anh cua Supabase sang tieng Viet de hieu
function viError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return "Email hoặc mật khẩu không đúng.";
  if (/email not confirmed/i.test(msg)) return "Email chưa được xác thực — hãy mở hộp thư và bấm vào link xác thực trước.";
  if (/already registered/i.test(msg)) return "Email này đã đăng ký rồi — hãy chuyển sang Đăng nhập.";
  if (/at least 6 characters/i.test(msg)) return "Mật khẩu cần tối thiểu 6 ký tự.";
  if (/rate limit/i.test(msg)) return "Gửi email quá nhanh — vui lòng đợi vài phút rồi thử lại.";
  return msg;
}

// Dang nhap quan tri (noi bo) — truoc day la nut rieng tren NavBar,
// gop ve day de navbar chi con MOT nut dang nhap duy nhat.
function AdminSection() {
  const isAdmin = useRole() === "admin";
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  if (isAdmin) {
    return (
      <div className="mt-8 flex items-center justify-between rounded-xl border bg-white p-4 text-sm">
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">● Chế độ quản trị</span>
        <button onClick={adminLogout} className="text-[var(--text-muted)] hover:text-[var(--text)] hover:underline">
          Thoát quản trị
        </button>
      </div>
    );
  }

  function submit() {
    if (adminLogin(user, pass)) { setOpen(false); setErr(false); setUser(""); setPass(""); }
    else setErr(true);
  }

  return (
    <div className="mt-8 text-center">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:underline">
          Đăng nhập quản trị (nội bộ) →
        </button>
      ) : (
        <div className="rounded-xl border bg-white p-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Đăng nhập quản trị</span>
            <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">×</button>
          </div>
          <input value={user} autoFocus onChange={(e) => setUser(e.target.value)} placeholder="Tài khoản" className={inputCls} />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mật khẩu"
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }} className={inputCls} />
          {err && <p className="mt-2 text-xs text-rose-600">Sai tài khoản hoặc mật khẩu</p>}
          <button onClick={submit} className="mt-3 w-full rounded-lg bg-[var(--text)] px-3 py-2 text-sm font-medium text-white hover:opacity-90">
            Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  const { user, loading } = useUser();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center text-sm text-[var(--text-muted)]">
        Chức năng tài khoản cần cấu hình Supabase (.env.local).
      </main>
    );
  }
  if (loading) {
    return <main className="mx-auto max-w-md px-6 py-20 text-center text-sm text-[var(--text-muted)]">Đang tải…</main>;
  }

  // ---- Da dang nhap ----
  if (user) {
    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <div className="text-3xl">👤</div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">{displayNameOf(user)}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{user.email}</p>
          <p className="mt-3 text-sm text-emerald-700">✓ Tài khoản đã xác thực</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/tours" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]">
              Xem tour & đánh giá
            </Link>
            <button
              onClick={async () => { await supabase!.auth.signOut(); }}
              className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Đăng xuất
            </button>
          </div>
        </div>
        <AdminSection />
      </main>
    );
  }

  async function submit() {
    setError("");
    setNotice("");
    if (!email.trim() || !password) { setError("Vui lòng điền email và mật khẩu."); return; }
    if (password.length < 6) { setError("Mật khẩu cần tối thiểu 6 ký tự."); return; }
    setBusy(true);
    try {
      if (tab === "register") {
        const { data, error } = await supabase!.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: name.trim() || email.trim().split("@")[0] },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) setError(viError(error.message));
        else if (data.session) setNotice("Đăng ký thành công!"); // truong hop tat xac thuc email
        else setNotice(`Đã gửi email xác thực tới ${email.trim()}. Mở hộp thư (kiểm tra cả mục Spam) và bấm vào link để kích hoạt tài khoản, sau đó quay lại đăng nhập.`);
      } else {
        const { error } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
        if (error) setError(viError(error.message));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Tài khoản</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Đăng ký để lại đánh giá về các tour bạn đã trải nghiệm.
      </p>

      <div className="mt-6 flex rounded-lg border p-1 text-sm font-medium">
        <button
          onClick={() => { setTab("login"); setError(""); setNotice(""); }}
          className={`flex-1 rounded-md px-3 py-1.5 transition ${tab === "login" ? "bg-[var(--text)] text-white" : "hover:bg-[var(--muted)]"}`}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => { setTab("register"); setError(""); setNotice(""); }}
          className={`flex-1 rounded-md px-3 py-1.5 transition ${tab === "register" ? "bg-[var(--text)] text-white" : "hover:bg-[var(--muted)]"}`}
        >
          Đăng ký
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {tab === "register" && (
          <label className="block">
            <span className={labelCls}>Tên hiển thị</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Tên sẽ hiện kèm đánh giá của bạn" />
          </label>
        )}
        <label className="block">
          <span className={labelCls}>Email *</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="ban@email.com" />
        </label>
        <label className="block">
          <span className={labelCls}>Mật khẩu * <span className="font-normal">(tối thiểu 6 ký tự)</span></span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls}
            onKeyDown={(e) => { if (e.key === "Enter") void submit(); }} />
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {notice && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

        <button
          onClick={() => void submit()}
          disabled={busy}
          className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Đang xử lý…" : tab === "register" ? "Đăng ký & gửi email xác thực" : "Đăng nhập"}
        </button>
      </div>

      <AdminSection />
    </main>
  );
}
