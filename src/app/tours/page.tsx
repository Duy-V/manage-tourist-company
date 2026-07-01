import type { Metadata } from "next";
import ToursClient from "./ToursClient";

export const metadata: Metadata = {
  title: "Chương trình tour Sơn Đông",
  description:
    "Danh sách chương trình tour Sơn Đông Trung Quốc của Ghiền Đi: Thanh Đảo, Uy Hải, Yên Đài, Bồng Lai, Tế Nam. Xem lịch trình, cảnh điểm và giá theo ngày khởi hành.",
  keywords: ["tour Sơn Đông", "tour Thanh Đảo", "chương trình tour Sơn Đông", "Ghiền Đi"],
  alternates: { canonical: "/tours" },
  openGraph: {
    title: "Chương trình tour Sơn Đông — Ghiền Đi",
    description: "Các tour Thanh Đảo, Uy Hải, Bồng Lai, Tế Nam.",
    url: "/tours",
  },
};

export default function Page() {
  return <ToursClient />;
}
