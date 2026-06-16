# TourQuote · Sơn Đông

Công cụ tạo báo giá tour nội bộ (Next.js 15 + TypeScript + Tailwind).
Dữ liệu dựng từ 2 báo giá thật: **Thanh Đảo 5N4Đ** và **Thanh Đảo – Tế Nam 5N4Đ**.

## Chạy
```bash
npm install     # nếu chưa
npm run dev
```
Mở http://localhost:3000. App chạy ngay bằng dữ liệu trong `src/lib/data.ts` — **không cần Supabase**.

## Trang
- `/`            Trang chủ: hero ảnh thật + tour nổi bật + gallery cảnh điểm
- `/tours`       Danh sách tour
- `/tours/[code]`Chi tiết tour: lịch trình theo ngày + cảnh điểm + bảng giá
- `/dashboard`   Thư viện cảnh điểm (nhóm theo thành phố)
- `/quotes/new`  **Tạo báo giá**: chọn tour + ngày khởi hành + tên/email khách + số khách → tổng → In/PDF

## Mô hình dữ liệu (db/schema.sql)
- `cities` → `scenic_spots` (cảnh điểm, có ảnh)
- `tours` → `tour_days` (lịch trình, mỗi ngày có mảng `spot_slugs`) → `tour_departures` (giá theo ngày khởi hành)
- `quotes` (báo giá do app tạo: tên KH, email, số khách, tổng)

## Ảnh
`public/images/spots` (cảnh điểm) + `public/images/hero` — copy & nén từ folder HÌNH ẢNH THỰC TẾ.

## Kết nối Supabase (tùy chọn, sau này)
Tạo `.env.local` + chạy `db/schema.sql` trong Supabase. Hiện app đọc trực tiếp `src/lib/data.ts` nên chưa bắt buộc.

## Bước tiếp theo
- Lưu báo giá vào bảng `quotes` (Supabase insert) thay vì chỉ in.
- Xuất PDF báo giá theo mẫu công ty (react-pdf) — song ngữ Việt/Trung.
