export function slugify(s: string): string {
  const base = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ dấu tiếng Việt
    .replace(/[đ]/g, "d")        // đ -> d
    .replace(/[Đ]/g, "d")        // Đ -> d
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (base || "spot") + "-" + Math.random().toString(36).slice(2, 6);
}
