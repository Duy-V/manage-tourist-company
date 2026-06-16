import type { ScenicSpot, Tour } from "./types";

export const SPOTS: Record<string, ScenicSpot> = {
  "na-huong-hai": { slug: "na-huong-hai", name_vn: "Bãi cát kim cương Na Hương Hải", name_cn: "那香海钻石沙滩", city: "Na Hương Hải", description: "Bãi biển AAAA, cát mịn như kim cương", image: "/images/spots/na-huong-hai.jpg" },
  "tau-mac-can": { slug: "tau-mac-can", name_vn: "Tàu Bruweisi (Tàu mắc cạn)", name_cn: "布鲁威斯号", city: "Uy Hải", description: "Con tàu mắc cạn nổi tiếng để check-in", image: "/images/spots/tau-mac-can.jpg" },
  "nha-co-bien": { slug: "nha-co-bien", name_vn: "Nhà cỏ biển Kim Thạch Loan", name_cn: "金石湾海草房", city: "Uy Hải", description: "Khu nghệ thuật nhà cỏ ven biển", image: "/images/spots/nha-co-bien.jpg" },
  "han-lac-phuong": { slug: "han-lac-phuong", name_vn: "Phố Hàn Lạc Phường", name_cn: "韩乐坊", city: "Uy Hải", description: "Phố ẩm thực - mua sắm sôi động", image: "/images/spots/han-lac-phuong.jpg" },
  "cong-hanh-phuc": { slug: "cong-hanh-phuc", name_vn: "Cổng Hạnh Phúc (Uy Hải Chi Môn)", name_cn: "幸福门", city: "Uy Hải", description: "Cổng biểu tượng Uy Hải cao 45m", image: "/images/spots/cong-hanh-phuc.jpg" },
  "nui-yen-dai": { slug: "nui-yen-dai", name_vn: "Núi Yên Đài", name_cn: "烟台山", city: "Yên Đài", description: "Công viên núi ba mặt giáp biển, 600 năm lịch sử", image: "/images/spots/nui-yen-dai.webp" },
  "quang-truong-praha": { slug: "quang-truong-praha", name_vn: "Quảng trường Praha", name_cn: "布拉格广场", city: "Yên Đài", description: "Quảng trường phong cách châu Âu ở bến cá", image: "/images/spots/quang-truong-praha.jpg" },
  "vinh-mat-trang": { slug: "vinh-mat-trang", name_vn: "Vịnh Mặt Trăng", name_cn: "月亮湾", city: "Yên Đài", description: "Vịnh biển hình trăng khuyết", image: "/images/spots/vinh-mat-trang.webp" },
  "phao-dai-dong": { slug: "phao-dai-dong", name_vn: "Pháo đài Đông", name_cn: "东炮台", city: "Yên Đài", description: "Pháo đài cổ, khu nuôi hải cẩu - sư tử biển" },
  "pho-bat-lo-duoc": { slug: "pho-bat-lo-duoc", name_vn: "Phố Bát Lộ Đuốc", name_cn: "火炬八街", city: "Yên Đài", description: "Con phố tựa núi nhìn ra biển dài 843m" },
  "bat-tien-do": { slug: "bat-tien-do", name_vn: "Bát Tiên Độ", name_cn: "八仙渡", city: "Bồng Lai", description: "Tiên cảnh Bồng Lai, văn hóa Đạo giáo Bát Tiên", image: "/images/spots/bat-tien-do.webp" },
  "tuong-bat-tien": { slug: "tuong-bat-tien", name_vn: "Tượng Bát Tiên", name_cn: "八仙雕塑", city: "Bồng Lai", description: "Cụm tượng biểu tượng của Bồng Lai", image: "/images/spots/tuong-bat-tien.webp" },
  "truong-du-winery": { slug: "truong-du-winery", name_vn: "Trang Dụ Castel Winery", name_cn: "张裕卡斯特酒庄", city: "Yên Đài", description: "Lâu đài rượu vang nổi tiếng" },
  "so-thanh-ly": { slug: "so-thanh-ly", name_vn: "Sở Thành Lý", name_cn: "所城里", city: "Yên Đài", description: "Phố cổ trong lòng Yên Đài" },
  "pho-phu-dung": { slug: "pho-phu-dung", name_vn: "Phố Phù Dung", name_cn: "芙蓉街", city: "Tế Nam", description: "Phố cổ đặc trưng giữa lòng Tế Nam", image: "/images/spots/pho-phu-dung.webp" },
  "ho-dai-minh": { slug: "ho-dai-minh", name_vn: "Hồ Đại Minh", name_cn: "大明湖", city: "Tế Nam", description: '"Minh châu Tuyền Thành", hồ tự nhiên từ suối', image: "/images/spots/ho-dai-minh.webp" },
  "suoi-bao-dot": { slug: "suoi-bao-dot", name_vn: "Suối Báo Đột", name_cn: "趵突泉", city: "Tế Nam", description: '"Thiên hạ đệ nhất tuyền", suối 2000 năm', image: "/images/spots/suoi-bao-dot.webp" },
  "quang-truong-tuyen-thanh": { slug: "quang-truong-tuyen-thanh", name_vn: "Quảng trường Tuyền Thành", name_cn: "泉城广场", city: "Tế Nam", description: "Quảng trường trung tâm Tế Nam" },
  "suoi-hac-ho": { slug: "suoi-hac-ho", name_vn: "Suối Hắc Hổ", name_cn: "黑虎泉", city: "Tế Nam", description: "Suối nước chảy qua đầu hổ đá" },
  "cau-tram-kieu": { slug: "cau-tram-kieu", name_vn: "Cầu Trạm Kiều", name_cn: "栈桥", city: "Thanh Đảo", description: "Cây cầu biểu tượng của Thanh Đảo" },
  "nha-tho-cong-giao": { slug: "nha-tho-cong-giao", name_vn: "Nhà thờ Công giáo Thanh Đảo", name_cn: "天主教堂", city: "Thanh Đảo", description: "Nhà thờ Gothic, điểm chụp ảnh nổi tiếng", image: "/images/spots/nha-tho-cong-giao.jpg" },
  "dai-bao-dao": { slug: "dai-bao-dao", name_vn: "Đại Bào Đảo", name_cn: "大鲍岛", city: "Thanh Đảo", description: "Khu phố cổ Thanh Đảo" },
  "quang-hung-ly": { slug: "quang-hung-ly", name_vn: "Quảng Hưng Lý", name_cn: "广兴里", city: "Thanh Đảo", description: "Khu phố lịch sử" },
  "bao-tang-bia": { slug: "bao-tang-bia", name_vn: "Bảo tàng Bia Thanh Đảo", name_cn: "青啤博物馆", city: "Thanh Đảo", description: "Bảo tàng bia Tsingtao trứ danh", image: "/images/spots/bao-tang-bia.jpg" },
  "quang-truong-ngu-tu": { slug: "quang-truong-ngu-tu", name_vn: "Quảng trường Ngũ Tứ", name_cn: "五四广场", city: "Thanh Đảo", description: 'Quảng trường ven biển, biểu tượng "Ngọn gió tháng Năm"' },
  "trung-tam-dua-thuyen": { slug: "trung-tam-dua-thuyen", name_vn: "Trung tâm đua thuyền Olympic", name_cn: "奥帆中心", city: "Thanh Đảo", description: "Bến du thuyền Olympic 2008" },
  "cho-dem-dai-dong": { slug: "cho-dem-dai-dong", name_vn: "Chợ đêm Đài Đông", name_cn: "台东夜市", city: "Thanh Đảo", description: "Phố đi bộ - chợ đêm sầm uất", image: "/images/spots/cho-dem-dai-dong.jpg" },
  "cong-vien-sa-tu-khau": { slug: "cong-vien-sa-tu-khau", name_vn: "Công viên Sa Tử Khẩu", name_cn: "沙子口公园", city: "Thanh Đảo", description: "Công viên ven biển miễn phí" },
  "cong-vien-tieu-mach": { slug: "cong-vien-tieu-mach", name_vn: "Công viên Đảo Tiểu Mạch", name_cn: "小麦岛公园", city: "Thanh Đảo", description: "Đảo hình vòng, đồng cỏ ven biển" },
};

export const TOURS: Tour[] = [
  {
    code: "TD-5N4D",
    title_vn: "Thanh Đảo – Uy Hải – Bồng Lai 5N4Đ",
    title_cn: "时尚青岛 浪漫威海 仙境蓬莱 双飞往返5日游",
    tagline_vn: "Thanh Đảo thời thượng · Uy Hải lãng mạn · Bồng Lai tiên cảnh",
    days: 5, nights: 4, airline: "Shandong Airlines",
    cover: "/images/hero/thanh-dao-1.jpg",
    cities: ["Thanh Đảo", "Yên Đài", "Uy Hải", "Bồng Lai", "Na Hương Hải"],
    hotels_note: "Khách sạn 4 sao hoặc tương đương (Khai Nguyên Hoa Kiều, Holiday Inn Express Thanh Đảo…).",
    includes: "Phòng đôi KS 4★ toàn chuyến · 4 bữa sáng + 9 bữa chính (50 RMB/người) · vé cổng điểm đầu tiên · xe máy lạnh 33–50 chỗ · HDV Việt + Trung · bảo hiểm trách nhiệm lữ hành.",
    excludes: "Phụ phí phòng đơn · bảo hiểm hàng không · chi phí bất khả kháng · suối nước nóng chỉ gồm vé vào cửa · bảo hiểm du lịch cá nhân · visa.",
    itinerary: [
      { day_no: 1, route_vn: "Hồ Chí Minh – Thanh Đảo – Yên Đài", route_cn: "胡志明-青岛-烟台", meals: "Sáng (nhẹ) · Tối", hotel: "Yên Đài", spots: ["tuong-bat-tien", "bat-tien-do", "truong-du-winery", "so-thanh-ly"] },
      { day_no: 2, route_vn: "Yên Đài – Uy Hải", route_cn: "烟台-威海", meals: "Sáng · Trưa · Tối", hotel: "Uy Hải", spots: ["nui-yen-dai", "phao-dai-dong", "vinh-mat-trang", "quang-truong-praha", "pho-bat-lo-duoc", "han-lac-phuong"] },
      { day_no: 3, route_vn: "Uy Hải – Na Hương Hải", route_cn: "威海-那香海", meals: "Sáng · Trưa · Tối", hotel: "Uy Hải", spots: ["cong-hanh-phuc", "nha-co-bien", "tau-mac-can", "na-huong-hai"] },
      { day_no: 4, route_vn: "Uy Hải – Thanh Đảo", route_cn: "威海-青岛", meals: "Sáng · Trưa · Tối", hotel: "Thanh Đảo", spots: ["cong-vien-sa-tu-khau", "cong-vien-tieu-mach", "quang-truong-ngu-tu", "trung-tam-dua-thuyen", "cho-dem-dai-dong"] },
      { day_no: 5, route_vn: "Thanh Đảo – Hồ Chí Minh", route_cn: "青岛-胡志明", meals: "Sáng", hotel: "—", spots: ["cau-tram-kieu", "nha-tho-cong-giao", "dai-bao-dao", "quang-hung-ly", "bao-tang-bia"] },
    ],
    departures: [
      { month: "Tháng 9", dates: "5, 6, 12, 13, 19, 20", adult: 3980, child: 3280, infant: 600 },
      { month: "Tháng 10", dates: "10, 11, 17, 18, 24, 25, 31", adult: 3880, child: 3280, infant: 600 },
      { month: "Tháng 11", dates: "1, 7, 8, 14, 15, 21, 22, 28, 29", adult: 3780, child: 3180, infant: 600 },
      { month: "Tháng 12", dates: "5, 6, 12, 13, 19, 20, 26, 27", adult: 3780, child: 3180, infant: 600 },
    ],
  },
  {
    code: "TD-TN-5N",
    title_vn: "Thanh Đảo – Uy Hải – Bồng Lai – Tế Nam 5N4Đ",
    title_cn: "时尚青岛 浪漫威海 仙境蓬莱 泉城济南 双飞往返5日游",
    tagline_vn: "Thanh Đảo · Uy Hải · Bồng Lai tiên cảnh · Tế Nam thành phố suối",
    days: 5, nights: 4, airline: "Shandong Airlines",
    cover: "/images/hero/thanh-dao-2.jpg",
    cities: ["Thanh Đảo", "Uy Hải", "Yên Đài", "Bồng Lai", "Tế Nam", "Na Hương Hải"],
    hotels_note: "Khách sạn 4 sao hoặc tương đương (… Trung Hải Khải Ly Tế Nam).",
    includes: "Phòng đôi KS 4★ toàn chuyến · 4 bữa sáng + 9 bữa chính (50 RMB/người) · vé cổng điểm đầu tiên · xe máy lạnh 33–50 chỗ · HDV Việt + Trung · bảo hiểm trách nhiệm lữ hành.",
    excludes: "Phụ phí phòng đơn · bảo hiểm hàng không · suối nước nóng chỉ gồm vé · visa nhập cảnh 150 CNY/người · gửi visa về VN 300 CNY/đoàn · bảo hiểm du lịch cá nhân.",
    itinerary: [
      { day_no: 1, route_vn: "Hồ Chí Minh – Thanh Đảo – Na Hương Hải – Uy Hải", route_cn: "胡志明-青岛-那香海-威海", meals: "Sáng (nhẹ) · Tối", hotel: "Uy Hải", spots: ["na-huong-hai", "tau-mac-can", "nha-co-bien", "han-lac-phuong"] },
      { day_no: 2, route_vn: "Uy Hải – Yên Đài – Bồng Lai", route_cn: "威海-烟台-蓬莱", meals: "Sáng · Trưa · Tối", hotel: "Bồng Lai", spots: ["cong-hanh-phuc", "pho-bat-lo-duoc", "quang-truong-praha", "vinh-mat-trang", "phao-dai-dong", "nui-yen-dai"] },
      { day_no: 3, route_vn: "Bồng Lai – Tế Nam", route_cn: "蓬莱-济南", meals: "Sáng · Trưa · Tối", hotel: "Tế Nam", spots: ["bat-tien-do", "tuong-bat-tien", "pho-phu-dung"] },
      { day_no: 4, route_vn: "Tế Nam – Thanh Đảo", route_cn: "济南-青岛", meals: "Sáng · Trưa · Tối", hotel: "Thanh Đảo", spots: ["ho-dai-minh", "suoi-bao-dot", "quang-truong-tuyen-thanh", "suoi-hac-ho", "cho-dem-dai-dong"] },
      { day_no: 5, route_vn: "Thanh Đảo", route_cn: "青岛", meals: "Sáng", hotel: "—", spots: ["cau-tram-kieu", "nha-tho-cong-giao", "dai-bao-dao", "bao-tang-bia", "quang-truong-ngu-tu", "trung-tam-dua-thuyen", "cong-vien-sa-tu-khau"] },
    ],
    departures: [
      { month: "Tháng 9", dates: "5, 6, 12, 13, 19, 20", adult: 4180, child: 3480, infant: 600 },
      { month: "Tháng 10", dates: "10, 11, 17, 18, 24, 25, 31", adult: 4080, child: 3480, infant: 600 },
      { month: "Tháng 11", dates: "1, 7, 8, 14, 15, 21, 22, 28, 29", adult: 3980, child: 3380, infant: 600 },
      { month: "Tháng 12", dates: "5, 6, 12, 13, 19, 20, 26, 27", adult: 3980, child: 3380, infant: 600 },
    ],
  },
];

export function getTour(code: string): Tour | undefined {
  return TOURS.find((t) => t.code === code);
}

export function spotsWithImages(): ScenicSpot[] {
  return Object.values(SPOTS).filter((s) => s.image);
}
