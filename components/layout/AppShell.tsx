'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect, useRef } from 'react'

export interface LocationState {
  city:        string
  countryCode: string
  lat:         number | null
  lng:         number | null
}

const DEFAULT_LOCATION: LocationState = { city:'Global', countryCode:'ALL', lat:null, lng:null }

export function useLocation() {
  const [location, setLocationState] = useState<LocationState>(DEFAULT_LOCATION)
  const [detecting, setDetecting]    = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('tiperous_location')
    if (saved) {
      try { setLocationState(JSON.parse(saved)); return } catch {}
    }
    // Auto-detect from IP
    setDetecting(true)
    fetch('/api/detect-location')
      .then(r => r.json())
      .then(data => {
        const loc: LocationState = { city: data.city, countryCode: data.countryCode, lat: data.lat, lng: data.lng }
        setLocationState(loc)
        localStorage.setItem('tiperous_location', JSON.stringify(loc))
      })
      .finally(() => setDetecting(false))
  }, [])

  function setLocation(loc: LocationState) {
    localStorage.setItem('tiperous_location', JSON.stringify(loc))
    setLocationState(loc)
    window.dispatchEvent(new CustomEvent('locationChange', { detail: loc }))
  }

  function resetToGPS() {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(async pos => {
      const res  = await fetch(`/api/detect-location?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      const data = await res.json()
      const loc: LocationState = { city: data.city, countryCode: data.countryCode, lat: pos.coords.latitude, lng: pos.coords.longitude }
      setLocation(loc)
      setDetecting(false)
    }, () => setDetecting(false))
  }

  return { location, setLocation, resetToGPS, detecting }
}

const POPULAR_CITIES = [
  { city:'Asunción',     countryCode:'PY', lat:-25.2867, lng:-57.647  },
  { city:'Buenos Aires', countryCode:'AR', lat:-34.6037, lng:-58.3816 },
  { city:'Montevideo',   countryCode:'UY', lat:-34.9011, lng:-56.1645 },
  { city:'Santiago',     countryCode:'CL', lat:-33.4489, lng:-70.6693 },
  { city:'Lima',         countryCode:'PE', lat:-12.0464, lng:-77.0428 },
  { city:'Bogotá',       countryCode:'CO', lat:4.7110,   lng:-74.0721 },
  { city:'Ciudad de México', countryCode:'MX', lat:19.4326, lng:-99.1332 },
  { city:'São Paulo',    countryCode:'BR', lat:-23.5505, lng:-46.6333 },
  { city:'Madrid',       countryCode:'ES', lat:40.4168,  lng:-3.7038  },
  { city:'New York',     countryCode:'US', lat:40.7128,  lng:-74.0060 },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile } = useAuth()
  const { location, setLocation, resetToGPS, detecting } = useLocation()
  const [showPicker, setShowPicker]  = useState(false)
  const [citySearch, setCitySearch]  = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  const initials = (profile?.full_name || profile?.username || user?.email || 'U')[0].toUpperCase()

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    if (showPicker) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showPicker])

  const filteredCities = citySearch.trim()
    ? POPULAR_CITIES.filter(c => c.city.toLowerCase().includes(citySearch.toLowerCase()))
    : POPULAR_CITIES

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', maxWidth:600, margin:'0 auto', position:'relative' }}>
      <div className="grain-overlay" aria-hidden />

      <header style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(12,12,14,0.94)', backdropFilter:'blur(24px)',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 18px' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
            <img src="/logo.svg" alt="Tiperous" style={{ height:36, width:'auto' }} />
          </Link>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* City/Location picker */}
            <div style={{ position:'relative' }} ref={pickerRef}>
              <button onClick={()=>{ setShowPicker(!showPicker); setCitySearch('') }} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'6px 12px', borderRadius:10,
                background:'var(--card)', border:'1px solid var(--border2)',
                color:'var(--text)', fontFamily:'inherit', fontWeight:600, fontSize:13,
                cursor:'pointer', transition:'all .15s', maxWidth:160,
              }}>
                <span style={{ fontSize:15 }}>📍</span>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: detecting?'var(--muted)':'var(--text)' }}>
                  {detecting ? 'Detectando…' : location.city}
                </span>
                <span style={{ color:'var(--muted)', fontSize:10, flexShrink:0 }}>▾</span>
              </button>

              {showPicker && (
                <div style={{
                  position:'absolute', top:'calc(100% + 8px)', right:0,
                  background:'var(--surface)', borderRadius:16, padding:8,
                  border:'1px solid var(--border2)', width:220,
                  boxShadow:'0 8px 40px rgba(0,0,0,0.5)', zIndex:300,
                }}>
                  {/* Search */}
                  <input
                    value={citySearch}
                    onChange={e=>setCitySearch(e.target.value)}
                    placeholder="Buscar ciudad…"
                    autoFocus
                    style={{
                      width:'100%', padding:'8px 12px', borderRadius:10,
                      background:'var(--card)', border:'1px solid var(--border2)',
                      color:'var(--text)', fontSize:13, outline:'none',
                      fontFamily:'inherit', marginBottom:6, boxSizing:'border-box',
                    }}
                  />

                  {/* GPS option */}
                  <button onClick={()=>{ resetToGPS(); setShowPicker(false) }} style={{
                    display:'flex', alignItems:'center', gap:8, width:'100%',
                    padding:'8px 12px', borderRadius:9, border:'none', cursor:'pointer',
                    background:'rgba(232,52,28,0.08)', color:'var(--red)',
                    fontFamily:'inherit', fontSize:13, fontWeight:700,
                    marginBottom:4, textAlign:'left',
                  }}>
                    🎯 Usar mi ubicación GPS
                  </button>

                  <div style={{ height:1, background:'var(--border)', margin:'4px 0 8px' }}/>

                  {/* Cities list */}
                  <div style={{ maxHeight:240, overflowY:'auto' }}>
                    {filteredCities.map(c => (
                      <button key={c.city} onClick={()=>{ setLocation({ city:c.city, countryCode:c.countryCode, lat:c.lat, lng:c.lng }); setShowPicker(false) }} style={{
                        display:'flex', alignItems:'center', gap:10, width:'100%',
                        padding:'8px 12px', borderRadius:9, border:'none', cursor:'pointer',
                        background: location.city===c.city ? 'var(--card2)' : 'transparent',
                        color: location.city===c.city ? 'var(--text)' : 'var(--muted2)',
                        fontFamily:'inherit', fontSize:13,
                        fontWeight: location.city===c.city ? 700 : 400,
                        transition:'all .12s', textAlign:'left',
                      }}>
                        <span style={{ fontSize:12, color:'var(--muted)', minWidth:24 }}>{c.countryCode}</span>
                        {c.city}
                        {location.city===c.city && <span style={{ marginLeft:'auto', color:'var(--red)' }}>✓</span>}
                      </button>
                    ))}
                    {filteredCities.length===0 && (
                      <div style={{ padding:'12px', color:'var(--muted)', fontSize:13, textAlign:'center' }}>
                        No encontramos esa ciudad
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!profile?.is_business && (
              <Link href="/business/register" style={{
                padding:'6px 10px', borderRadius:10,
                background:'transparent', border:'1px solid var(--border2)',
                color:'var(--muted2)', fontWeight:600, fontSize:12,
                textDecoration:'none', whiteSpace:'nowrap',
              }}>Empresas</Link>
            )}

            {user ? (
              <Link href="/profile" style={{
                width:36, height:36, borderRadius:'50%',
                background:'linear-gradient(135deg,#c0392b,#8e0000)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:15,
                textDecoration:'none', flexShrink:0,
                border: pathname==='/profile' ? '2px solid var(--red)' : '2px solid transparent',
              }}>{initials}</Link>
            ) : (
              <Link href="/login" style={{
                padding:'7px 14px', borderRadius:10,
                background:'linear-gradient(135deg,#e8341c,#a82010)',
                color:'#fff', fontWeight:700, fontSize:13,
                textDecoration:'none',
              }}>Ingresar</Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ padding:'20px 18px 100px' }}>{children}</main>

      <nav style={{
        position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
        width:'100%', maxWidth:600,
        background:'rgba(12,12,14,0.96)', backdropFilter:'blur(24px)',
        borderTop:'1px solid var(--border)', display:'flex', zIndex:200,
      }}>
        <NavBtn href="/"         active={pathname==='/'         } label="Explore"  icon={<SearchIcon active={pathname==='/'         }/>} />
        <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', padding:'8px 0 12px' }}>
          <button onClick={() => { if (!user) { router.push('/login'); return } router.push('/tip') }} style={{
            width:54, height:54, borderRadius:'50%',
            background:'linear-gradient(135deg,#e8341c,#a82010)',
            color:'#fff', fontSize:24, border:'3px solid var(--bg)', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            marginTop:-24, boxShadow:'0 4px 24px rgba(232,52,28,0.55)',
            transition:'transform .15s',
          }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
          ><span style={{display:"inline-block",transform:"rotate(-12deg)",fontSize:"inherit"}}>★</span></button>
          <span style={{ fontSize:11, fontWeight:600, color:'var(--muted)', marginTop:2 }}>Tip</span>
        </div>
        <NavBtn href="/timeline" active={pathname==='/timeline'} label="Timeline" icon={<ClockIcon active={pathname==='/timeline'}/>} />
      </nav>
    </div>
  )
}

function NavBtn({ href, active, label, icon }: { href:string; active:boolean; label:string; icon:React.ReactNode }) {
  return (
    <Link href={href} style={{
      flex:1, padding:'14px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
      textDecoration:'none', color:active?'var(--red)':'var(--muted)', transition:'color .15s',
    }}>
      {icon}
      <span style={{ fontSize:11, fontWeight:600 }}>{label}</span>
    </Link>
  )
}
function SearchIcon({ active }: { active:boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.5:2} strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function ClockIcon({ active }: { active:boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.5:2} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
