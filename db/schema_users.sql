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
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "read profiles" on profiles;
create policy "read profiles" on profiles for select using (true);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

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

-- Chi nguoi da dang nhap (da xac thuc email) moi viet, va chi viet duoi ten minh
drop policy if exists "insert own review" on reviews;
create policy "insert own review" on reviews
  for insert with check (auth.uid() = user_id);

-- Chi duoc sua / xoa danh gia cua chinh minh
drop policy if exists "update own review" on reviews;
create policy "update own review" on reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own review" on reviews;
create policy "delete own review" on reviews
  for delete using (auth.uid() = user_id);
