// ============================================================
//  app/api/companies/search/route.ts
//  GET /api/companies/search?q=starbucks&lat=-34.6&lng=-58.4
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { searchPlaces, mapGoogleCategory } from '@/lib/google-places'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q   = searchParams.get('q')?.trim()
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined

  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 })
  }

  const supabase = createClient()

  // 1. Search our DB first
  const { data: local } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', `%${q}%`)
    .order('score_total', { ascending: false })
    .limit(10)

  // 2. Search Google Places for new discoveries
  let googleResults: any[] = []
  try {
    const places = await searchPlaces(q, lat && lng ? { lat, lng } : undefined)
    // Filter out ones we already have
    const existingPlaceIds = new Set((local || []).map(c => c.google_place_id).filter(Boolean))
    googleResults = places
      .filter(p => !existingPlaceIds.has(p.place_id))
      .slice(0, 5)
      .map(p => ({
        id: `google_${p.place_id}`,   // temp ID prefix — not yet in DB
        name: p.name,
        category: mapGoogleCategory(p.types),
        address: p.formatted_address,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        google_place_id: p.place_id,
        google_data: p,
        score_total: 0, score_service: 0, score_product: 0, score_employee: 0,
        tips_count: 0,
        _source: 'google',   // flag for client
      }))
  } catch (e) {
    // Google Places unavailable — still return local results
    console.warn('Google Places error:', e)
  }

  return NextResponse.json({
    data: {
      local: local || [],
      google: googleResults,
    }
  })
}
