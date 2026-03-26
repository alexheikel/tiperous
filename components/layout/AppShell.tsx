'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile } = useAuth()
  const initials = (profile?.full_name || profile?.username || user?.email || 'U')[0].toUpperCase()

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', maxWidth:600, margin:'0 auto', position:'relative' }}>
      <div className="grain-overlay" aria-hidden />

      {/* Header */}
      <header style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(12,12,14,0.94)', backdropFilter:'blur(24px)',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{
              width:34, height:34, borderRadius:10,
              background:'linear-gradient(135deg,#e8341c,#a82010)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, boxShadow:'0 3px 12px rgba(232,52,28,0.45)',
            }}>★</div>
            <span style={{ fontFamily:'Playfair Display, Georgia, serif', fontWeight:900, fontSize:22, color:'#f0f0f2', letterSpacing:'-.5px' }}>
              Tiperous
            </span>
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {user ? (
              <Link href="/profile" style={{
                width:36, height:36, borderRadius:'50%',
                background:'linear-gradient(135deg,#c0392b,#8e0000)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontFamily:'Playfair Display, serif', fontWeight:700, fontSize:15,
                textDecoration:'none', flexShrink:0,
                boxShadow:'0 2px 10px rgba(192,57,43,0.3)',
                border: pathname==='/profile' ? '2px solid var(--red)' : '2px solid transparent',
              }}>{initials}</Link>
            ) : (
              <Link href="/login" style={{
                padding:'7px 18px', borderRadius:10,
                background:'linear-gradient(135deg,#e8341c,#a82010)',
                color:'#fff', fontWeight:700, fontSize:13,
                textDecoration:'none', boxShadow:'0 2px 10px rgba(232,52,28,0.3)',
                letterSpacing:'.2px',
              }}>Ingresar</Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ padding:'20px 18px 100px' }}>{children}</main>

      {/* Bottom nav */}
      <nav style={{
        position:'fixed', bottom:0,
        left:'50%', transform:'translateX(-50%)',
        width:'100%', maxWidth:600,
        background:'rgba(12,12,14,0.96)', backdropFilter:'blur(24px)',
        borderTop:'1px solid var(--border)',
        display:'flex', zIndex:200,
      }}>
        <NavBtn href="/"         active={pathname==='/'         } label="Explore"  icon={<SearchIcon  active={pathname==='/'         }/>} />
        <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', padding:'8px 0 12px' }}>
          <button onClick={() => { if (!user) { router.push('/login'); return } router.push('/?tip=1') }} style={{
            width:54, height:54, borderRadius:'50%',
            background:'linear-gradient(135deg,#e8341c,#a82010)',
            color:'#fff', fontSize:24, border:'3px solid var(--bg)', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            marginTop:-24, boxShadow:'0 4px 24px rgba(232,52,28,0.55)',
            transition:'transform .15s, box-shadow .15s',
          }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
          >★</button>
          <span style={{ fontSize:11, fontWeight:600, color:'var(--muted)', marginTop:2 }}>Tip</span>
        </div>
        <NavBtn href="/timeline" active={pathname==='/timeline' } label="Timeline" icon={<ClockIcon   active={pathname==='/timeline' }/>} />
      </nav>
    </div>
  )
}

function NavBtn({ href, active, label, icon }: { href:string; active:boolean; label:string; icon:React.ReactNode }) {
  return (
    <Link href={href} style={{
      flex:1, padding:'14px 0 14px', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
      textDecoration:'none', color: active ? 'var(--red)' : 'var(--muted)', transition:'color .15s',
    }}>
      {icon}
      <span style={{ fontSize:11, fontWeight:600 }}>{label}</span>
    </Link>
  )
}

function SearchIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.5:2} strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function ClockIcon({ active }: { active: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.5:2} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
