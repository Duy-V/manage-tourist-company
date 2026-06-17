export function cny(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " ¥";
}

// Cat noi dung theo so tu: giu toi da n tu, phan con lai thay bang "…"
export function truncateWords(s: string | undefined, n: number): string {
  const words = (s || "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= n) return s || "";
  return words.slice(0, n).join(" ") + "…";
}
