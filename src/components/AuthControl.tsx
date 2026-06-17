"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { login, logout } from "@/lib/auth";
import { useRole } from "@/lib/useRole";

export default function AuthControl() {
  const role = useRole();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Khoa cuon trang khi modal mo + dong bang phim Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (role === "admin") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">● Admin</span>
        <button onClick={logout} className="text-[var(--text-muted)] hover:text-[var(--text)]">Đăng xuất</button>
      </div>
    );
  }

  const modal = (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-24 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Đăng nhập admin</h2>
          <button onClick={() => setOpen(false)} aria-label="Đóng"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--muted)] hover:text-[var(--text)]">×</button>
        </div>

        <input value={user} autoFocus onChange={(e) => setUser(e.target.value)} placeholder="Tài khoản"
          className="mt-4 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15" />
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mật khẩu"
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15" />
        {err && <p className="mt-2 text-xs text-rose-600">Sai tài khoản hoặc mật khẩu</p>}
        <button onClick={submit}
          className="mt-3 w-full rounded-lg bg-[var(--text)] px-3 py-2 text-sm font-medium text-white hover:opacity-90">
          Đăng nhập
        </button>
        <p className="mt-2 text-center text-[11px] text-[var(--text-muted)]">Demo: admin / admin123</p>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => { setErr(false); setOpen(true); }}
        className="rounded-md px-3 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--muted)] hover:text-[var(--text)]">
        Đăng nhập
      </button>
      {open && mounted && createPortal(modal, document.body)}
    </>
  );

  function submit() {
    if (login(user, pass)) { setOpen(false); setErr(false); setPass(""); }
    else setErr(true);
  }
}
