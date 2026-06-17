"use client";

import { useEffect, useState } from "react";

export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    synth.cancel(); // dung cac the khac dang doc
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "vi-VN";
    const vi = synth.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith("vi"));
    if (vi) u.voice = vi;
    u.rate = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  }

  if (!supported) return null;

  return (
    <button
      onClick={toggle}
      title={speaking ? "Dừng đọc" : "Đọc nội dung"}
      className={
        "mt-2 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition " +
        (speaking
          ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "text-[var(--accent)] hover:bg-[var(--muted)]") +
        " " + className
      }
    >
      {speaking ? (
        <><span>⏹</span> Dừng</>
      ) : (
        <><span>🔊</span> Đọc</>
      )}
    </button>
  );
}
