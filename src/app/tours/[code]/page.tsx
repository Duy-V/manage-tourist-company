import type { Metadata } from "next";
import TourDetailClient from "./TourDetailClient";

// Ghi chú: tên tour đang nằm trong localStorage nên server chưa đọc được để đặt tiêu đề động.
// Sau khi làm Việc 3 (render tour từ data.ts), sửa hàm này đọc tour thật để có title riêng từng tour.
export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params;
  const c = decodeURIComponent(code);
  return {
    title: `Tour Sơn Đông ${c}`,
    description: `Chi tiết chương trình tour Sơn Đông (${c}) của Ghiền Đi: lịch trình từng ngày, cảnh điểm và giá theo ngày khởi hành.`,
    alternates: { canonical: `/tours/${c}` },
    openGraph: { title: `Tour Sơn Đông ${c} — Ghiền Đi`, url: `/tours/${c}` },
  };
}

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  return <TourDetailClient params={params} />;
}
