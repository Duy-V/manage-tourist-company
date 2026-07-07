-- ============================================================
-- GHIEN DI — NGUOI DUNG (Supabase Auth) + DANH GIA TOUR
--
-- CACH DUNG:
-- 1) Supabase > SQL Editor > dan toan bo file nay > Run (chay lai duoc)
-- 2) Supabase > Authentication > URL Configuration:
--    - Site URL:                 https://ghiendi.vercel.app
--    - Additional Redirect URLs: http://localhost:3000/account
--                                https://ghiendi.vercel.app/account
-- 3) Xong! Dang ky = email + mat khau; Supabase TU GUI email xac thuc
--    (mac dinh "Confirm email" da bat). Danh sach nguoi dung xem o
--    Authentication > Users hoac bang `profiles` duoi day.
--
-- LUU Y: email xac thuc dung SMTP mac dinh cua Supabase, gioi han
-- ~2-4 email/gio (du de test). Khi dung that nhieu, vao
-- Authentication > Emails > SMTP Settings de noi SMTP rieng (Gmail/Resend).
-- ============================================================

-- 1) HO SO NGUOI DUNG (tu dong tao 1 dong moi khi co nguoi dang ky)
--    role: 'user' (mac dinh) | 'admin' — admin va user DUNG CHUNG form
--    dang nhap; quyen quan tri quyet dinh boi cot nay.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz default now()
);

-- Da lo chay ban cu? 2 dong nay bo sung cot con thieu, chay lai an toan.
alter table profiles add column if not exists role text not null default 'user';
alter table profiles add column if not exists status text not null default 'active';

alter table profiles enable row level security;

-- Ham kiem tra admin (security definer de tranh de quy RLS khi policy
-- cua chinh bang profiles can doc profiles)
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Doc: moi nguoi chi thay profile CUA MINH; admin thay tat ca
-- (khong con "read profiles using true" — tranh lo email nguoi dung)
drop policy if exists "read profiles" on profiles;
drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles
  for select using (auth.uid() = id);
drop policy if exists "admin read profiles" on profiles;
create policy "admin read profiles" on profiles
  for select using (public.is_admin());

-- KHONG cho user thuong sua profile (tranh tu nang role len admin).
drop policy if exists "update own profile" on profiles;

-- Admin duoc sua (tam ngung / mo lai / cap - ha quyen) va xoa profile
drop policy if exists "admin update profiles" on profiles;
create policy "admin update profiles" on profiles
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete profiles" on profiles;
create policy "admin delete profiles" on profiles
  for delete using (public.is_admin());

-- >>> PHONG ADMIN CHO CHINH BAN: sau khi dang ky + xac thuc email xong,
-- bo comment dong duoi (xoa 2 dau gach) roi Run de len quyen admin:
-- update profiles set role = 'admin' where email = 'duongvo0905@gmail.com';

-- Trigger: dang ky xong -> tu them vao profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- BACKFILL: tao ho so cho cac tai khoan da dang ky TRUOC KHI co trigger nay
-- (neu khong, ho co trong Authentication > Users nhung khong hien o trang /users).
-- Chay lai an toan (on conflict do nothing).
insert into public.profiles (id, email, display_name)
select u.id, u.email,
       coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
from auth.users u
on conflict (id) do nothing;

-- 2) DANH GIA TOUR (chi tai khoan da xac thuc moi duoc viet)
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  tour_code text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  rating int not null check (rating between 1 and 5),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists reviews_tour_idx on reviews (tour_code);

alter table reviews enable row level security;

-- Ai cung doc duoc danh gia
drop policy if exists "read reviews" on reviews;
create policy "read reviews" on reviews for select using (true);

-- Chi nguoi da dang nhap (da xac thuc email) VA khong bi tam ngung
-- moi viet duoc, va chi viet duoi ten minh
drop policy if exists "insert own review" on reviews;
create policy "insert own review" on reviews
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from profiles where id = auth.uid() and status = 'active')
  );

-- Chi duoc sua / xoa danh gia cua chinh minh
drop policy if exists "update own review" on reviews;
create policy "update own review" on reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own review" on reviews;
create policy "delete own review" on reviews
  for delete using (auth.uid() = user_id);

-- Admin kiem duyet: duoc xoa binh luan cua bat ky ai
drop policy if exists "admin delete reviews" on reviews;
create policy "admin delete reviews" on reviews
  for delete using (public.is_admin());

-- 3) BAI VIET CAM NHAN CANH DIEM (nguoi dung viet o trang /reviews)
create table if not exists spot_posts (
  id uuid primary key default gen_random_uuid(),
  spot_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists spot_posts_spot_idx on spot_posts (spot_slug);

alter table spot_posts enable row level security;

drop policy if exists "read spot_posts" on spot_posts;
create policy "read spot_posts" on spot_posts for select using (true);

-- Chi tai khoan da dang nhap + khong bi tam ngung moi viet, duoi ten minh
drop policy if exists "insert own spot_post" on spot_posts;
create policy "insert own spot_post" on spot_posts
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from profiles where id = auth.uid() and status = 'active')
  );

drop policy if exists "update own spot_post" on spot_posts;
create policy "update own spot_post" on spot_posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own spot_post" on spot_posts;
create policy "delete own spot_post" on spot_posts
  for delete using (auth.uid() = user_id);

drop policy if exists "admin delete spot_posts" on spot_posts;
create policy "admin delete spot_posts" on spot_posts
  for delete using (public.is_admin());
