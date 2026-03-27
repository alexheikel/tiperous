import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || '8.8.8.8'

  try {
    const res  = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,countryCode,lat,lon`, {
      next: { revalidate: 3600 }
    })
    const data = await res.json()
    if (data.status === 'success') {
      return NextResponse.json({
        city:        data.city,
        country:     data.country,
        countryCode: data.countryCode,
        lat:         data.lat,
        lng:         data.lon,
      })
    }
  } catch(e) {}

  return NextResponse.json({ city:'Global', country:'', countryCode:'ALL', lat:null, lng:null })
}
