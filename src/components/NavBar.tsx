"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthControl from "./AuthControl";

const NAV = [
  { href: "/tours", label: "Tour & Hành trình" },
  { href: "/dashboard", label: "Cảnh điểm" },
  { href: "/quotes", label: "Báo giá" },
  { href: "/customers", label: "Khách hàng" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  // Bao cho ContactFab biet menu mobile dang mo de an no di
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("ry:menu", { detail: open }));
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[11px] font-bold text-white">睿</span>
          <span className="text-sm font-semibold tracking-tight">RUIYANG · Sơn Đông</span>
        </Link>

        {/* Desktop / tablet nav */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className="rounded-md px-3 py-1.5 text-[var(--text-muted)] transition hover:bg-[var(--muted)] hover:text-[var(--text)]">
              {n.label}
            </Link>
          ))}
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
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-[var(--text)] hover:bg-[var(--muted)]">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 border-t pt-3"><AuthControl /></div>
        </div>
      )}
    </header>
  );
}
