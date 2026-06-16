export interface ScenicSpot {
  slug: string;
  name_vn: string;
  name_cn?: string;
  city: string;        // tên thành phố (VN)
  description?: string;
  image?: string;      // '/images/spots/xxx.jpg' | undefined
}

export interface TourDay {
  day_no: number;
  route_vn: string;
  route_cn?: string;
  meals: string;
  hotel: string;
  spots: string[];     // slug cảnh điểm
}

export interface Departure {
  month: string;
  dates: string;
  adult: number;       // CNY
  child: number;       // 2–11 tuổi
  infant: number;      // dưới 2 tuổi
}

export interface Tour {
  code: string;
  title_vn: string;
  title_cn?: string;
  tagline_vn?: string;
  days: number;
  nights: number;
  airline?: string;
  cover?: string;
  cities: string[];
  hotels_note?: string;
  includes?: string;
  excludes?: string;
  itinerary: TourDay[];
  departures: Departure[];
}

export interface Quote {
  tour_code: string;
  customer_name: string;
  customer_email: string;
  departure_date: string;
  num_adults: number;
  num_children: number;
  num_infants: number;
  total: number;
}
