import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Co cau hinh Supabase chua? Neu chua, app van chay bang du lieu mau.
export const isSupabaseConfigured = Boolean(url && anonKey);

// Khong throw o day nua — chi tao client khi da co key.
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
