'use client'
import type { LocationState } from '@/types/location'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect, useRef } from 'react'


const POPULAR_CITIES = [
  { city:'Asunción',         countryCode:'PY', lat:-25.2867, lng:-57.647  },
  { city:'Buenos Aires',     countryCode:'AR', lat:-34.6037, lng:-58.3816 },
  { city:'Montevideo',       countryCode:'UY', lat:-34.9011, lng:-56.1645 },
  { city:'Santiago',         countryCode:'CL', lat:-33.4489, lng:-70.6693 },
  { city:'Lima',             countryCode:'PE', lat:-12.0464, lng:-77.0428 },
  { city:'Bogotá',           countryCode:'CO', lat:4.7110,   lng:-74.0721 },
  { city:'Ciudad de México', countryCode:'MX', lat:19.4326,  lng:-99.1332 },
  { city:'São Paulo',        countryCode:'BR', lat:-23.5505, lng:-46.6333 },
  { city:'Madrid',           countryCode:'ES', lat:40.4168,  lng:-3.7038  },
  { city:'New York',         countryCode:'US', lat:40.7128,  lng:-74.0060 },
]

export function useLocation() {
  const [location, setLocationState] = useState<LocationState>({ city:'Global', countryCode:'ALL', lat:null, lng:null })
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('tiperous_location')
    if (saved) { try { setLocationState(JSON.parse(saved)); return } catch {} }
    setDetecting(true)
    fetch('/api/detect-location').then(r=>r.json()).then(data => {
      const loc: LocationState = { city:data.city, countryCode:data.countryCode, lat:data.lat, lng:data.lng }
      setLocationState(loc)
      localStorage.setItem('tiperous_location', JSON.stringify(loc))
    }).finally(()=>setDetecting(false))
  }, [])

  function setLocation(loc: LocationState) {
    localStorage.setItem('tiperous_location', JSON.stringify(loc))
    setLocationState(loc)
    window.dispatchEvent(new CustomEvent('locationChange', { detail: loc }))
  }

  function resetToGPS() {
    if (!navigator.geolocation) { alert('Tu navegador no soporta GPS'); return }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=es`)
          const d = await r.json()
          const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || 'Mi ubicación'
          const cc   = (d.address?.country_code || 'other').toUpperCase()
          setLocation({ city, countryCode:cc, lat:pos.coords.latitude, lng:pos.coords.longitude })
        } catch {
          setLocation({ city:'Mi ubicación', countryCode:'OTHER', lat:pos.coords.latitude, lng:pos.coords.longitude })
        }
        setDetecting(false)
      },
      () => { setDetecting(false); alert('No pudimos acceder a tu ubicación. Verificá los permisos.') },
      { enableHighAccuracy:false, timeout:10000, maximumAge:60000 }
    )
  }

  return { location, setLocation, resetToGPS, detecting }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile } = useAuth()
  const { location, setLocation, resetToGPS, detecting } = useLocation()
  const [showPicker,  setShowPicker]  = useState(false)
  const [citySearch,  setCitySearch]  = useState('')
  const [tipPressed,  setTipPressed]  = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const initials  = (profile?.full_name || profile?.username || user?.email || 'U')[0].toUpperCase()

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    if (showPicker) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showPicker])

  const filteredCities = citySearch.trim()
    ? POPULAR_CITIES.filter(c=>c.city.toLowerCase().includes(citySearch.toLowerCase()))
    : POPULAR_CITIES

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', maxWidth:600, margin:'0 auto', position:'relative' }}>
      <div className="grain-overlay" aria-hidden />

      {/* Header */}
      <header style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(12,12,14,0.85)', backdropFilter:'blur(24px) saturate(180%)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 18px' }}>
          <Link href="/" style={{ textDecoration:"none" }}><img src="/logo-text-v2.png" alt="Tiperous" style={{ height:52, width:"auto" }} /></Link>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* City picker */}
            <div style={{ position:'relative' }} ref={pickerRef}>
              <button onClick={()=>{ setShowPicker(!showPicker); setCitySearch('') }} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'6px 12px', borderRadius:20,
                background:'rgba(255,255,255,0.08)',
                backdropFilter:'blur(12px)',
                border:'1px solid rgba(255,255,255,0.12)',
                color:'var(--text)', fontFamily:'inherit', fontWeight:600, fontSize:13,
                cursor:'pointer', transition:'all .15s',
              }}>
                <span style={{ fontSize:14 }}>📍</span>
                <span style={{ color:detecting?'var(--muted)':'var(--text)', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {detecting ? '...' : location.city.slice(0,3).toUpperCase()}
                </span>
                <span style={{ color:'var(--muted)', fontSize:10 }}>▾</span>
              </button>

              {showPicker && (
                <div style={{
                  position:'absolute', top:'calc(100% + 8px)', right:0,
                  background:'rgba(20,20,22,0.96)', borderRadius:16, padding:8,
                  border:'1px solid rgba(255,255,255,0.1)', width:220,
                  boxShadow:'0 8px 40px rgba(0,0,0,0.6)', zIndex:300,
                  backdropFilter:'blur(20px)',
                }}>
                  <input value={citySearch} onChange={e=>setCitySearch(e.target.value)}
                    placeholder="Buscar ciudad…" autoFocus
                    style={{ width:'100%',padding:'8px 12px',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'var(--text)',fontSize:16,outline:'none',fontFamily:'inherit',marginBottom:6,boxSizing:'border-box' }}/>
                  <button onClick={()=>{ resetToGPS(); setShowPicker(false) }} style={{
                    display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 12px',borderRadius:9,border:'none',cursor:'pointer',
                    background:'rgba(232,52,28,0.12)',color:'var(--red)',fontFamily:'inherit',fontSize:13,fontWeight:700,marginBottom:4,textAlign:'left',
                  }}>🎯 Usar mi ubicación GPS</button>
                  <div style={{ height:1,background:'rgba(255,255,255,0.06)',margin:'4px 0 8px' }}/>
                  <div style={{ maxHeight:240,overflowY:'auto' }}>
                    {filteredCities.map(c=>(
                      <button key={c.city} onClick={()=>{ setLocation({city:c.city,countryCode:c.countryCode,lat:c.lat,lng:c.lng}); setShowPicker(false) }} style={{
                        display:'flex',alignItems:'center',gap:10,width:'100%',padding:'8px 12px',borderRadius:9,border:'none',cursor:'pointer',
                        background:location.city===c.city?'rgba(255,255,255,0.08)':'transparent',
                        color:location.city===c.city?'var(--text)':'var(--muted2)',
                        fontFamily:'inherit',fontSize:13,fontWeight:location.city===c.city?700:400,transition:'all .12s',textAlign:'left',
                      }}>
                        <span style={{ fontSize:12,color:'var(--muted)',minWidth:24 }}>{c.countryCode}</span>
                        {c.city}
                        {location.city===c.city && <span style={{ marginLeft:'auto',color:'var(--red)' }}>✓</span>}
                      </button>
                    ))}
                    {citySearch.trim().length > 1 && !filteredCities.find(c=>c.city.toLowerCase()===citySearch.toLowerCase()) && (
                      <button onClick={()=>{ setLocation({ city:citySearch.trim(), countryCode:'', lat:null, lng:null }); setShowPicker(false) }} style={{
                        display:'flex',alignItems:'center',gap:8,width:'100%',padding:'9px 12px',borderRadius:9,border:'none',cursor:'pointer',
                        background:'rgba(232,52,28,0.1)',color:'var(--red)',
                        fontFamily:'inherit',fontSize:13,fontWeight:700,textAlign:'left',marginTop:4,
                      }}>
                        📍 Usar "{citySearch.trim()}"
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!profile?.is_business && (
              <Link href="/business/register" style={{
                padding:'6px 10px',borderRadius:20,
                background:'rgba(255,255,255,0.06)',
                border:'1px solid rgba(255,255,255,0.1)',
                backdropFilter:'blur(12px)',
                color:'var(--muted2)',fontWeight:600,fontSize:12,textDecoration:'none',whiteSpace:'nowrap',
              }}>🏢</Link>
            )}

            {user ? (
              <Link href="/profile" style={{
                width:36,height:36,borderRadius:'50%',
                background:'linear-gradient(135deg,#c0392b,#8e0000)',
                display:'flex',alignItems:'center',justifyContent:'center',
                color:'#fff',fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:15,
                textDecoration:'none',flexShrink:0,
                border:pathname==='/profile'?'2px solid var(--red)':'2px solid transparent',
              }}>{initials}</Link>
            ) : (
              <Link href="/login" style={{
                padding:'7px 14px',borderRadius:20,
                background:'linear-gradient(135deg,#e8341c,#a82010)',
                color:'#fff',fontWeight:700,fontSize:13,textDecoration:'none',
              }}>Ingresar</Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ padding:'16px 14px 120px' }}>{children}</main>

      {/* Liquid Glass Bottom Nav */}
      <nav style={{
        position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
        width:'100%', maxWidth:600, zIndex:200,
        paddingBottom:'max(12px, env(safe-area-inset-bottom))',
      }}>
        {/* Glass pill */}
        <div style={{
          margin:'0 16px 12px',
          background:'rgba(18,18,20,0.75)',
          backdropFilter:'blur(40px) saturate(200%)',
          WebkitBackdropFilter:'blur(40px) saturate(200%)',
          borderRadius:32,
          border:'1px solid rgba(255,255,255,0.12)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          display:'flex', alignItems:'center',
          padding:'8px 8px',
          position:'relative',
        }}>
          {/* Explore */}
          <NavBtn href="/" active={pathname==='/'} label="Explore" icon={<SearchIcon active={pathname==='/'}/>}/>

          {/* Tip FAB — speech bubble icon */}
          <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center' }}>
            <button
              onMouseDown={()=>setTipPressed(true)}
              onMouseUp={()=>setTipPressed(false)}
              onMouseLeave={()=>setTipPressed(false)}
              onTouchStart={()=>setTipPressed(true)}
              onTouchEnd={()=>setTipPressed(false)}
              onClick={()=>{ if (!user){router.push('/login');return} router.push('/tip') }}
              style={{
                width:62, height:62,
                borderRadius:'50%',
                background: tipPressed
                  ? 'radial-gradient(circle at 35% 35%, #ff6b4a, #c0392b)'
                  : 'radial-gradient(circle at 35% 35%, #ff5a38, #e8341c 50%, #a82010)',
                border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                position:'relative',
                transition:'transform 0.12s, box-shadow 0.12s',
                transform: tipPressed ? 'scale(0.93)' : 'scale(1)',
                boxShadow: tipPressed
                  ? '0 2px 8px rgba(232,52,28,0.4), inset 0 2px 4px rgba(0,0,0,0.3)'
                  : '0 6px 24px rgba(232,52,28,0.55), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {/* Speech bubble + star SVG */}
              <svg width="34" height="34" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="3" width="36" height="28" rx="9" fill="rgba(255,255,255,0.95)"/>
                <polygon points="12,31 20,31 16,40" fill="rgba(255,255,255,0.95)"/>
                {/* Highlight */}
                <rect x="6" y="4" width="20" height="8" rx="5" fill="rgba(255,255,255,0.4)"/>
                {/* Star */}
                <polygon
                  points="22,8 24.5,15.5 32.5,15.5 26,20 28.5,27.5 22,23 15.5,27.5 18,20 11.5,15.5 19.5,15.5"
                  fill="#e8341c"
                />
              </svg>
            </button>
          </div>

          {/* Timeline */}
          <NavBtn href="/timeline" active={pathname==='/timeline'} label="Timeline" icon={<ClockIcon active={pathname==='/timeline'}/>}/>
        </div>
      </nav>
    </div>
  )
}

function NavBtn({ href, active, label, icon }: { href:string; active:boolean; label:string; icon:React.ReactNode }) {
  return (
    <Link href={href} style={{
      flex:1, padding:'8px 0 6px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:3,
      textDecoration:'none',
      color: active ? 'var(--red)' : 'rgba(255,255,255,0.4)',
      transition:'color .15s',
    }}>
      {icon}
      <span style={{ fontSize:10, fontWeight:600, letterSpacing:.3 }}>{label}</span>
    </Link>
  )
}

function SearchIcon({ active }: { active:boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.5:1.8} strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function ClockIcon({ active }: { active:boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.5:1.8} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
