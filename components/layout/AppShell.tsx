'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

const COUNTRIES = [
  { code:'ALL', flag:'🌎', name:'Global' },
  { code:'AR',  flag:'🇦🇷', name:'Argentina' },
  { code:'PY',  flag:'🇵🇾', name:'Paraguay' },
  { code:'UY',  flag:'🇺🇾', name:'Uruguay' },
  { code:'BR',  flag:'🇧🇷', name:'Brasil' },
  { code:'CL',  flag:'🇨🇱', name:'Chile' },
  { code:'MX',  flag:'🇲🇽', name:'México' },
  { code:'CO',  flag:'🇨🇴', name:'Colombia' },
  { code:'US',  flag:'🇺🇸', name:'USA' },
]

export function useCountry() {
  const [country, setCountryState] = useState<string>('ALL')
  useEffect(() => {
    const saved = localStorage.getItem('tiperous_country') || 'ALL'
    setCountryState(saved)
  }, [])
  function setCountry(code: string) {
    localStorage.setItem('tiperous_country', code)
    setCountryState(code)
    window.dispatchEvent(new CustomEvent('countryChange', { detail: code }))
  }
  return { country, setCountry }
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile } = useAuth()
  const { country, setCountry } = useCountry()
  const [showCountry, setShowCountry] = useState(false)
  const initials = (profile?.full_name || profile?.username || user?.email || 'U')[0].toUpperCase()
  const selectedCountry = COUNTRIES.find(c=>c.code===country) || COUNTRIES[0]

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
            {/* Country selector */}
            <div style={{ position:'relative' }}>
              <button onClick={()=>setShowCountry(!showCountry)} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'6px 10px', borderRadius:10,
                background:'var(--card)', border:'1px solid var(--border2)',
                color:'var(--text)', fontFamily:'inherit', fontWeight:600, fontSize:13,
                cursor:'pointer', transition:'all .15s',
              }}>
                <span style={{ fontSize:16 }}>{selectedCountry.flag}</span>
                <span style={{ color:'var(--muted2)', fontSize:12 }}>{selectedCountry.code}</span>
                <span style={{ color:'var(--muted)', fontSize:10 }}>▾</span>
              </button>

              {showCountry && (
                <div style={{
                  position:'absolute', top:'calc(100% + 8px)', right:0,
                  background:'var(--surface)', borderRadius:14, padding:6,
                  border:'1px solid var(--border2)', width:160,
                  boxShadow:'0 8px 32px rgba(0,0,0,0.4)', zIndex:200,
                }}>
                  {COUNTRIES.map(c => (
                    <button key={c.code} onClick={()=>{ setCountry(c.code); setShowCountry(false) }} style={{
                      display:'flex', alignItems:'center', gap:10, width:'100%',
                      padding:'8px 12px', borderRadius:9, border:'none', cursor:'pointer',
                      background: country===c.code ? 'var(--card2)' : 'transparent',
                      color: country===c.code ? 'var(--text)' : 'var(--muted2)',
                      fontFamily:'inherit', fontSize:13, fontWeight: country===c.code ? 700 : 400,
                      transition:'all .12s', textAlign:'left',
                    }}>
                      <span style={{ fontSize:18 }}>{c.flag}</span>
                      {c.name}
                    </button>
                  ))}
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

        {/* Click outside to close */}
        {showCountry && (
          <div style={{ position:'fixed', inset:0, zIndex:150 }} onClick={()=>setShowCountry(false)}/>
        )}
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
          >★</button>
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
