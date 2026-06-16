export type Role = "admin" | "viewer";
const KEY = "tq_role";

// Demo nội bộ: tài khoản admin cố định (chưa phải auth thật).
// Sau này thay bằng Supabase Auth. KHÔNG dùng cho dữ liệu nhạy cảm.
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export function getRole(): Role {
  if (typeof window === "undefined") return "viewer";
  return (localStorage.getItem(KEY) as Role) || "viewer";
}

export function login(user: string, pass: string): boolean {
  if (user.trim() === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem(KEY, "admin");
    window.dispatchEvent(new Event("tq-auth"));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.setItem(KEY, "viewer");
  window.dispatchEvent(new Event("tq-auth"));
}
