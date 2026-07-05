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
