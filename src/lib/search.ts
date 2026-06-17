// Chuan hoa: bo dau tieng Viet, đ->d, thuong hoa
export function norm(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

// Item co khop khong: bat ky truong nao chua tu khoa (khong dau)
export function matches(fields: Array<string | undefined>, q: string): boolean {
  const nq = norm(q);
  if (!nq) return true;
  return fields.some((f) => f && norm(f).includes(nq));
}

// Goi y tu khoa: cac cum tu trong pool co chua q,
// xep hang theo: bat dau bang q -> tan suat xuat hien nhieu -> ngan hon.
export function suggest(pool: Array<string | undefined>, q: string, limit = 7): string[] {
  const nq = norm(q);
  if (!nq) return [];
  const counts = new Map<string, { text: string; n: number }>();
  for (const raw of pool) {
    const t = (raw || "").trim();
    if (!t) continue;
    const key = norm(t);
    if (!key || !key.includes(nq)) continue;
    const cur = counts.get(key);
    if (cur) cur.n++;
    else counts.set(key, { text: t, n: 1 });
  }
  return [...counts.values()]
    .sort((a, b) => {
      const aS = norm(a.text).startsWith(nq) ? 1 : 0;
      const bS = norm(b.text).startsWith(nq) ? 1 : 0;
      if (aS !== bS) return bS - aS;
      if (a.n !== b.n) return b.n - a.n;
      return a.text.length - b.text.length;
    })
    .slice(0, limit)
    .map((x) => x.text);
}
