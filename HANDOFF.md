# TourQuote · Sơn Đông — Tóm tắt bàn giao (để tiếp tục code)

> Dán file này vào chat mới là đủ ngữ cảnh, không cần giải thích lại.

## 1. Dự án là gì
Web-app nội bộ **tạo báo giá tour Sơn Đông (Thanh Đảo)** cho công ty 睿扬旅游 (Ruiyang Travel),
khách Trung Quốc. Thay cho việc làm báo giá thủ công bằng Word/Excel.
Thư mục dự án: `C:\MY SKILLS\1.CODE\APP_RUIYANG`.

## 2. Stack & cách chạy
- **Next.js 15 (App Router) + TypeScript + Tailwind v3** (KHÔNG dùng next/font — dùng system font).
- Chạy: `npm run dev` → http://localhost:3000. **App chạy hoàn toàn bằng dữ liệu trong code, CHƯA cần Supabase.**
- PowerShell chặn npm? chạy `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` một lần.

## 3. ⚠ QUIRK MÔI TRƯỜNG QUAN TRỌNG
- Trên ổ này, **công cụ sửa file trực tiếp hay bị CẮT CỤT file** (gây lỗi "Unterminated string literal").
  → Khi sửa file nên ghi lại **toàn bộ file** (hoặc ghi qua shell), rồi **type-check** lại.
- **Type-check thật:** `node node_modules/typescript/bin/tsc --noEmit` (npm registry bị chặn nên không cài thêm package được trong môi trường này; cài trên máy thật thì bình thường).
- Ổ này cũng chặn `git` (lock file) và một số `rm` → thao tác git làm trên máy thật.
- Trạng thái hiện tại: **tsc = 0 lỗi.**

## 4. Mô hình dữ liệu
Hiện app đọc trực tiếp từ `src/lib/data.ts` (nguồn chính). Có `db/schema.sql` (Supabase) tương đương để chuyển sau.
- `cities` → `scenic_spots` (cảnh điểm, có ảnh) → `tours` → `tour_days` (mỗi ngày có mảng `spot_slugs`) → `tour_departures` (giá NL/trẻ 2–11/dưới 2 theo tháng) → `quotes`.
- Đã seed **2 tour thật**: `TD-5N4D` (Thanh Đảo–Uy Hải–Bồng Lai) và `TD-TN-5N` (thêm Tế Nam), đủ lịch trình 5 ngày + giá CNY 4 tháng (9–12).
- 29 cảnh điểm; 16 ảnh thật đã copy & nén vào `public/images/spots` + 3 hero ở `public/images/hero`
  (nguồn: `C:\THUYDUONG\SẢN PHẨM\CANH ĐIỂM\HÌNH ẢNH THỰC TẾ`).

## 5. Dữ liệu người dùng tạo = localStorage (chưa có backend)
File `src/lib/store.ts` (key: `tq_spots`, `tq_itineraries`, `tq_quotes`):
- Cảnh điểm: `getUserSpots/getAllSpots/addSpot/updateSpot/deleteUserSpot/getUserSpot/spotMap`
- Hành trình: `getItineraries/getItinerary/addItinerary/updateItinerary/deleteItinerary/countSpots` (type `Itinerary`, có `cover?`)
- Báo giá: `getQuotes/addQuote/deleteQuote` (type `SavedQuote`)
Ảnh upload được resize client-side (`src/lib/image.ts`) → lưu dataURL.

## 6. Vai trò / auth (tạm, chưa thật)
- `src/lib/auth.ts` + `src/lib/useRole.ts` + `src/components/AuthControl.tsx`.
- Đăng nhập demo cố định: **admin / admin123** → role lưu localStorage (`tq_role`).
- Nút **Thêm / Sửa / Xóa** trên các thẻ + nút tạo mới CHỈ hiện khi role = admin.
- ⚠ Chưa bảo mật thật (mật khẩu hardcode client). Việc nâng cấp = Supabase Auth.

## 7. Các trang (routes)
- `/` trang chủ: hero ảnh thật + tour nổi bật + gallery cảnh điểm
- `/tours`, `/tours/[code]` : danh sách + chi tiết tour (lịch trình ngày + ảnh cảnh điểm + bảng giá + bao gồm/không)
- `/dashboard` : **Cảnh điểm** (seed + user), admin thêm/sửa/xóa
- `/spots/new` (+ `?edit=slug`) : **Form 1** tạo/sửa cảnh điểm (tên, tên TQ, thành phố, mô tả, ảnh)
- `/itineraries`, `/itineraries/new` (+ `?edit=id`) : **Form 2** builder hành trình (chọn số ngày, thêm cảnh điểm mỗi ngày, ảnh đại diện, giá) → thẻ hành trình (tên/số ngày/số cảnh điểm/giá)
- `/quotes`, `/quotes/new` : **Form 3** tạo báo giá (chọn tour + ngày KH + tên/email khách + số khách → tổng), lưu thành thẻ; thẻ có nút **⬇ Tải file Word**
- `/tour/new` : redirect → `/quotes/new`

## 8. Xuất Word
`src/lib/quoteDoc.ts` → `downloadQuoteDoc(tour, savedQuote, spotMap)` tạo file `.doc` (HTML tương thích Word),
song ngữ Việt/Trung theo mẫu docx gốc: tiêu đề, khách hàng, bảng lịch trình 5 ngày, bảng giá + tổng, bao gồm/không, KS tham khảo, header 睿扬旅游. KHÔNG cần thư viện ngoài.

## 9. Việc nên làm tiếp (gợi ý ưu tiên)
1. **Nối hành trình tự tạo → báo giá** (hiện báo giá chỉ chọn được 2 tour seed; cho chọn cả Itinerary).
2. **Chuyển localStorage → Supabase** (đa thiết bị, bền) + **Supabase Auth** thay login giả.
3. **Sửa thẻ hành trình/cảnh điểm seed** (hiện chỉ sửa được item do user tạo).
4. Xuất **PDF đẹp** (react-pdf) thay cho .doc nếu cần.
5. `git init` + commit trên máy thật (ổ sandbox chặn git).

## 10. Tham chiếu nghiệp vụ / kế hoạch
- Lịch sprint & dữ liệu giá gốc: `C:\Users\PC\Desktop\MY WORLD\TRACKING_LEARNING.xlsx`.
- Báo giá mẫu (đã dựng data theo đây): 2 file docx "THANH ĐẢO 5N4D" và "THANH ĐẢO–TẾ NAM".

## CẬP NHẬT 05/07 — Đồng bộ Supabase (yêu cầu báo giá + cảnh điểm + tour)
- **Kiến trúc:** localStorage = cache đọc nhanh, Supabase = nguồn chính. Chưa cấu hình `.env.local` → app chạy như cũ (local-only).
- **Bảng mới** (`db/schema_app.sql`, chạy trong Supabase SQL Editor): `app_spots` (slug + jsonb `data`), `app_tours` (code + jsonb `data`), `quote_requests` (id, name, phone, tour_name, status + jsonb `data`). RLS tạm cho anon full quyền (chưa có auth thật).
- **`src/lib/cloud.ts`:** push từng bản ghi (`pushSpotCloud/pushTourCloud/pushRequestCloud` + delete), `pullAllFromCloud()` kéo toàn bộ về localStorage (lần đầu bảng trống thì tự đẩy seed local lên), phát event `tq:cloud`; hook `useCloudRefresh(cb)` cho trang đọc lại.
- **`store.ts`:** add/update/delete của spot/tour/quote-request tự push cloud (riêng `addQuoteRequest` chỉ lưu local — form khách `QuoteRequestForm` tự `await pushRequestCloud` để báo lỗi trung thực khi gửi thất bại).
- **`CloudSync`** (mount trong `layout.tsx`): ensureSeeded + pullAll khi mở web. Trang `/requests` có nút "⟳ Làm mới" gọi lại pullAll.
- **Khách hàng CRM cũng đã đồng bộ** (bảng `app_customers`: id, company, contact_name, contact_phone + jsonb `data` chứa cả mảng progress).
- **Báo giá đã lưu cũng đồng bộ** (bảng `app_quotes`: id, customer_name, itinerary_name, departure_date, total + jsonb `data`; cover base64 bị lược khi đẩy lên cloud). → **TOÀN BỘ 5 loại dữ liệu đã trên Supabase.**
- **Ảnh = Supabase Storage** (`db/schema_storage.sql`, bucket public `images`): form upload (AutoForm cảnh điểm, cover tour) resize → `uploadImageCloud()` → chỉ lưu URL public (fallback dataURL khi chưa có cloud). `migrateDataUrlImages()` (CloudSync gọi sau pullAll) tự dọn ảnh base64 cũ còn sót lên Storage. `QuoteRequestForm` không copy cover base64 vào yêu cầu.

## CẬP NHẬT 07/07 (3) — Trang /reviews (bình luận tổng hợp) + cảm nhận cảnh điểm
- `schema_users.sql` thêm bảng `spot_posts` (spot_slug, user_id, author_name, content) + RLS giống reviews (đọc công khai; chỉ user active viết; sửa/xóa của mình; admin xóa bất kỳ). **Phải chạy lại schema** để có bảng này.
- `/reviews` (NavBar "Bình luận", công khai) 2 tab: "Đánh giá tour" (tổng hợp mọi review, link về tour, người viết/admin xóa được) + "Cảm nhận cảnh điểm" (form chọn cảnh điểm + viết cho user đã đăng nhập; danh sách bài kèm ảnh cảnh điểm). Đọc trực tiếp từ reviews/spot_posts; tên tour/cảnh điểm map từ getTours()/getAllSpots().

## CẬP NHẬT 07/07 (2) — Trang quản lý người dùng /users (admin)
- `profiles` thêm cột `status` ('active'|'suspended') + hàm `public.is_admin()` (security definer, tránh đệ quy RLS). Policies mới: chỉ đọc profile CỦA MÌNH, admin đọc/sửa/xóa tất cả (không còn lộ email công khai); admin xóa được review bất kỳ; user bị tạm ngưng bị RLS chặn viết review.
- `/users` (NavBar "Người dùng", adminOnly): danh sách tài khoản (tên, email, role, trạng thái, ngày tạo) + bình luận của từng người; nút Tạm ngưng/Mở lại, Cấp/Hạ quyền admin, Xóa tài khoản (= xóa profile + reviews; xóa hẳn login trong Dashboard > Authentication > Users), xóa từng bình luận (kiểm duyệt); thống kê tổng/mới 7 ngày/admin/tạm ngưng; không thao tác được lên chính mình.
- `useRole.ts` → thêm `useProfileInfo()` trả {role, status}; admin bị tạm ngưng mất quyền. TourReviews: admin xóa mọi review; user tạm ngưng thấy thông báo thay vì form. /account hiện badge Tạm ngưng.

## CẬP NHẬT 07/07 — Phân quyền bằng cột role (BỎ HẲN login demo admin/admin123)
- Admin và user **dùng chung form** `/account` (Supabase Auth). Quyền lấy từ cột `role` trong `profiles`: `'admin'` | `'user'` (mặc định). Cấp admin = sửa role trong Dashboard/SQL (client KHÔNG có policy update profiles → không tự nâng quyền được).
- `src/lib/useRole.ts` viết lại: đọc role từ profiles theo user đang đăng nhập (có cache theo uid); trả `"admin" | "user" | "viewer"`. Mọi trang check `useRole() === "admin"` giữ nguyên.
- ĐÃ XÓA: `src/lib/auth.ts` (login/logout demo, key tq_role) + AdminSection ở /account. Trang /account hiện badge "● Quản trị viên" / "Người dùng".
- ⚠ Để có admin đầu tiên: đăng ký + xác thực email → chạy `update profiles set role='admin' where email='...'` (dòng mẫu có sẵn cuối phần 1 trong `db/schema_users.sql`).

## CẬP NHẬT 06/07 (2) — Tài khoản người dùng thật + đánh giá tour
- **Supabase Auth** (`db/schema_users.sql`): đăng ký email + mật khẩu → Supabase gửi email xác thực → bấm link mới đăng nhập được. Bảng `profiles` (trigger tự tạo dòng khi đăng ký) + bảng `reviews` (RLS thật: ai cũng đọc, chỉ chủ tài khoản viết/sửa/xóa đánh giá của mình).
- Cần cấu hình 1 lần: Authentication > URL Configuration (Site URL = https://ghiendi.vercel.app; Redirect thêm http://localhost:3000/account + https://ghiendi.vercel.app/account). SMTP mặc định giới hạn ~2-4 email/giờ.
- Code: `src/lib/useUser.ts` (hook user + displayNameOf), `/account` (đăng nhập/đăng ký/đăng xuất, lỗi dịch tiếng Việt), `TourReviews.tsx` (sao + nhận xét, điểm TB, xóa của mình) gắn cuối trang `/tours/[code]`, NavBar có link "Đăng nhập"/tên user.
- Auth user này ĐỘC LẬP với login admin demo (tq_role) — admin vẫn admin/admin123.

## CẬP NHẬT 06/07 — Dropdown tour trong form yêu cầu + gửi giá qua email
- `QuoteRequestForm`: có **dropdown chọn tour** (mặc định = tour của trang, đổi được) + hiện giá tham khảo thấp nhất.
- `src/lib/emailQuote.ts`: tính giá từ `tour.departures` (ưu tiên đúng tháng khách muốn đi, không khớp thì lấy rẻ nhất) → soạn email báo giá song đầy đủ (đơn giá × số khách, tổng). Gửi qua **EmailJS REST** khi có `NEXT_PUBLIC_EMAILJS_*` trong .env.local; chưa có thì fallback `mailto:` mở ứng dụng email của admin.
- `/requests`: nút **"✉ Gửi giá qua email"** trên từng thẻ (disable khi khách không để email); gửi thành công → tự chuyển trạng thái "Đã liên hệ" + lưu `emailedAt` (hiện "Đã gửi giá lúc…").

## CẬP NHẬT 16/06 — Báo giá dựa trên hành trình
- `/quotes/new` GIỜ chọn **hành trình đã tạo** (không còn chọn 2 tour seed). Có **ô điền giá** NL/trẻ 2–11/dưới 2 (giá NL prefill từ `itinerary.price`, sửa được) + ngày khởi hành + số khách → tổng.
- `SavedQuote` (store.ts) đổi sang: `itineraryId, itineraryName, days, spotsCount, cover, customer..., departureDate, adult/child/infantPrice, total`.
- `quoteDoc.ts` `downloadQuoteDoc(quote, itinerary, spotMap)` dựng .doc từ hành trình (lịch trình theo ngày = danh sách cảnh điểm + bảng giá). 
- Lưu ý còn sót: nút "Tạo báo giá tour này" ở `/tours/[code]` vẫn trỏ `?tour=` (giờ bị bỏ qua, form mở với hành trình đầu tiên) — nên sửa/bỏ sau.
