"use client";

import { useEffect, useRef, useState } from "react";
import { suggest } from "@/lib/search";

export default function SearchBox({
  query,
  setQuery,
  pool,
  placeholder = "Tìm kiếm…",
}: {
  query: string;
  setQuery: (s: string) => void;
  pool: Array<string | undefined>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const sugg = suggest(pool, query);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(s: string) {
    setQuery(s);
    setOpen(false);
    setHi(-1);
  }

  return (
    <div ref={ref} className="relative w-full sm:max-w-sm">
      <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/15">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--text-muted)]">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || sugg.length === 0) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, sugg.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
            else if (e.key === "Enter" && hi >= 0) { e.preventDefault(); choose(sugg[hi]); }
            else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} title="Xóa"
            className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text)]">×</button>
        )}
      </div>

      {open && sugg.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
          {sugg.map((s, i) => (
            <li key={s}>
              <button
                onMouseEnter={() => setHi(i)}
                onClick={() => choose(s)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${i === hi ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--text-muted)]">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="line-clamp-1">{s}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
