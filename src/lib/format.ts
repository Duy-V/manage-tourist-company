export function cny(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + " ¥";
}
