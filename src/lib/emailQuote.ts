// Gui bao gia qua email cho khach da de lai dia chi (dung o trang /requests).
// - Da cau hinh EmailJS (.env.local) -> gui TU DONG, khong can mo ung dung mail.
// - Chua cau hinh -> mo ung dung email cua admin voi noi dung soan san (mailto:).
// Gia duoc tinh tu bang gia tour: uu tien dung thang cua ngay khoi hanh khach
// mong muon; khong khop thang nao thi lay muc gia thap nhat.

import type { QuoteRequest } from "./store";
import type { Tour, Departure } from "./types";
import { cny } from "./format";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export const emailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

function monthNum(s: string): number | null {
  const m = s.match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return n >= 1 && n <= 12 ? n : null;
}
function isoToVN(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/** Chon muc gia phu hop: dung thang khach muon di, khong co thi re nhat. */
export function pickDeparture(tour: Tour, departureDate?: string): Departure | undefined {
  if (tour.departures.length === 0) return undefined;
  if (departureDate) {
    const m = departureDate.match(/^\d{4}-(\d{2})/);
    if (m) {
      const mn = parseInt(m[1], 10);
      const dep = tour.departures.find((d) => monthNum(d.month) === mn);
      if (dep) return dep;
    }
  }
  return tour.departures.reduce((a, b) => (b.adult < a.adult ? b : a));
}

export function buildQuoteEmail(r: QuoteRequest, tour: Tour | undefined) {
  const dep = tour ? pickDeparture(tour, r.departureDate) : undefined;
  const days = tour ? `${tour.days} ngày ${tour.nights} đêm` : "";

  const paxParts: string[] = [];
  if (r.adults > 0) paxParts.push(`${r.adults} người lớn`);
  if (r.children > 0) paxParts.push(`${r.children} trẻ em (2–11 tuổi)`);
  if (r.infants > 0) paxParts.push(`${r.infants} em bé (dưới 2 tuổi)`);

  const priceLines: string[] = [];
  let total = 0;
  if (dep) {
    if (r.adults > 0) { priceLines.push(`- Người lớn: ${cny(dep.adult)} × ${r.adults} = ${cny(dep.adult * r.adults)}`); total += dep.adult * r.adults; }
    if (r.children > 0) { priceLines.push(`- Trẻ em 2–11: ${cny(dep.child)} × ${r.children} = ${cny(dep.child * r.children)}`); total += dep.child * r.children; }
    if (r.infants > 0) { priceLines.push(`- Em bé dưới 2: ${cny(dep.infant)} × ${r.infants} = ${cny(dep.infant * r.infants)}`); total += dep.infant * r.infants; }
  }

  const subject = `[GHIỀN ĐI] Báo giá ${r.tourName}`;
  const body = [
    `Kính gửi ${r.name},`,
    ``,
    `GHIỀN ĐI xin gửi báo giá tour theo yêu cầu của quý khách:`,
    ``,
    `• Tour: ${r.tourName}${days ? ` (${days})` : ""}`,
    r.departureDate ? `• Ngày khởi hành mong muốn: ${isoToVN(r.departureDate)}` : null,
    `• Số khách: ${paxParts.join(", ")}`,
    ``,
    ...(dep
      ? [`Đơn giá (${dep.month ? `áp dụng ${dep.month}` : "tham khảo"}, CNY/khách):`, ...priceLines, ``, `TỔNG CỘNG: ${cny(total)}`]
      : [`Giá tour: vui lòng liên hệ để được tư vấn chi tiết.`]),
    r.note ? `` : null,
    r.note ? `Ghi chú của quý khách: ${r.note}` : null,
    ``,
    `Quý khách vui lòng phản hồi email này hoặc liên hệ 0961 457 343 (Zalo) để giữ chỗ.`,
    ``,
    `Trân trọng,`,
    `GHIỀN ĐI · Tour Sơn Đông`,
  ].filter((x): x is string => x !== null).join("\n");

  return { subject, body, hasPrice: Boolean(dep), total };
}

export type SendResult = "sent" | "mailto" | "error";

export async function sendQuoteEmail(r: QuoteRequest, tour: Tour | undefined): Promise<SendResult> {
  if (!r.email) return "error";
  const { subject, body } = buildQuoteEmail(r, tour);

  if (!emailConfigured) {
    // Fallback: mo ung dung email cua admin voi noi dung soan san
    window.location.href = `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return "mailto";
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        // Gui kem ca 2 bo ten bien de khop moi kieu template
        // ({{to_email}}/{{email}}, {{to_name}}/{{name}}, {{subject}}/{{title}})
        template_params: {
          to_email: r.email,
          email: r.email,
          to_name: r.name,
          name: r.name,
          subject,
          title: subject,
          message: body,
        },
      }),
    });
    return res.ok ? "sent" : "error";
  } catch {
    return "error";
  }
}
