import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return new Response('Missing slug', { status:400 })

  const supabase = createClient()
  const { data: c } = await supabase
    .from('companies')
    .select('name,category,city,score_total,tips_count,score_service,score_product,score_employee')
    .eq('slug', slug).single()

  if (!c) return new Response('Not found', { status:404 })

  const score    = c.score_total || 0
  const scoreStr = (score > 0 ? '+' : '') + score
  const good     = score >= 0
  const tips     = c.tips_count || 0

  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c0c0e"/>
      <stop offset="100%" stop-color="#1a0a08"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Top bar -->
  <rect width="1200" height="8" fill="#e8341c"/>

  <!-- Card -->
  <rect x="60" y="80" width="1080" height="470" rx="28" fill="url(#card)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Score accent line -->
  <rect x="60" y="80" width="6" height="470" rx="3" fill="${good?'#1db954':'#e8341c'}"/>

  <!-- Company initial -->
  <rect x="100" y="140" width="110" height="110" rx="24" fill="#8e0000"/>
  <text x="155" y="212" font-family="Georgia,serif" font-size="64" font-weight="900" fill="white" text-anchor="middle">${c.name[0].toUpperCase()}</text>

  <!-- Company name -->
  <text x="240" y="185" font-family="Georgia,serif" font-size="${c.name.length > 25 ? 42 : c.name.length > 15 ? 52 : 62}" font-weight="900" fill="white">${c.name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>

  <!-- Category + city -->
  <text x="240" y="230" font-family="sans-serif" font-size="26" fill="rgba(255,255,255,0.5)">${c.category}${c.city ? ' · ' + c.city : ''}</text>

  <!-- Divider -->
  <line x1="100" y1="290" x2="1100" y2="290" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Score -->
  <text x="155" y="380" font-family="Georgia,serif" font-size="100" font-weight="900" fill="${good?'#1db954':'#e8341c'}" text-anchor="middle">${scoreStr}</text>
  <text x="155" y="415" font-family="sans-serif" font-size="22" fill="rgba(255,255,255,0.4)" text-anchor="middle">puntos</text>

  <!-- Segments -->
  ${[
    { label:'Servicio', val: c.score_service||0, x: 360 },
    { label:'Producto', val: c.score_product||0, x: 620 },
    { label:'Empleado', val: c.score_employee||0, x: 880 },
  ].map(s => {
    const sv = s.val; const sg = sv >= 0; const ss = (sv>0?'+':'')+sv
    return `
  <rect x="${s.x-90}" y="315" width="180" height="110" rx="16" fill="rgba(255,255,255,0.04)" stroke="${sg?'rgba(29,185,84,0.2)':'rgba(232,52,28,0.2)'}" stroke-width="1"/>
  <text x="${s.x}" y="368" font-family="Georgia,serif" font-size="40" font-weight="900" fill="${sg?'#1db954':'#e8341c'}" text-anchor="middle">${ss}</text>
  <text x="${s.x}" y="400" font-family="sans-serif" font-size="20" fill="rgba(255,255,255,0.4)" text-anchor="middle">${s.label}</text>`
  }).join('')}

  <!-- Tips count -->
  <text x="1100" y="480" font-family="sans-serif" font-size="22" fill="rgba(255,255,255,0.3)" text-anchor="end">${tips} tip${tips!==1?'s':''} · tipero.us</text>

  <!-- Bottom brand -->
  <text x="600" y="590" font-family="Georgia,serif" font-size="28" font-weight="900" fill="#e8341c" text-anchor="middle">★ tipero.us</text>

  <!-- Bottom bar -->
  <rect y="622" width="1200" height="8" fill="#e8341c"/>
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    }
  })
}
