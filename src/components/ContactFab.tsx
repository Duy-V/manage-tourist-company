"use client";

import { useEffect, useState } from "react";

const PHONE = "0961457343";
const PHONE_PRETTY = "0961 457 343";
const ZALO_URL = "https://zalo.me/0961457343";

export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onMenu = (e: Event) => setMenuOpen(Boolean((e as CustomEvent).detail));
    window.addEventListener("ry:menu", onMenu);
    return () => window.removeEventListener("ry:menu", onMenu);
  }, []);

  // An nut khi menu mobile dang mo (tranh de len nut Dang nhap)
  if (menuOpen) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Cac lua chon - hien khi hover/bam */}
      <div className={`flex flex-col gap-2 transition-all duration-200 ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>
        <a
          href={`tel:${PHONE}`}
          className="flex items-center gap-2 rounded-full bg-[var(--accent)] py-2 pl-2 pr-4 text-white shadow-lg ring-1 ring-black/5 transition hover:bg-[var(--accent-dark)]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .55 3.4 1 1 0 0 1-.24 1z" fill="currentColor" />
            </svg>
          </span>
          <span className="text-sm font-semibold tabular-nums">{PHONE_PRETTY}</span>
        </a>

        <a
          href={ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#0068FF] py-2 pl-2 pr-4 text-white shadow-lg ring-1 ring-black/5 transition hover:brightness-95"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-[#0068FF]">Z</span>
          <span className="text-sm font-semibold">Zalo</span>
        </a>
      </div>

      {/* Nut tron chinh */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Liên hệ"
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xl ring-1 ring-black/5 transition hover:bg-[var(--accent-dark)]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .55 3.4 1 1 0 0 1-.24 1z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
