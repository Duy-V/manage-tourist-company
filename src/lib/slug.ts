// Chuan hoa ten thanh chuoi de SO SANH (bo dau, thuong hoa, khong co duoi
// ngau nhien). Dung de phat hien trung ten.
export function slugBase(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ dấu tiếng Việt
    .replace(/[đ]/g, "d")        // đ -> d
    .replace(/[Đ]/g, "d")        // Đ -> d
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Sinh slug lam ID: co them duoi ngau nhien de khong dung do.
// LUU Y: vi co duoi ngau nhien, KHONG dung slugify() de so trung ten
// (moi lan goi ra ket qua khac nhau) — dung slugBase().
export function slugify(s: string): string {
  return (slugBase(s) || "spot") + "-" + Math.random().toString(36).slice(2, 6);
}

// MA TOUR de quan ly: chu cai dau moi tu trong ten (bo dau, toi da 6 chu)
// + ngay tao DDMMYY. Vi du "THANH DAO" tao 02/01/2026 -> TD020126.
// Trung ma (cung ten viet tat, cung ngay) -> them duoi -2, -3...
export function makeTourCode(title: string, existingCodes: string[], date = new Date()): string {
  const initials = slugBase(title)
    .split("-")
    .filter((w) => /^[a-z]/.test(w)) // bo tu bat dau bang so (vd "5n4d")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 6) || "TOUR";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  const base = `${initials}${dd}${mm}${yy}`;
  const taken = new Set(existingCodes);
  let code = base;
  for (let n = 2; taken.has(code); n++) code = `${base}-${n}`;
  return code;
}
