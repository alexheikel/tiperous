import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return new Response('Missing id', { status:400 })

  const supabase = createClient()
  const { data: tip } = await supabase.from('tips')
    .select('*, company:companies(name,slug,score_total), profile:profiles!tips_user_id_fkey(username,full_name)')
    .eq('id', id).single()

  if (!tip) return new Response('Not found', { status:404 })

  const good    = tip.type === 'good'
  const company = (tip.company as any)
  const profile = (tip.profile as any)
  const name    = profile?.full_name || profile?.username || 'Usuario'
  const text    = tip.text.length > 100 ? tip.text.slice(0, 97) + '...' : tip.text
  const seg     = tip.segment === 'service' ? 'Servicio' : tip.segment === 'product' ? 'Producto' : 'Empleado'

  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0c0c0e"/>
  <rect width="1200" height="8" fill="#e8341c"/>
  <rect y="622" width="1200" height="8" fill="#e8341c"/>
  <rect x="60" y="60" width="6" height="510" rx="3" fill="${good?'#1db954':'#e8341c'}"/>

  <text x="600" y="130" font-family="Georgia,serif" font-size="26" fill="rgba(255,255,255,0.4)" text-anchor="middle">${good?'✓ Recomendó':'✗ No recomendó'} ${seg.toLowerCase()} de</text>
  <text x="600" y="200" font-family="Georgia,serif" font-size="${company.name.length>20?52:64}" font-weight="900" fill="white" text-anchor="middle">${company.name.replace(/&/g,'&amp;')}</text>

  <line x1="100" y1="230" x2="1100" y2="230" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

  <text x="600" y="310" font-family="Georgia,serif" font-size="36" fill="${good?'#1db954':'#e8341c'}" text-anchor="middle">${good?'▲ Bueno':'▼ Malo'}</text>

  <text x="600" y="390" font-family="Georgia,serif" font-size="34" fill="rgba(255,255,255,0.85)" text-anchor="middle">"${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}"</text>

  <text x="600" y="470" font-family="sans-serif" font-size="24" fill="rgba(255,255,255,0.3)" text-anchor="middle">— ${name}</text>

  <text x="600" y="570" font-family="Georgia,serif" font-size="26" font-weight="900" fill="#e8341c" text-anchor="middle">★ tipero.us</text>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    }
  })
}
