// =============================================================
//  TOẠ ĐỘ CẢNH ĐIỂM — hệ GCJ-02 (hệ của Amap / 高德地图)
//  CÁCH ĐIỀN:
//    1. Mở https://lbs.amap.com/tools/picker
//    2. Gõ tên 中文 (ở comment cuối mỗi dòng) vào ô tìm kiếm
//    3. Click đúng điểm → copy chuỗi "经度,纬度" (lng,lat) ở góc
//    4. Thay [0, 0] thành { lng: <số đầu>, lat: <số sau> }
//  Để nguyên { lng: 0, lat: 0 } nghĩa là CHƯA có toạ độ (app tự bỏ qua).
//  ⚠️ Amap trả "lng,lat" (kinh độ trước). Đừng đảo thứ tự.
// =============================================================
import type { SpotCoord } from "./types";

export const SPOT_COORDS: Record<string, SpotCoord> = {
  "na-huong-hai":            { lng: 0, lat: 0 }, // 那香海钻石沙滩 (Na Hương Hải)
  "tau-mac-can":             { lng: 0, lat: 0 }, // 布鲁威斯号 (Uy Hải)
  "nha-co-bien":             { lng: 0, lat: 0 }, // 金石湾海草房 (Uy Hải)
  "han-lac-phuong":          { lng: 0, lat: 0 }, // 韩乐坊 (Uy Hải)
  "cong-hanh-phuc":          { lng: 0, lat: 0 }, // 幸福门 (Uy Hải)
  "nui-yen-dai":             { lng: 0, lat: 0 }, // 烟台山 (Yên Đài)
  "quang-truong-praha":      { lng: 0, lat: 0 }, // 布拉格广场 (Yên Đài)
  "vinh-mat-trang":          { lng: 0, lat: 0 }, // 月亮湾 (Yên Đài)
  "phao-dai-dong":           { lng: 0, lat: 0 }, // 东炮台 (Yên Đài)
  "pho-bat-lo-duoc":         { lng: 0, lat: 0 }, // 火炬八街 (Yên Đài)
  "bat-tien-do":             { lng: 0, lat: 0 }, // 八仙渡 (Bồng Lai)
  "tuong-bat-tien":          { lng: 0, lat: 0 }, // 八仙雕塑 (Bồng Lai)
  "truong-du-winery":        { lng: 0, lat: 0 }, // 张裕卡斯特酒庄 (Yên Đài)
  "so-thanh-ly":             { lng: 0, lat: 0 }, // 所城里 (Yên Đài)
  "pho-phu-dung":            { lng: 0, lat: 0 }, // 芙蓉街 (Tế Nam)
  "ho-dai-minh":             { lng: 0, lat: 0 }, // 大明湖 (Tế Nam)
  "suoi-bao-dot":            { lng: 0, lat: 0 }, // 趵突泉 (Tế Nam)
  "quang-truong-tuyen-thanh":{ lng: 0, lat: 0 }, // 泉城广场 (Tế Nam)
  "suoi-hac-ho":             { lng: 0, lat: 0 }, // 黑虎泉 (Tế Nam)
  "cau-tram-kieu":           { lng: 0, lat: 0 }, // 栈桥 (Thanh Đảo)
  "nha-tho-cong-giao":       { lng: 0, lat: 0 }, // 天主教堂 (Thanh Đảo)
  "dai-bao-dao":             { lng: 0, lat: 0 }, // 大鲍岛 (Thanh Đảo)
  "quang-hung-ly":           { lng: 0, lat: 0 }, // 广兴里 (Thanh Đảo)
  "bao-tang-bia":            { lng: 0, lat: 0 }, // 青啤博物馆 (Thanh Đảo)
  "quang-truong-ngu-tu":     { lng: 0, lat: 0 }, // 五四广场 (Thanh Đảo)
  "trung-tam-dua-thuyen":    { lng: 0, lat: 0 }, // 奥帆中心 (Thanh Đảo)
  "cho-dem-dai-dong":        { lng: 0, lat: 0 }, // 台东夜市 (Thanh Đảo)
  "cong-vien-sa-tu-khau":    { lng: 0, lat: 0 }, // 沙子口公园 (Thanh Đảo)
  "cong-vien-tieu-mach":     { lng: 0, lat: 0 }, // 小麦岛公园 (Thanh Đảo)
};

// Trả toạ độ nếu đã điền (khác 0,0), ngược lại undefined.
export function coordOf(slug: string): SpotCoord | undefined {
  const c = SPOT_COORDS[slug];
  return c && (c.lng !== 0 || c.lat !== 0) ? c : undefined;
}

// Số điểm đã có toạ độ / tổng — tiện theo dõi tiến độ điền.
export function coordProgress(): { filled: number; total: number } {
  const all = Object.values(SPOT_COORDS);
  return { filled: all.filter((c) => c.lng !== 0 || c.lat !== 0).length, total: all.length };
}
