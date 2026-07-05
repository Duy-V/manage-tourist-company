import { SPOTS, TOURS } from "./data";
import type { ScenicSpot, Tour } from "./types";
import {
  pushSpotCloud,
  deleteSpotCloud,
  pushTourCloud,
  deleteTourCloud,
  pushRequestCloud,
  deleteRequestCloud,
  pushCustomerCloud,
  deleteCustomerCloud,
} from "./cloud";

export interface ItineraryDay {
  day_no: number;
  spots: string[];
}
export interface Itinerary {
  id: string;
  name: string;
  days: ItineraryDay[];
  price: number;
  cover?: string;
  createdAt: number;
}

const SPOT_KEY = "tq_spots";
const ITIN_KEY = "tq_itineraries";
const QUOTE_KEY = "tq_quotes";
const TOUR_KEY = "tq_tours";
const SEED_FLAG = "tq_seeded_v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(val));
}

// ----- Canh diem -----
export function getUserSpots(): ScenicSpot[] {
  return read<ScenicSpot[]>(SPOT_KEY, []);
}
export function getAllSpots(): ScenicSpot[] {
  const arr = getUserSpots();
  return arr.length ? arr : Object.values(SPOTS);
}
export function spotMap(): Record<string, ScenicSpot> {
  const m: Record<string, ScenicSpot> = {};
  for (const s of getAllSpots()) m[s.slug] = s;
  return m;
}
export function addSpot(s: ScenicSpot) {
  const arr = getUserSpots();
  arr.push(s);
  write(SPOT_KEY, arr);
  pushSpotCloud(s);
}
export function deleteUserSpot(slug: string) {
  write(SPOT_KEY, getUserSpots().filter((s) => s.slug !== slug));
  deleteSpotCloud(slug);
}
export function isUserSpot(slug: string): boolean {
  return getUserSpots().some((s) => s.slug === slug);
}
export function getUserSpot(slug: string): ScenicSpot | undefined {
  return getUserSpots().find((s) => s.slug === slug);
}
export function updateSpot(slug: string, patch: Partial<ScenicSpot>) {
  const arr = getUserSpots().map((s) => (s.slug === slug ? { ...s, ...patch, slug } : s));
  write(SPOT_KEY, arr);
  const updated = arr.find((s) => s.slug === slug);
  if (updated) pushSpotCloud(updated);
}

// ----- Hanh trinh -----
export function getItineraries(): Itinerary[] {
  return read<Itinerary[]>(ITIN_KEY, []);
}
export function addItinerary(it: Itinerary) {
  const arr = getItineraries();
  arr.push(it);
  write(ITIN_KEY, arr);
}
export function deleteItinerary(id: string) {
  write(ITIN_KEY, getItineraries().filter((i) => i.id !== id));
}
export function getItinerary(id: string): Itinerary | undefined {
  return getItineraries().find((i) => i.id === id);
}
export function updateItinerary(id: string, patch: Partial<Itinerary>) {
  write(ITIN_KEY, getItineraries().map((i) => (i.id === id ? { ...i, ...patch, id } : i)));
}
export function countSpots(it: Itinerary): number {
  return it.days.reduce((n, d) => n + d.spots.length, 0);
}

// ----- Bao gia (dua tren hanh trinh) -----
export interface SavedQuote {
  id: string;
  customerId?: string;
  contactName?: string;
  contactPhone?: string;
  itineraryId: string;
  itineraryName: string;
  days: number;
  spotsCount: number;
  cover?: string;
  customerName: string;
  customerEmail: string;
  departureDate: string;
  adults: number;
  children: number;
  infants: number;
  adultPrice: number;
  childPrice: number;
  infantPrice: number;
  total: number;
  note?: string;
  createdAt: number;
}
export function getQuotes(): SavedQuote[] {
  return read<SavedQuote[]>(QUOTE_KEY, []);
}
export function addQuote(q: SavedQuote) {
  const arr = getQuotes();
  arr.push(q);
  write(QUOTE_KEY, arr);
}
export function deleteQuote(id: string) {
  write(QUOTE_KEY, getQuotes().filter((q) => q.id !== id));
}
export function getQuote(id: string): SavedQuote | undefined {
  return getQuotes().find((q) => q.id === id);
}
export function updateQuote(id: string, patch: Partial<SavedQuote>) {
  write(QUOTE_KEY, getQuotes().map((q) => (q.id === id ? { ...q, ...patch, id } : q)));
}

// ----- Yeu cau bao gia (khach gui tu trang tour) -----
export type QuoteRequestStatus = "new" | "contacted" | "done";
export interface QuoteRequest {
  id: string;
  tourCode: string;
  tourName: string;
  cover?: string;
  name: string;          // tên khách
  phone: string;         // số điện thoại (bắt buộc để liên hệ lại)
  email?: string;
  departureDate?: string; // dd/mm/yyyy hoặc mô tả tự do
  adults: number;
  children: number;      // 2–11 tuổi
  infants: number;       // dưới 2 tuổi
  note?: string;
  status: QuoteRequestStatus;
  createdAt: number;
}

const REQUEST_KEY = "tq_quote_requests";

export function getQuoteRequests(): QuoteRequest[] {
  return read<QuoteRequest[]>(REQUEST_KEY, []);
}
export function getQuoteRequest(id: string): QuoteRequest | undefined {
  return getQuoteRequests().find((r) => r.id === id);
}
// Chi luu local; form khach gui se tu goi pushRequestCloud de cho xac nhan tu cloud.
export function addQuoteRequest(r: QuoteRequest) {
  const arr = getQuoteRequests();
  arr.push(r);
  write(REQUEST_KEY, arr);
}
export function updateQuoteRequest(id: string, patch: Partial<QuoteRequest>) {
  const arr = getQuoteRequests().map((r) => (r.id === id ? { ...r, ...patch, id } : r));
  write(REQUEST_KEY, arr);
  const updated = arr.find((r) => r.id === id);
  if (updated) void pushRequestCloud(updated);
}
export function deleteQuoteRequest(id: string) {
  write(REQUEST_KEY, getQuoteRequests().filter((r) => r.id !== id));
  deleteRequestCloud(id);
}
export function countNewQuoteRequests(): number {
  return getQuoteRequests().filter((r) => r.status === "new").length;
}

// ----- Khach hang (CRM) -----
export interface ProgressEntry {
  id: string;
  week: string;        // VD: "Tuần 25/2026" hoặc "16/06–22/06"
  content: string;     // nội dung tiến độ công việc trong tuần
  createdAt: number;
}
export interface Customer {
  id: string;
  company: string;       // tên công ty
  email: string;         // email
  contactName: string;   // người liên hệ
  contactPhone: string;  // số điện thoại người liên hệ
  address?: string;      // địa chỉ công ty
  taxCode?: string;      // mã số thuế
  legalRep?: string;     // tên người đại diện pháp luật
  progress: ProgressEntry[];
  createdAt: number;
}

const CUSTOMER_KEY = "tq_customers";

export function getCustomers(): Customer[] {
  return read<Customer[]>(CUSTOMER_KEY, []);
}
export function getCustomer(id: string): Customer | undefined {
  return getCustomers().find((c) => c.id === id);
}
export function addCustomer(c: Customer) {
  const arr = getCustomers();
  arr.push(c);
  write(CUSTOMER_KEY, arr);
  pushCustomerCloud(c);
}
export function updateCustomer(id: string, patch: Partial<Customer>) {
  const arr = getCustomers().map((c) => (c.id === id ? { ...c, ...patch, id } : c));
  write(CUSTOMER_KEY, arr);
  const updated = arr.find((c) => c.id === id);
  if (updated) pushCustomerCloud(updated);
}
export function deleteCustomer(id: string) {
  write(CUSTOMER_KEY, getCustomers().filter((c) => c.id !== id));
  deleteCustomerCloud(id);
}

// ----- Tour (truoc day la du lieu tinh trong data.ts, nay sua/xoa duoc) -----
export function getTours(): Tour[] {
  return read<Tour[]>(TOUR_KEY, TOURS);
}
export function getTour(code: string): Tour | undefined {
  return getTours().find((t) => t.code === code);
}
export function addTour(t: Tour) {
  write(TOUR_KEY, [t, ...getTours()]);
  pushTourCloud(t);
}
export function updateTour(code: string, patch: Partial<Tour>) {
  const arr = getTours().map((t) => (t.code === code ? { ...t, ...patch } : t));
  write(TOUR_KEY, arr);
  const updated = arr.find((t) => t.code === code);
  if (updated) pushTourCloud(updated);
}
export function deleteTour(code: string) {
  write(TOUR_KEY, getTours().filter((t) => t.code !== code));
  deleteTourCloud(code);
}

// ----- Gop "Hanh trinh tu tao" vao Tour (1 khai niem duy nhat) -----
const MIGRATE_FLAG = "tq_itin_migrated_v1";
function itinToTour(it: Itinerary, sm: Record<string, ScenicSpot>): Tour {
  const cset = new Set<string>();
  for (const d of it.days) for (const s of d.spots) { const c = sm[s]?.city; if (c) cset.add(c); }
  return {
    code: it.id,
    title_vn: it.name,
    days: it.days.length,
    nights: Math.max(0, it.days.length - 1),
    cover: it.cover,
    cities: [...cset],
    itinerary: it.days.map((d) => ({ day_no: d.day_no, route_vn: "", meals: "", hotel: "", spots: d.spots })),
    departures: it.price > 0 ? [{ month: "", dates: "", adult: it.price, child: 0, infant: 0 }] : [],
  };
}
export function migrateItinerariesToTours() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATE_FLAG)) return;
  const itins = read<Itinerary[]>(ITIN_KEY, []);
  if (itins.length) {
    const sm = spotMap();
    const tours = getTours();
    const have = new Set(tours.map((t) => t.code));
    const converted = itins.filter((it) => !have.has(it.id)).map((it) => itinToTour(it, sm));
    if (converted.length) write(TOUR_KEY, [...converted, ...tours]);
  }
  write(ITIN_KEY, []);
  localStorage.setItem(MIGRATE_FLAG, "1");
}

// ----- Seed du lieu goc vao localStorage 1 lan (de moi the deu sua/xoa duoc) -----
export function ensureSeeded() {
  if (typeof window === "undefined") return;
  migrateItinerariesToTours();
  if (localStorage.getItem(SEED_FLAG)) return;
  const existingSpots = read<ScenicSpot[]>(SPOT_KEY, []);
  const have = new Set(existingSpots.map((s) => s.slug));
  const merged = [...Object.values(SPOTS).filter((s) => !have.has(s.slug)), ...existingSpots];
  write(SPOT_KEY, merged);
  if (read<Tour[]>(TOUR_KEY, []).length === 0) write(TOUR_KEY, TOURS);
  localStorage.setItem(SEED_FLAG, "1");
}
