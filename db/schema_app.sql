-- ============================================================
-- GHIEN DI — SCHEMA v3 (dong bo du lieu app)
-- 3 bang: canh diem + tour (admin tao/sua) va yeu cau bao gia (khach gui)
-- Cot `data` la jsonb chua nguyen object theo type trong src/lib/types.ts
-- va src/lib/store.ts, nen doi cau truc app khong can doi schema.
--
-- CACH DUNG:
-- 1) Supabase > SQL Editor > dan toan bo file nay > Run (chay lai nhieu lan duoc)
-- 2) Copy .env.local.example -> .env.local, dien URL + anon key
--    (Supabase > Project Settings > API)
-- 3) npm run dev — lan dau mo web, du lieu seed tren may se tu day len cloud
-- ============================================================

-- 1) CANH DIEM (ScenicSpot) ----------------------------------
create table if not exists app_spots (
  slug text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 2) TOUR / CHUONG TRINH (Tour) ------------------------------
create table if not exists app_tours (
  code text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 3) YEU CAU BAO GIA khach gui (QuoteRequest) ----------------
-- Cac cot name/phone/tour_name/status tach rieng de xem/loc ngay
-- trong Table Editor; du lieu day du van nam trong `data`.
create table if not exists quote_requests (
  id text primary key,
  name text,
  phone text,
  tour_name text,
  status text default 'new',        -- new | contacted | done
  data jsonb not null,
  created_at timestamptz default now()
);

-- 4) KHACH HANG CRM (Customer — admin theo doi cong ty, lien he,
--    tien do lam viec theo tuan). Cot phang de xem nhanh; du lieu
--    day du (ca mang progress) nam trong `data`.
create table if not exists app_customers (
  id text primary key,
  company text,
  contact_name text,
  contact_phone text,
  data jsonb not null,
  updated_at timestamptz default now()
);

-- 5) BAO GIA DA LUU (SavedQuote — admin tao va luu tu /quotes/new).
--    Cot phang de giam sat nhanh; du lieu day du nam trong `data`.
create table if not exists app_quotes (
  id text primary key,
  customer_name text,
  itinerary_name text,
  departure_date text,
  total int,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS ---------------------------------------------------------
-- App chua co dang nhap that (admin/admin123 chi o client) nen tam thoi
-- cho anon key doc/ghi tat ca. Khi nang cap Supabase Auth thi siet lai:
-- chi cho anon INSERT vao quote_requests + SELECT app_spots/app_tours.
alter table app_spots enable row level security;
alter table app_tours enable row level security;
alter table quote_requests enable row level security;
alter table app_customers enable row level security;
alter table app_quotes enable row level security;

drop policy if exists "anon all app_spots" on app_spots;
create policy "anon all app_spots" on app_spots
  for all using (true) with check (true);

drop policy if exists "anon all app_tours" on app_tours;
create policy "anon all app_tours" on app_tours
  for all using (true) with check (true);

drop policy if exists "anon all quote_requests" on quote_requests;
create policy "anon all quote_requests" on quote_requests
  for all using (true) with check (true);

drop policy if exists "anon all app_customers" on app_customers;
create policy "anon all app_customers" on app_customers
  for all using (true) with check (true);

drop policy if exists "anon all app_quotes" on app_quotes;
create policy "anon all app_quotes" on app_quotes
  for all using (true) with check (true);
