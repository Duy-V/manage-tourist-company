-- ============================================================
-- TourQuote — SCHEMA v2 (mô hình tour theo lịch trình)
-- Dựng từ 2 báo giá thật: Thanh Đảo 5N4D & Thanh Đảo–Tế Nam 5N
-- Chạy toàn bộ trong Supabase > SQL Editor > Run
-- ============================================================
-- Reset (chạy lại được nhiều lần)
drop table if exists quotes cascade;
drop table if exists tour_departures cascade;
drop table if exists tour_days cascade;
drop table if exists tours cascade;
drop table if exists scenic_spots cascade;
drop table if exists cities cascade;

-- 1) THÀNH PHỐ / ĐỊA ĐIỂM ------------------------------------
create table cities (
  id serial primary key,
  slug text unique not null,
  name_vn text not null,
  name_cn text,
  region text
);

-- 2) CẢNH ĐIỂM -----------------------------------------------
create table scenic_spots (
  id serial primary key,
  slug text unique not null,
  name_vn text not null,
  name_cn text,
  city_slug text references cities(slug),
  description text,
  image_url text                 -- '/images/spots/xxx.jpg' hoặc null
);

-- 3) TOUR (sản phẩm) -----------------------------------------
create table tours (
  id serial primary key,
  code text unique not null,
  title_vn text not null,
  title_cn text,
  tagline_vn text,
  days int not null,
  nights int not null,
  airline text,
  cover_image text,
  hotels_note text,
  includes text,
  excludes text
);

-- 4) LỊCH TRÌNH THEO NGÀY (cảnh điểm mỗi ngày = mảng slug) ----
create table tour_days (
  id serial primary key,
  tour_id int references tours(id) on delete cascade,
  day_no int not null,
  route_vn text,
  route_cn text,
  meals text,
  hotel text,
  spot_slugs text[] default '{}',
  unique (tour_id, day_no)
);

-- 5) GIÁ THEO NGÀY KHỞI HÀNH ---------------------------------
create table tour_departures (
  id serial primary key,
  tour_id int references tours(id) on delete cascade,
  month text,
  departure_dates text,
  adult_price int,
  child_price int,               -- 2–11 tuổi
  infant_price int,              -- dưới 2 tuổi
  currency text default 'CNY'
);

-- 6) BÁO GIÁ (do app tạo) ------------------------------------
create table quotes (
  id serial primary key,
  tour_id int references tours(id),
  customer_name text not null,
  customer_email text,
  departure_date text,
  num_adults int default 1,
  num_children int default 0,
  num_infants int default 0,
  adult_price int,
  child_price int,
  infant_price int,
  total int,
  currency text default 'CNY',
  note text,
  created_at timestamptz default now()
);

-- 7) RLS: đọc công khai catalog + cho phép tạo/đọc quote ------
alter table cities          enable row level security;
alter table scenic_spots    enable row level security;
alter table tours           enable row level security;
alter table tour_days       enable row level security;
alter table tour_departures enable row level security;
alter table quotes          enable row level security;

create policy "read cities"      on cities          for select using (true);
create policy "read spots"       on scenic_spots    for select using (true);
create policy "read tours"       on tours           for select using (true);
create policy "read days"        on tour_days       for select using (true);
create policy "read departures"  on tour_departures for select using (true);
create policy "read quotes"      on quotes          for select using (true);
create policy "insert quotes"    on quotes          for insert with check (true);

-- ============================================================
-- SEED
-- ============================================================
insert into cities (slug, name_vn, name_cn, region) values
('thanh-dao','Thanh Đảo','青岛','Sơn Đông'),
('yen-dai','Yên Đài','烟台','Sơn Đông'),
('uy-hai','Uy Hải','威海','Sơn Đông'),
('bong-lai','Bồng Lai','蓬莱','Sơn Đông'),
('te-nam','Tế Nam','济南','Sơn Đông'),
('na-huong-hai','Na Hương Hải','那香海','Sơn Đông');

insert into scenic_spots (slug, name_vn, name_cn, city_slug, description, image_url) values
('na-huong-hai','Bãi cát kim cương Na Hương Hải','那香海钻石沙滩','na-huong-hai','Bãi biển AAAA, cát mịn như kim cương','/images/spots/na-huong-hai.jpg'),
('tau-mac-can','Tàu Bruweisi (Tàu mắc cạn)','布鲁威斯号','uy-hai','Con tàu mắc cạn nổi tiếng để check-in','/images/spots/tau-mac-can.jpg'),
('nha-co-bien','Nhà cỏ biển Kim Thạch Loan','金石湾海草房','uy-hai','Khu nghệ thuật nhà cỏ ven biển','/images/spots/nha-co-bien.jpg'),
('han-lac-phuong','Phố Hàn Lạc Phường','韩乐坊','uy-hai','Phố ẩm thực - mua sắm sôi động','/images/spots/han-lac-phuong.jpg'),
('cong-hanh-phuc','Cổng Hạnh Phúc (Uy Hải Chi Môn)','幸福门','uy-hai','Cổng biểu tượng Uy Hải cao 45m','/images/spots/cong-hanh-phuc.jpg'),
('nui-yen-dai','Núi Yên Đài','烟台山','yen-dai','Công viên núi ba mặt giáp biển, 600 năm lịch sử','/images/spots/nui-yen-dai.webp'),
('quang-truong-praha','Quảng trường Praha','布拉格广场','yen-dai','Quảng trường phong cách châu Âu ở bến cá','/images/spots/quang-truong-praha.jpg'),
('vinh-mat-trang','Vịnh Mặt Trăng','月亮湾','yen-dai','Vịnh biển hình trăng khuyết','/images/spots/vinh-mat-trang.webp'),
('phao-dai-dong','Pháo đài Đông','东炮台','yen-dai','Pháo đài cổ, khu nuôi hải cẩu - sư tử biển',null),
('pho-bat-lo-duoc','Phố Bát Lộ Đuốc','火炬八街','yen-dai','Con phố tựa núi nhìn ra biển dài 843m',null),
('bat-tien-do','Bát Tiên Độ','八仙渡','bong-lai','Tiên cảnh Bồng Lai, văn hóa Đạo giáo Bát Tiên','/images/spots/bat-tien-do.webp'),
('tuong-bat-tien','Tượng Bát Tiên','八仙雕塑','bong-lai','Cụm tượng biểu tượng của Bồng Lai','/images/spots/tuong-bat-tien.webp'),
('truong-du-winery','Trang Dụ Castel Winery','张裕卡斯特酒庄','yen-dai','Lâu đài rượu vang nổi tiếng',null),
('so-thanh-ly','Sở Thành Lý','所城里','yen-dai','Phố cổ trong lòng Yên Đài',null),
('pho-phu-dung','Phố Phù Dung','芙蓉街','te-nam','Phố cổ đặc trưng giữa lòng Tế Nam','/images/spots/pho-phu-dung.webp'),
('ho-dai-minh','Hồ Đại Minh','大明湖','te-nam','"Minh châu Tuyền Thành", hồ tự nhiên từ suối','/images/spots/ho-dai-minh.webp'),
('suoi-bao-dot','Suối Báo Đột','趵突泉','te-nam','"Thiên hạ đệ nhất tuyền", suối 2000 năm','/images/spots/suoi-bao-dot.webp'),
('quang-truong-tuyen-thanh','Quảng trường Tuyền Thành','泉城广场','te-nam','Quảng trường trung tâm Tế Nam',null),
('suoi-hac-ho','Suối Hắc Hổ','黑虎泉','te-nam','Suối nước chảy qua đầu hổ đá',null),
('cau-tram-kieu','Cầu Trạm Kiều','栈桥','thanh-dao','Cây cầu biểu tượng của Thanh Đảo',null),
('nha-tho-cong-giao','Nhà thờ Công giáo Thanh Đảo','天主教堂','thanh-dao','Nhà thờ Gothic, điểm chụp ảnh nổi tiếng','/images/spots/nha-tho-cong-giao.jpg'),
('dai-bao-dao','Đại Bào Đảo','大鲍岛','thanh-dao','Khu phố cổ Thanh Đảo',null),
('quang-hung-ly','Quảng Hưng Lý','广兴里','thanh-dao','Khu phố lịch sử',null),
('bao-tang-bia','Bảo tàng Bia Thanh Đảo','青啤博物馆','thanh-dao','Bảo tàng bia Tsingtao trứ danh','/images/spots/bao-tang-bia.jpg'),
('quang-truong-ngu-tu','Quảng trường Ngũ Tứ','五四广场','thanh-dao','Quảng trường ven biển, biểu tượng "Ngọn gió tháng Năm"',null),
('trung-tam-dua-thuyen','Trung tâm đua thuyền Olympic','奥帆中心','thanh-dao','Bến du thuyền Olympic 2008',null),
('cho-dem-dai-dong','Chợ đêm Đài Đông','台东夜市','thanh-dao','Phố đi bộ - chợ đêm sầm uất','/images/spots/cho-dem-dai-dong.jpg'),
('cong-vien-sa-tu-khau','Công viên Sa Tử Khẩu','沙子口公园','thanh-dao','Công viên ven biển miễn phí',null),
('cong-vien-tieu-mach','Công viên Đảo Tiểu Mạch','小麦岛公园','thanh-dao','Đảo hình vòng, đồng cỏ ven biển',null);

-- TOUR A: Thanh Đảo 5N4D ------------------------------------
insert into tours (code,title_vn,title_cn,tagline_vn,days,nights,airline,cover_image,hotels_note,includes,excludes) values
('TD-5N4D',
 'Thanh Đảo – Uy Hải – Bồng Lai 5N4Đ',
 '时尚青岛 浪漫威海 仙境蓬莱 双飞往返5日游',
 'Thanh Đảo thời thượng · Uy Hải lãng mạn · Bồng Lai tiên cảnh',
 5,4,'Shandong Airlines','/images/hero/thanh-dao-1.jpg',
 'Khách sạn 4 sao: Khai Nguyên Hoa Kiều Yên Đài, Bạch Duyệt Đới Tư, Bách Nạp Thuỵ Đình Uy Hải, Mỹ Hào Lệ Trí, Cửu Long Thịnh, Holiday Inn Express Thanh Đảo… hoặc tương đương',
 'Phòng đôi tiêu chuẩn KS 4 sao toàn chuyến; 4 bữa sáng + 9 bữa chính (50 RMB/người); vé cổng điểm đến đầu tiên; xe du lịch máy lạnh 33–50 chỗ; HDV tiếng Việt + tiếng Trung; bảo hiểm trách nhiệm lữ hành.',
 'Phụ phí phòng đơn; bảo hiểm hàng không; chi phí do chậm/hủy chuyến, bất khả kháng; suối nước nóng chỉ gồm vé vào cửa; bảo hiểm du lịch cá nhân; visa.');

-- TOUR B: Thanh Đảo – Tế Nam 5N -----------------------------
insert into tours (code,title_vn,title_cn,tagline_vn,days,nights,airline,cover_image,hotels_note,includes,excludes) values
('TD-TN-5N',
 'Thanh Đảo – Uy Hải – Bồng Lai – Tế Nam 5N4Đ',
 '时尚青岛 浪漫威海 仙境蓬莱 泉城济南 双飞往返5日游',
 'Thanh Đảo · Uy Hải · Bồng Lai tiên cảnh · Tế Nam thành phố suối',
 5,4,'Shandong Airlines','/images/hero/thanh-dao-2.jpg',
 'Khách sạn 4 sao: Khai Nguyên Hoa Kiều Yên Đài, Bạch Duyệt Đới Tư, Bách Nạp Thuỵ Đình Uy Hải, Mỹ Hào Lệ Trí, Cửu Long Thịnh, Holiday Inn Express Thanh Đảo, Trung Hải Khải Ly Tế Nam… hoặc tương đương',
 'Phòng đôi tiêu chuẩn KS 4 sao toàn chuyến; 4 bữa sáng + 9 bữa chính (50 RMB/người); vé cổng điểm đến đầu tiên; xe máy lạnh 33–50 chỗ; HDV tiếng Việt + tiếng Trung; bảo hiểm trách nhiệm lữ hành.',
 'Phụ phí phòng đơn; bảo hiểm hàng không; chi phí bất khả kháng; suối nước nóng chỉ gồm vé vào cửa; visa nhập cảnh 150 CNY/người; gửi visa về VN 300 CNY/đoàn; bảo hiểm du lịch cá nhân.');

-- LỊCH TRÌNH TOUR A
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 1,'Hồ Chí Minh – Thanh Đảo – Yên Đài','胡志明-青岛-烟台','Sáng (nhẹ) · Tối','Yên Đài', array['tuong-bat-tien','bat-tien-do','truong-du-winery','so-thanh-ly'] from tours where code='TD-5N4D';
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 2,'Yên Đài – Uy Hải','烟台-威海','Sáng · Trưa · Tối','Uy Hải', array['nui-yen-dai','phao-dai-dong','vinh-mat-trang','quang-truong-praha','pho-bat-lo-duoc','han-lac-phuong'] from tours where code='TD-5N4D';
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 3,'Uy Hải – Na Hương Hải','威海-那香海','Sáng · Trưa · Tối','Uy Hải', array['cong-hanh-phuc','nha-co-bien','tau-mac-can','na-huong-hai'] from tours where code='TD-5N4D';
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 4,'Uy Hải – Thanh Đảo','威海-青岛','Sáng · Trưa · Tối','Thanh Đảo', array['cong-vien-sa-tu-khau','cong-vien-tieu-mach','quang-truong-ngu-tu','trung-tam-dua-thuyen','cho-dem-dai-dong'] from tours where code='TD-5N4D';
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 5,'Thanh Đảo – Hồ Chí Minh','青岛-胡志明','Sáng','—', array['cau-tram-kieu','nha-tho-cong-giao','dai-bao-dao','quang-hung-ly','bao-tang-bia'] from tours where code='TD-5N4D';

-- LỊCH TRÌNH TOUR B
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 1,'Hồ Chí Minh – Thanh Đảo – Na Hương Hải – Uy Hải','胡志明-青岛-那香海-威海','Sáng (nhẹ) · Tối','Uy Hải', array['na-huong-hai','tau-mac-can','nha-co-bien','han-lac-phuong'] from tours where code='TD-TN-5N';
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 2,'Uy Hải – Yên Đài – Bồng Lai','威海-烟台-蓬莱','Sáng · Trưa · Tối','Bồng Lai', array['cong-hanh-phuc','pho-bat-lo-duoc','quang-truong-praha','vinh-mat-trang','phao-dai-dong','nui-yen-dai'] from tours where code='TD-TN-5N';
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 3,'Bồng Lai – Tế Nam','蓬莱-济南','Sáng · Trưa · Tối','Tế Nam', array['bat-tien-do','tuong-bat-tien','pho-phu-dung'] from tours where code='TD-TN-5N';
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 4,'Tế Nam – Thanh Đảo','济南-青岛','Sáng · Trưa · Tối','Thanh Đảo', array['ho-dai-minh','suoi-bao-dot','quang-truong-tuyen-thanh','suoi-hac-ho','cho-dem-dai-dong'] from tours where code='TD-TN-5N';
insert into tour_days (tour_id, day_no, route_vn, route_cn, meals, hotel, spot_slugs)
select id, 5,'Thanh Đảo','青岛','Sáng','—', array['cau-tram-kieu','nha-tho-cong-giao','dai-bao-dao','bao-tang-bia','quang-truong-ngu-tu','trung-tam-dua-thuyen','cong-vien-sa-tu-khau'] from tours where code='TD-TN-5N';

-- GIÁ TOUR A (CNY)
insert into tour_departures (tour_id, month, departure_dates, adult_price, child_price, infant_price)
select id, t.m, t.d, t.a, t.c, 600 from tours, (values
 ('Tháng 9','5, 6, 12, 13, 19, 20',3980,3280),
 ('Tháng 10','10, 11, 17, 18, 24, 25, 31',3880,3280),
 ('Tháng 11','1, 7, 8, 14, 15, 21, 22, 28, 29',3780,3180),
 ('Tháng 12','5, 6, 12, 13, 19, 20, 26, 27',3780,3180)
) as t(m,d,a,c) where code='TD-5N4D';

-- GIÁ TOUR B (CNY)
insert into tour_departures (tour_id, month, departure_dates, adult_price, child_price, infant_price)
select id, t.m, t.d, t.a, t.c, 600 from tours, (values
 ('Tháng 9','5, 6, 12, 13, 19, 20',4180,3480),
 ('Tháng 10','10, 11, 17, 18, 24, 25, 31',4080,3480),
 ('Tháng 11','1, 7, 8, 14, 15, 21, 22, 28, 29',3980,3380),
 ('Tháng 12','5, 6, 12, 13, 19, 20, 26, 27',3980,3380)
) as t(m,d,a,c) where code='TD-TN-5N';

-- Kiểm tra: select code, (select count(*) from tour_days d where d.tour_id=t.id) ngay from tours t;
