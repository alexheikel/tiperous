'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { getUserLevel, LEVELS, VIBE_CONFIG, COUNTRY_FLAGS } from '@/lib/levels'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, signOut, loading } = useAuth()
  const supabase = createClient()
  const [fullName,  setFullName]  = useState('')
  const [bio,       setBio]       = useState('')
  const [username,  setUsername]  = useState('')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [countries,  setCountries]  = useState<string[]>([])
  const [claimedCompanies, setClaimedCompanies] = useState<any[]>([])
  const [showLevels, setShowLevels] = useState(false)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name||'')
      setBio(profile.bio||'')
      setUsername(profile.username||'')
    }
  }, [profile])

  useEffect(() => {
    if (!user) return
    // Fetch countries via tips → companies
    if (profile?.is_business) {
      fetch('/api/business/claims').then(r=>r.json()).then(d => {
        setClaimedCompanies(d.data||[])
      })
    }

    supabase.from('tips').select('company_id').eq('user_id', user.id)
      .then(({ data: tips }) => {
        if (!tips?.length) return
        const ids = [...new Set(tips.map(t => t.company_id))]
        supabase.from('companies').select('country').in('id', ids)
          .then(({ data: companies }) => {
            const flags = [...new Set((companies||[]).map((c:any)=>c.country).filter(Boolean))]
            setCountries(flags as string[])
          })
      })
  }, [user])

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}>
      <div className="animate-spin" style={{ width:32,height:32,border:'2px solid var(--border2)',borderTopColor:'var(--red)',borderRadius:'50%' }}/>
    </div>
  )
  if (!user) { router.push('/login'); return null }

  const initials = (profile?.full_name||profile?.username||user.email||'U')[0].toUpperCase()
  const { level, score, vibe, vibePercent, breakdown } = getUserLevel(profile as any || {})
  const vibeConf = VIBE_CONFIG[vibe]
  const nextLevel = LEVELS.find(l => l.minScore > score)
  const progress  = nextLevel
    ? Math.min(100, Math.round(((score - level.minScore) / (nextLevel.minScore - level.minScore)) * 100))
    : 100

  // Community average vibe (rough: 60% is neutral)
  const communityAvg = 60
  const myPosition   = vibePercent
  const diff         = myPosition - communityAvg

  async function handleSave() {
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: fullName.trim(),
      bio:       bio.trim(),
      username:  username.trim() || profile?.username,
    }).eq('id', user!.id)
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth:480, margin:'0 auto' }}>

      {/* ── Hero card ── */}
      <div style={{
        background:'linear-gradient(135deg,#180a08,#1e0c0a)',
        borderRadius:20, padding:'22px 18px', marginBottom:16,
        border:'1px solid rgba(232,52,28,0.15)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(232,52,28,0.08),transparent 70%)',pointerEvents:'none' }}/>

        {/* Top row */}
        <div style={{ display:'flex',alignItems:'flex-start',gap:14,marginBottom:18 }}>
          <div style={{ position:'relative',flexShrink:0 }}>
            <div style={{ width:66,height:66,borderRadius:'50%',background:'linear-gradient(135deg,#c0392b,#8e0000)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:26,boxShadow:'0 6px 20px rgba(192,57,43,0.4)' }}>{initials}</div>
            <div style={{ position:'absolute',bottom:-4,right:-4,background:level.color,borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,border:'2px solid #0c0c0e' }}>{level.emoji}</div>
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:19,marginBottom:2,display:'flex',alignItems:'center',gap:6 }}>
              {profile?.full_name||profile?.username||'Tu perfil'}
            </div>
            {profile?.username && <div style={{ color:'var(--muted)',fontSize:13,marginBottom:4 }}>@{profile.username}</div>}
            {/* Country flags */}
            {countries.length>0 && (
              <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginTop:2 }}>
                {countries.map(c=>(
                  <span key={c} style={{ fontSize:18 }} title={c}>
                    {COUNTRY_FLAGS[c]||'🌍'}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:6,flexShrink:0 }}>
            {profile?.username && (
              <Link href={`/u/${profile.username}`} style={{ padding:'6px 12px',borderRadius:10,background:'var(--red)',color:'#fff',fontWeight:700,fontSize:12,textDecoration:'none',textAlign:'center',boxShadow:'0 2px 10px rgba(232,52,28,0.3)' }}>
                Ver perfil
              </Link>
            )}
            <button onClick={handleSave} disabled={saving} style={{ padding:'6px 12px',borderRadius:10,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--muted2)',fontWeight:600,fontSize:12,cursor:'pointer' }}>
              {saving?'…':saved?'✓':'Guardar'}
            </button>
          </div>
        </div>

        {/* Level bar */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ fontSize:16 }}>{level.emoji}</span>
              <span style={{ fontWeight:700,fontSize:14,color:level.color }}>{level.name}</span>
              <span style={{ fontSize:10,color:'var(--muted)',background:'rgba(255,255,255,0.06)',padding:'2px 7px',borderRadius:99 }}>Nv.{level.level}</span>
            </div>
            <span style={{ fontSize:11,color:'var(--muted)' }}>
              {nextLevel ? `${score}/${nextLevel.minScore} pts` : '👑 Máximo'}
            </span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.07)',borderRadius:99,height:5,overflow:'hidden',marginBottom:4 }}>
            <div style={{ width:`${progress}%`,height:'100%',background:`linear-gradient(90deg,${level.color},${level.color}99)`,borderRadius:99,transition:'width .6s ease' }}/>
          </div>
          <div style={{ fontSize:11,color:'var(--muted)' }}>{level.desc}</div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14 }}>
          {[
            { label:'Tips',       val:profile?.tips_count||0,      color:'var(--text)'  },
            { label:'Positivos',  val:profile?.good_tips_count||0, color:'var(--green)' },
            { label:'Críticos',   val:profile?.bad_tips_count||0,  color:'var(--bad)'   },
            { label:'Seguidores', val:profile?.followers_count||0, color:'#7c9ab5'      },
          ].map(({label,val,color})=>(
            <div key={label} style={{ textAlign:'center',background:'rgba(255,255,255,0.04)',borderRadius:10,padding:'8px 4px' }}>
              <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:18,color }}>{val}</div>
              <div style={{ color:'var(--muted)',fontSize:10,marginTop:1 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Vibe meter */}
        <div style={{ background:'rgba(255,255,255,0.04)',borderRadius:12,padding:'12px 14px',border:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ fontSize:16 }}>{vibeConf.emoji}</span>
              <span style={{ fontSize:12,color:'var(--muted2)' }}>Balance de tips</span>
            </div>
            <span style={{ fontSize:12,fontWeight:700,color:vibeConf.color }}>{vibeConf.label}</span>
          </div>

          {/* Meter bar */}
          <div style={{ position:'relative',marginBottom:6 }}>
            {/* Background gradient: red → yellow → green */}
            <div style={{ height:8,borderRadius:99,background:'linear-gradient(90deg,#e8341c 0%,#e8b84b 50%,#1db954 100%)',overflow:'visible',position:'relative' }}>
              {/* Community average marker */}
              <div style={{ position:'absolute',top:-4,left:`${communityAvg}%`,transform:'translateX(-50%)',width:2,height:16,background:'rgba(255,255,255,0.4)',borderRadius:1 }}/>
              {/* My position marker */}
              <div style={{
                position:'absolute',top:-5,left:`${myPosition}%`,transform:'translateX(-50%)',
                width:18,height:18,borderRadius:'50%',
                background:vibeConf.color,border:'2px solid #0c0c0e',
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:9,boxShadow:`0 0 8px ${vibeConf.color}66`,
                transition:'left .5s ease',
              }}>{vibeConf.emoji}</div>
            </div>
          </div>

          <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--muted)',marginTop:10 }}>
            <span>😤 Más crítico</span>
            <span style={{ color:'rgba(255,255,255,0.25)',fontSize:9 }}>
              {diff > 5 ? `+${diff}% vs promedio` : diff < -5 ? `${diff}% vs promedio` : 'cerca del promedio'}
            </span>
            <span>😊 Más positivo</span>
          </div>
        </div>
        {/* Managed companies */}
        {claimedCompanies.length > 0 && (
          <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(232,52,28,0.06)', borderRadius:12, border:'1px solid rgba(232,52,28,0.15)' }}>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:8, fontWeight:700, letterSpacing:1 }}>🏢 EMPRESA QUE MANEJÁS</div>
            {claimedCompanies.map((claim:any) => (
              <a key={claim.company_id} href={`/c/${claim.company?.slug}`} style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#c0392b,#8e0000)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }}>
                  {claim.company?.name?.[0]}
                </div>
                <div>
                  <div style={{ color:'var(--text)', fontWeight:700, fontSize:14 }}>{claim.company?.name}</div>
                  <div style={{ color:'var(--red)', fontSize:11 }}>Ver perfil de empresa →</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit form ── */}
      <div style={{ background:'var(--card)',borderRadius:16,padding:16,border:'1px solid var(--border)',marginBottom:14 }}>
        <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Tu nombre completo"
            style={{ width:'100%',padding:'11px 14px',borderRadius:12,background:'var(--bg)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:14,outline:'none' }}/>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',fontSize:14 }}>@</span>
            <input value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,30))}
              placeholder="tu_usuario"
              style={{ width:'100%',padding:'11px 14px 11px 28px',borderRadius:12,background:'var(--bg)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:14,outline:'none' }}/>
          </div>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Bio..." rows={2}
            style={{ width:'100%',padding:'11px 14px',borderRadius:12,background:'var(--bg)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:13,resize:'none',outline:'none',lineHeight:1.6,fontFamily:'inherit' }}/>
          <button onClick={handleSave} disabled={saving} style={{ padding:'11px',borderRadius:12,background:'linear-gradient(135deg,#e8341c,#a82010)',color:'#fff',fontWeight:700,fontSize:14,border:'none',cursor:'pointer',opacity:saving?.7:1 }}>
            {saving?'Guardando…':saved?'✓ Guardado':'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* ── Levels table ── */}
      <button onClick={()=>setShowLevels(!showLevels)} style={{ width:'100%',padding:'12px',borderRadius:14,background:'var(--card)',border:'1px solid var(--border)',color:'var(--muted2)',fontFamily:'inherit',fontWeight:600,fontSize:13,cursor:'pointer',marginBottom:showLevels?0:14,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span>🏆 Ver todos los niveles</span>
        <span>{showLevels?'▲':'▼'}</span>
      </button>
      {showLevels && (
        <div style={{ background:'var(--card)',borderRadius:'0 0 14px 14px',padding:'0 16px 16px',border:'1px solid var(--border)',borderTop:'none',marginBottom:14 }}>
          {LEVELS.map(l=>(
            <div key={l.level} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',opacity:score<l.minScore?.5:1 }}>
              <span style={{ fontSize:18,minWidth:26 }}>{l.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13,fontWeight:700,color:l.level===level.level?l.color:'var(--text)',display:'flex',alignItems:'center',gap:6 }}>
                  {l.name}{l.level===level.level&&<span style={{ fontSize:10,background:l.color+'22',color:l.color,padding:'1px 6px',borderRadius:99 }}>tú</span>}
                </div>
                <div style={{ fontSize:11,color:'var(--muted)' }}>{l.desc}</div>
              </div>
              <div style={{ fontSize:11,color:'var(--muted)',whiteSpace:'nowrap' }}>{l.minScore} pts</div>
            </div>
          ))}
          <div style={{ marginTop:12,fontSize:11,color:'var(--muted)',lineHeight:1.6 }}>
            Fórmula: (tips×2) + buenos + seguidores − (denuncias×5) − penalidad por ratio negativo
          </div>
        </div>
      )}

      <button onClick={async()=>{ await signOut(); router.push('/') }} style={{ width:'100%',padding:12,borderRadius:14,background:'transparent',border:'1px solid var(--border2)',color:'var(--muted2)',fontFamily:'inherit',fontWeight:600,fontSize:13,cursor:'pointer' }}>
        Cerrar sesión
      </button>
    </div>
  )
}
