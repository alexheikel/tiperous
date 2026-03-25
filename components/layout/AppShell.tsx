'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

const NAV = [
  { href: '/',          label: 'Explore',  icon: <CircleIcon /> },
  { href: '/timeline',  label: 'Timeline', icon: <ClockIcon /> },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, profile, signOut } = useAuth()

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', maxWidth:600, margin:'0 auto', position:'relative' }}>
      {/* Grain */}
      <div className="grain-overlay" aria-hidden />

      {/* Header */}
      <header style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(12,12,14,0.92)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--border)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{
              width:32, height:32, borderRadius:9,
              background:'linear-gradient(135deg,#e8341c,#a82010)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:17, boxShadow:'0 2px 10px rgba(232,52,28,0.4)',
            }}>★</div>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:21, color:'#f0f0f2', letterSpacing:'-0.5px' }}>
              Tiperous
            </span>
          </Link>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {user ? (
              <>
                <Link href="/profile" style={{
                  width:34, height:34, borderRadius:'50%',
                  background:'linear-gradient(135deg,#c0392b,#8e0000)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#fff', fontFamily:'var(--font-display)', fontWeight:700, fontSize:14,
                  textDecoration:'none', flexShrink:0,
                }}>
                  {(profile?.full_name || profile?.username || 'U')[0].toUpperCase()}
                </Link>
              </>
            ) : (
              <Link href="/login" style={{
                padding:'7px 16px', borderRadius:10,
                background:'linear-gradient(135deg,#e8341c,#a82010)',
                color:'#fff', fontWeight:700, fontSize:13,
                textDecoration:'none', boxShadow:'0 2px 10px rgba(232,52,28,0.3)',
              }}>
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main style={{ padding:'20px 16px 100px' }}>
        {children}
      </main>

      {/* Bottom nav */}
      <nav style={{
        position:'fixed', bottom:0,
        left:'50%', transform:'translateX(-50%)',
        width:'100%', maxWidth:600,
        background:'rgba(14,14,16,0.95)', backdropFilter:'blur(20px)',
        borderTop:'1px solid var(--border)',
        display:'flex', zIndex:200,
      }}>
        {/* Explore */}
        <NavBtn href="/" active={pathname === '/'} label="Explore" icon={<ExploreIcon />} />

        {/* Tip FAB */}
        <div style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center' }}>
          <button
            onClick={() => {
              if (!user) { router.push('/login'); return }
              // The tip modal is opened from company pages — redirect to explore with modal hint
              router.push('/?tip=1')
            }}
            style={{
              width:52, height:52, borderRadius:'50%',
              background:'linear-gradient(135deg,#e8341c,#a82010)',
              color:'#fff', fontSize:24, border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              marginTop:-22,
              boxShadow:'0 4px 24px rgba(232,52,28,0.5)',
              outline:'3px solid var(--bg)',
              transition:'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
          >★</button>
          <span style={{ position:'absolute', bottom:6, fontSize:11, fontWeight:600, color: pathname==='/'?'var(--red)':'var(--muted)' }}>Tip</span>
        </div>

        {/* Timeline */}
        <NavBtn href="/timeline" active={pathname === '/timeline'} label="Timeline" icon={<ClockIcon />} />
      </nav>
    </div>
  )
}

function NavBtn({ href, active, label, icon }: { href:string; active:boolean; label:string; icon:React.ReactNode }) {
  return (
    <Link href={href} style={{
      flex:1, padding:'12px 0 14px',
      display:'flex', flexDirection:'column', alignItems:'center', gap:3,
      textDecoration:'none',
      color: active ? 'var(--red)' : 'var(--muted)',
      transition:'color 0.15s',
    }}>
      {icon}
      <span style={{ fontSize:11, fontWeight:600 }}>{label}</span>
    </Link>
  )
}

// Icons
function ExploreIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
}
function ClockIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function CircleIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
}
