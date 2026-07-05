-- ============================================================
-- GHIEN DI — SUPABASE STORAGE cho anh (bucket "images")
-- Anh upload (canh diem, anh bia tour) se luu thanh FILE o day,
-- app chi luu duong link public — khong con nhung base64 vao du lieu.
--
-- CACH DUNG: Supabase > SQL Editor > dan file nay > Run (chay lai duoc)
-- Neu buoc tao policy bao loi quyen (must be owner of table objects):
--   vao Dashboard > Storage > images > Policies va tao thu cong
--   4 policy (SELECT/INSERT/UPDATE/DELETE) voi dieu kien: bucket_id = 'images'
-- ============================================================

-- 1) Tao bucket cong khai "images" (doc anh khong can key)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- 2) Policy cho anon key doc/ghi anh trong bucket nay
drop policy if exists "anon read images"   on storage.objects;
drop policy if exists "anon upload images" on storage.objects;
drop policy if exists "anon update images" on storage.objects;
drop policy if exists "anon delete images" on storage.objects;

create policy "anon read images" on storage.objects
  for select using (bucket_id = 'images');

create policy "anon upload images" on storage.objects
  for insert with check (bucket_id = 'images');

create policy "anon update images" on storage.objects
  for update using (bucket_id = 'images') with check (bucket_id = 'images');

create policy "anon delete images" on storage.objects
  for delete using (bucket_id = 'images');
