import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlaceDetails, mapGoogleCategory } from '@/lib/google-places'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const country = searchParams.get('country')
  const lat     = searchParams.get('lat')
  const lng     = searchParams.get('lng')
  const nearby  = searchParams.get('nearby')

  const supabase = createClient()
  let query = supabase.from('companies').select('*').order('score_total', { ascending:false }).limit(50)

  if (country) query = query.eq('country', country)

  if (nearby === '1' && lat && lng) {
    // Use PostGIS to find nearby companies within 10km
    const { data, error } = await supabase.rpc('companies_nearby', {
      lat: parseFloat(lat), lng: parseFloat(lng), radius_km: 50
    })
    if (error) return NextResponse.json({ error:error.message }, { status:500 })
    return NextResponse.json({ data: data || [] })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const body = await req.json()
  const { name, category, google_place_id } = body
  if (google_place_id) {
    try {
      const place = await getPlaceDetails(google_place_id)
      const { data, error } = await supabase.from('companies').upsert({
        name:place.name, category:mapGoogleCategory(place.types),
        address:place.formatted_address, lat:place.geometry.location.lat, lng:place.geometry.location.lng,
        website:place.website||null, phone:place.formatted_phone_number||null,
        google_place_id:place.place_id, google_data:place, created_by:user.id,
      }, { onConflict:'google_place_id' }).select().single()
      if (error) return NextResponse.json({ error:error.message }, { status:500 })
      return NextResponse.json({ data }, { status:201 })
    } catch(e:any) { return NextResponse.json({ error:e.message }, { status:500 }) }
  }
  if (!name?.trim()) return NextResponse.json({ error:'Name required' }, { status:400 })
  const { data, error } = await supabase.from('companies').insert({ name:name.trim(), category:category||'General', created_by:user.id }).select().single()
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ data }, { status:201 })
}
