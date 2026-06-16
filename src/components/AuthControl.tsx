"use client";
import { useState } from "react";
import { login, logout } from "@/lib/auth";
import { useRole } from "@/lib/useRole";

export default function AuthControl() {
  const role = useRole();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  if (role === "admin") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">● Admin</span>
        <button onClick={logout} className="text-[var(--text-muted)] hover:text-[var(--text)]">Đăng xuất</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="rounded-md px-3 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--muted)] hover:text-[var(--text)]">
        Đăng nhập
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-60 rounded-xl border bg-white p-3 shadow-lg">
          <div className="text-xs font-medium text-[var(--text-muted)]">Đăng nhập admin</div>
          <input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Tài khoản"
            className="mt-2 w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]" />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mật khẩu"
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            className="mt-2 w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]" />
          {err && <p className="mt-1 text-xs text-rose-600">Sai tài khoản hoặc mật khẩu</p>}
          <button onClick={submit} className="mt-2 w-full rounded-lg bg-[var(--text)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
            Đăng nhập
          </button>
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">Demo: admin / admin123</p>
        </div>
      )}
    </div>
  );

  function submit() {
    if (login(user, pass)) { setOpen(false); setErr(false); setPass(""); }
    else setErr(true);
  }
}
