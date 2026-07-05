// Dong bo du lieu voi Supabase (bang: app_spots, app_tours, quote_requests —
// xem db/schema_app.sql). localStorage van la cache doc nhanh; khi da cau hinh
// .env.local thi Supabase la nguon du lieu chinh giua cac thiet bi.
// Chua cau hinh Supabase -> moi ham o day tro thanh no-op, app chay nhu cu.

import { useEffect } from "react";
import { supabase } from "./supabase";
import type { ScenicSpot, Tour } from "./types";
import type { QuoteRequest } from "./store";

// Phai khop key trong store.ts (khong import tu store de tranh vong lap module)
const SPOT_KEY = "tq_spots";
const TOUR_KEY = "tq_tours";
const REQUEST_KEY = "tq_quote_requests";

const SYNC_EVENT = "tq:cloud";

function warn(ctx: string, error: unknown) {
  console.warn(`[supabase] ${ctx}:`, error);
}
function readLocal<T>(key: string): T[] {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T[]) : [];
  } catch {
    return [];
  }
}
function writeLocal(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ---------- Day tung ban ghi len cloud (goi tu store.ts, khong can cho) ----------
export function pushSpotCloud(s: ScenicSpot) {
  if (!supabase) return;
  void supabase
    .from("app_spots")
    .upsert({ slug: s.slug, data: s, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) warn("luu canh diem", error); });
}
export function deleteSpotCloud(slug: string) {
  if (!supabase) return;
  void supabase.from("app_spots").delete().eq("slug", slug)
    .then(({ error }) => { if (error) warn("xoa canh diem", error); });
}

export function pushTourCloud(t: Tour) {
  if (!supabase) return;
  void supabase
    .from("app_tours")
    .upsert({ code: t.code, data: t, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) warn("luu tour", error); });
}
export function deleteTourCloud(code: string) {
  if (!supabase) return;
  void supabase.from("app_tours").delete().eq("code", code)
    .then(({ error }) => { if (error) warn("xoa tour", error); });
}

function requestRow(r: QuoteRequest) {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    tour_name: r.tourName,
    status: r.status,
    data: r,
    created_at: new Date(r.createdAt).toISOString(),
  };
}
/** Tra ve true khi da luu len cloud thanh cong (hoac chua cau hinh cloud). */
export async function pushRequestCloud(r: QuoteRequest): Promise<boolean> {
  if (!supabase) return true;
  const { error } = await supabase.from("quote_requests").upsert(requestRow(r));
  if (error) warn("gui yeu cau bao gia", error);
  return !error;
}
export function deleteRequestCloud(id: string) {
  if (!supabase) return;
  void supabase.from("quote_requests").delete().eq("id", id)
    .then(({ error }) => { if (error) warn("xoa yeu cau bao gia", error); });
}

// ---------- Keo toan bo du lieu cloud -> localStorage ----------
/**
 * Goi khi mo web (CloudSync) hoac khi bam "Lam moi".
 * - Bang cloud con trong + local co du lieu (seed) -> day local len cloud (bootstrap lan dau).
 * - Nguoc lai -> ghi de localStorage bang du lieu cloud.
 * Xong phat su kien "tq:cloud" de cac trang doc lai (useCloudRefresh).
 */
export async function pullAllFromCloud(): Promise<void> {
  if (!supabase || typeof window === "undefined") return;
  try {
    const [sp, tr, rq] = await Promise.all([
      supabase.from("app_spots").select("data"),
      supabase.from("app_tours").select("data"),
      supabase.from("quote_requests").select("data"),
    ]);

    if (sp.error) warn("doc canh diem", sp.error);
    else {
      const cloud = sp.data.map((row) => row.data as ScenicSpot);
      const local = readLocal<ScenicSpot>(SPOT_KEY);
      if (cloud.length === 0 && local.length > 0) {
        const { error } = await supabase.from("app_spots")
          .upsert(local.map((s) => ({ slug: s.slug, data: s })));
        if (error) warn("day canh diem len cloud", error);
      } else if (cloud.length > 0) {
        writeLocal(SPOT_KEY, cloud);
      }
    }

    if (tr.error) warn("doc tour", tr.error);
    else {
      const cloud = tr.data.map((row) => row.data as Tour);
      const local = readLocal<Tour>(TOUR_KEY);
      if (cloud.length === 0 && local.length > 0) {
        const { error } = await supabase.from("app_tours")
          .upsert(local.map((t) => ({ code: t.code, data: t })));
        if (error) warn("day tour len cloud", error);
      } else if (cloud.length > 0) {
        writeLocal(TOUR_KEY, cloud);
      }
    }

    if (rq.error) warn("doc yeu cau bao gia", rq.error);
    else {
      const cloud = rq.data.map((row) => row.data as QuoteRequest);
      const local = readLocal<QuoteRequest>(REQUEST_KEY);
      if (cloud.length === 0 && local.length > 0) {
        const { error } = await supabase.from("quote_requests").upsert(local.map(requestRow));
        if (error) warn("day yeu cau len cloud", error);
      } else {
        writeLocal(REQUEST_KEY, cloud);
      }
    }

    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch (e) {
    warn("dong bo", e);
  }
}

/** Trang nao hien thi du lieu thi goi hook nay de tu doc lai sau khi dong bo xong. */
export function useCloudRefresh(onSync: () => void) {
  useEffect(() => {
    window.addEventListener(SYNC_EVENT, onSync);
    return () => window.removeEventListener(SYNC_EVENT, onSync);
  }, [onSync]);
}
