// Khai bao truong (field) dung chung cho form/the theo kieu schema-driven
export type FieldType = "text" | "textarea" | "number" | "email" | "tel" | "image";

export interface FieldDef {
  key: string;            // ten truong, khop voi key cua data
  label: string;          // nhan hien thi
  type?: FieldType;       // mac dinh "text"
  placeholder?: string;
  required?: boolean;
  half?: boolean;         // hien 1/2 hang (2 cot); mac dinh chiem ca hang
}

export type FormData = Record<string, string | undefined>;
