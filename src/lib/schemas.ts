import type { FieldDef } from "./schema";

// Canh diem
export const spotSchema: FieldDef[] = [
  { key: "name_vn", label: "Tên cảnh điểm", required: true, placeholder: "VD: Núi Yên Đài" },
  { key: "name_cn", label: "Tên tiếng Trung", half: true, placeholder: "烟台山" },
  { key: "city", label: "Thành phố", half: true, placeholder: "Yên Đài" },
  { key: "description", label: "Nội dung / mô tả", type: "textarea", placeholder: "Giới thiệu ngắn về cảnh điểm…" },
  { key: "image", label: "Hình ảnh", type: "image" },
];

// Khach hang (cac truong phang; phan "tien do theo tuan" la phan dac biet, render qua slot extra)
export const customerSchema: FieldDef[] = [
  { key: "company", label: "Tên công ty", required: true, placeholder: "VD: Công ty TNHH Du lịch ABC" },
  { key: "address", label: "Địa chỉ công ty", placeholder: "VD: 123 Nguyễn Huệ, Q.1, TP.HCM" },
  { key: "taxCode", label: "Mã số thuế", half: true, placeholder: "VD: 0312345678" },
  { key: "legalRep", label: "Người đại diện pháp luật", half: true, placeholder: "VD: Bà Trần Thị B" },
  { key: "contactName", label: "Người liên hệ", half: true, placeholder: "VD: Anh Nam" },
  { key: "contactPhone", label: "Số điện thoại người liên hệ", half: true, placeholder: "VD: 0901 234 567" },
  { key: "email", label: "Email", type: "email", placeholder: "VD: lienhe@congty.com" },
];
