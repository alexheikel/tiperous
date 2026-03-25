// ============================================================
//  TIPEROUS — Global Types
// ============================================================

export type TipType    = 'good' | 'bad'
export type TipSegment = 'service' | 'product' | 'employee'
export type Category   = 'Technology' | 'Food' | 'Retail' | 'Finance' | 'Transport' | 'Entertainment' | 'Health' | 'Education' | 'General'

// ─── Database row types (mirror Supabase schema) ─────────────

export interface Profile {
  id:         string
  username:   string | null
  full_name:  string | null
  avatar_url: string | null
  bio:        string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id:             string
  name:           string
  category:       Category
  description:    string | null
  address:        string | null
  city:           string | null
  country:        string | null
  website:        string | null
  phone:          string | null
  google_place_id: string | null
  google_data:    GooglePlaceData | null
  lat:            number | null
  lng:            number | null
  score_total:    number
  score_service:  number
  score_product:  number
  score_employee: number
  tips_count:     number
  created_by:     string | null
  created_at:     string
  updated_at:     string
}

export interface Tip {
  id:         string
  company_id: string
  user_id:    string
  type:       TipType
  segment:    TipSegment
  text:       string
  likes:      number
  created_at: string
  updated_at: string
  // Joined
  profile?:   Profile
  company?:   Company
  user_liked?: boolean
}

export interface TipLike {
  tip_id:     string
  user_id:    string
  created_at: string
}

// ─── Google Places ───────────────────────────────────────────

export interface GooglePlaceData {
  place_id:         string
  name:             string
  formatted_address: string
  geometry: {
    location: { lat: number; lng: number }
  }
  types:            string[]
  rating?:          number
  website?:         string
  formatted_phone_number?: string
  opening_hours?: {
    open_now: boolean
    weekday_text: string[]
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
}

// ─── API Response types ──────────────────────────────────────

export interface ApiResponse<T> {
  data:    T | null
  error:   string | null
  status:  number
}

export interface CompanyWithTips extends Company {
  tips: Tip[]
}

export interface LeaderboardEntry {
  company:     Company
  rank:        number
  score_delta: number  // change in last 24h
}

// ─── Store types (Zustand) ───────────────────────────────────

export interface AppStore {
  user:          Profile | null
  setUser:       (user: Profile | null) => void
  companies:     Company[]
  setCompanies:  (companies: Company[]) => void
  recentTips:    Tip[]
  addTip:        (tip: Tip) => void
}
