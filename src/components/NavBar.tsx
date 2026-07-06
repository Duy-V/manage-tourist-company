"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthControl from "./AuthControl";
import { useRole } from "@/lib/useRole";
import { useUser, displayNameOf } from "@/lib/useUser";

const NAV: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: "/tours", label: "Tour" },
  { href: "/dashboard", label: "Cảnh điểm" },
  { href: "/quotes", label: "Báo giá" },
  { href: "/requests", label: "Yêu cầu", adminOnly: true },
  { href: "/customers", label: "Khách hàng", adminOnly: true },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const isAdmin = useRole() === "admin";
  const { user } = useUser();
  const nav = NAV.filter((n) => !n.adminOnly || isAdmin);
  const accountLabel = user ? `👤 ${displayNameOf(user)}` : "Đăng nhập";

  // Bao cho ContactFab biet menu mobile dang mo de an no di
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ry:menu", { detail: open }));
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
          <img src="/logo.png" alt="GHIỀN ĐI" className="h-10 w-10 rounded-full object-contain" />
          <span className="text-sm font-semibold tracking-tight">GHIỀN ĐI · Sơn Đông</span>
        </Link>

        {/* Desktop / tablet nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}
              className="rounded-md px-3 py-1.5 text-[var(--text-muted)] transition hover:bg-[var(--muted)] hover:text-[var(--text)]">
              {n.label}
            </Link>
          ))}
          <Link href="/account"
            className="rounded-md px-3 py-1.5 text-[var(--text-muted)] transition hover:bg-[var(--muted)] hover:text-[var(--text)]">
            {accountLabel}
          </Link>
          <div className="ml-2 border-l pl-2"><AuthControl /></div>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-[var(--text)] hover:bg-[var(--muted)] md:hidden"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="border-t bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-[var(--text)] hover:bg-[var(--muted)]">
                {n.label}
              </Link>
            ))}
            <Link href="/account" onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-[var(--text)] hover:bg-[var(--muted)]">
              {accountLabel}
            </Link>
          </nav>
          <div className="mt-3 border-t pt-3"><AuthControl /></div>
        </div>
      )}
    </header>
  );
}
