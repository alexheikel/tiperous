// ============================================================
//  lib/google-places.ts — Google Places API helpers
// ============================================================
import type { GooglePlaceData, Category } from '@/types'

const BASE = 'https://maps.googleapis.com/maps/api'
const KEY  = process.env.GOOGLE_PLACES_API_KEY!

// ─── Search places by text ───────────────────────────────────
export async function searchPlaces(query: string, location?: { lat: number; lng: number }) {
  const params = new URLSearchParams({
    query,
    key: KEY,
    language: 'es',
    ...(location ? { location: `${location.lat},${location.lng}`, radius: '50000' } : {}),
  })

  const res  = await fetch(`${BASE}/place/textsearch/json?${params}`, { next: { revalidate: 300 } })
  const data = await res.json()

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${data.status}`)
  }

  return (data.results || []) as GooglePlaceData[]
}

// ─── Get place details by place_id ───────────────────────────
export async function getPlaceDetails(placeId: string): Promise<GooglePlaceData> {
  const params = new URLSearchParams({
    place_id: placeId,
    key: KEY,
    language: 'es',
    fields: [
      'place_id', 'name', 'formatted_address', 'geometry',
      'types', 'rating', 'website', 'formatted_phone_number',
      'opening_hours', 'photos',
    ].join(','),
  })

  const res  = await fetch(`${BASE}/place/details/json?${params}`, { next: { revalidate: 3600 } })
  const data = await res.json()

  if (data.status !== 'OK') throw new Error(`Place details error: ${data.status}`)
  return data.result as GooglePlaceData
}

// ─── Get photo URL ───────────────────────────────────────────
export function placePhotoUrl(photoRef: string, maxWidth = 400) {
  return `${BASE}/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${KEY}`
}

// ─── Map Google types to our Category ────────────────────────
const TYPE_MAP: Record<string, Category> = {
  restaurant: 'Food', food: 'Food', cafe: 'Food', bakery: 'Food', bar: 'Food',
  store: 'Retail', clothing_store: 'Retail', shoe_store: 'Retail', shopping_mall: 'Retail',
  bank: 'Finance', finance: 'Finance', insurance_agency: 'Finance',
  hospital: 'Health', pharmacy: 'Health', doctor: 'Health', gym: 'Health',
  school: 'Education', university: 'Education',
  lodging: 'Entertainment', movie_theater: 'Entertainment', night_club: 'Entertainment',
  transit_station: 'Transport', airport: 'Transport',
}

export function mapGoogleCategory(types: string[]): Category {
  for (const t of types) {
    if (TYPE_MAP[t]) return TYPE_MAP[t]
  }
  return 'General'
}
