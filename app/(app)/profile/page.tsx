'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { getUserLevel, LEVELS, VIBE_CONFIG } from '@/lib/levels'

export default function ProfilePage() {
  const router   = useRouter()
  const { user, profile, signOut, loading } = useAuth()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [bio,      setBio]      = useState('')
  const [username, setUsername] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [countries, setCountries] = useState<string[]>([])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name||'')
      setBio(profile.bio||'')
      setUsername(profile.username||'')
    }
  }, [profile])

  useEffect(() => {
    if (!user) return
    // Fetch countries where user has tipped
    supabase.from('tips')
      .select('company:companies(country)')
      .eq('user_id', user.id)
      .then(({ data }) => {
        const flags = [...new Set(
          (data||[]).map((t:any) => t.company?.country).filter(Boolean)
        )]
        setCountries(flags)
      })
  }, [user])

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh' }}>
      <div className="animate-spin" style={{ width:32,height:32,border:'2px solid var(--border2)',borderTopColor:'var(--red)',borderRadius:'50%' }}/>
    </div>
  )
  if (!user) { router.push('/login'); return null }

  const initials = (profile?.full_name||profile?.username||user.email||'U')[0].toUpperCase()
  const { level, score, vibe, vibePercent } = getUserLevel(profile as any || {})
  const vibeConf = VIBE_CONFIG[vibe]

  // Progress to next level
  const nextLevel  = LEVELS.find(l => l.minScore > score)
  const prevMin    = level.minScore
  const nextMin    = nextLevel?.minScore || prevMin + 100
  const progress   = Math.min(100, Math.round(((score - prevMin) / (nextMin - prevMin)) * 100))

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
      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg,#180a08,#200e0a)',
        borderRadius:20, padding:'24px 20px', marginBottom:20,
        border:'1px solid rgba(232,52,28,0.15)',
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:20 }}>
          <div style={{ position:'relative' }}>
            <div style={{
              width:68, height:68, borderRadius:'50%',
              background:'linear-gradient(135deg,#c0392b,#8e0000)',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:28,
              boxShadow:'0 6px 24px rgba(192,57,43,0.4)',
            }}>{initials}</div>
            {/* Level badge */}
            <div style={{
              position:'absolute', bottom:-4, right:-4,
              background: level.color, borderRadius:'50%',
              width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:14, border:'2px solid var(--bg)',
            }}>{level.emoji}</div>
          </div>

          <div style={{ flex:1 }}>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:20, margin:'0 0 4px' }}>
              {profile?.full_name || profile?.username || 'Tu perfil'}
            </h1>
            {profile?.username && <div style={{ color:'var(--muted)', fontSize:13, marginBottom:4 }}>@{profile.username}</div>}
            {profile?.bio && <div style={{ color:'var(--muted2)', fontSize:13, lineHeight:1.5 }}>{profile.bio}</div>}
          </div>

          <Link href="/profile/edit" style={{ color:'var(--muted2)', fontSize:13, textDecoration:'none', border:'1px solid var(--border2)', padding:'6px 12px', borderRadius:10 }}>
            Editar
          </Link>
        </div>

        {/* Level bar */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:18 }}>{level.emoji}</span>
              <span style={{ fontWeight:700, fontSize:14, color: level.color }}>{level.name}</span>
              <span style={{ fontSize:11, color:'var(--muted)', background:'var(--card)', padding:'2px 8px', borderRadius:99 }}>Nv. {level.level}</span>
            </div>
            <span style={{ fontSize:12, color:'var(--muted)' }}>
              {nextLevel ? `${score}/${nextLevel.minScore} pts` : '¡Máximo nivel!'}
            </span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:99, height:6, overflow:'hidden' }}>
            <div style={{ width:`${progress}%`, height:'100%', background:`linear-gradient(90deg, ${level.color}, ${level.color}cc)`, borderRadius:99, transition:'width .5s' }}/>
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:4 }}>{level.desc}</div>
        </div>

        {/* Stats row */}
        <div style={{ display:'flex', gap:20, marginBottom:16 }}>
          {[
            { label:'Tips',       val: profile?.tips_count      || 0, color:'var(--text)'  },
            { label:'Buenos',     val: profile?.good_tips_count || 0, color:'var(--green)' },
            { label:'Críticos',   val: profile?.bad_tips_count  || 0, color:'var(--bad)'   },
            { label:'Seguidores', val: profile?.followers_count || 0, color:'var(--text)'  },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:20, color }}>{val}</div>
              <div style={{ color:'var(--muted)', fontSize:11 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Vibe meter */}
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'var(--card)', borderRadius:12, padding:'10px 14px',
          border:'1px solid var(--border)',
        }}>
          <span style={{ fontSize:20 }}>{vibeConf.emoji}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:'var(--muted2)', marginBottom:4 }}>Balance de tips</div>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:99, height:5, overflow:'hidden' }}>
              <div style={{
                width:`${vibePercent}%`, height:'100%', borderRadius:99,
                background:`linear-gradient(90deg, #e8341c, ${vibeConf.color})`,
                transition:'width .5s',
              }}/>
            </div>
          </div>
          <span style={{ fontSize:12, fontWeight:700, color:vibeConf.color }}>{vibeConf.label}</span>
        </div>

        {/* Country flags */}
        {countries.length > 0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:11, color:'var(--muted)', marginBottom:6 }}>Tipeó en</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {countries.map(c => (
                <span key={c} style={{ fontSize:22 }} title={c}>
                  {({'AR':'🇦🇷','PY':'🇵🇾','UY':'🇺🇾','BR':'🇧🇷','CL':'🇨🇱','MX':'🇲🇽','CO':'🇨🇴','PE':'🇵🇪','US':'🇺🇸','ES':'🇪🇸'} as any)[c] || '🌍'}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit form */}
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
        <div>
          <label style={{ color:'var(--muted2)',fontSize:11,fontWeight:700,letterSpacing:1,display:'block',marginBottom:6 }}>NOMBRE</label>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Tu nombre completo"
            style={{ width:'100%',padding:'12px 14px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:15,outline:'none' }}/>
        </div>
        <div>
          <label style={{ color:'var(--muted2)',fontSize:11,fontWeight:700,letterSpacing:1,display:'block',marginBottom:6 }}>USUARIO</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',fontSize:15 }}>@</span>
            <input value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,30))}
              placeholder="tu_usuario"
              style={{ width:'100%',padding:'12px 14px 12px 30px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:15,outline:'none' }}/>
          </div>
          <div style={{ color:'var(--muted)',fontSize:11,marginTop:4 }}>tipero.us/u/{username||'tu_usuario'}</div>
        </div>
        <div>
          <label style={{ color:'var(--muted2)',fontSize:11,fontWeight:700,letterSpacing:1,display:'block',marginBottom:6 }}>BIO</label>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Contá algo sobre vos..." rows={2}
            style={{ width:'100%',padding:'12px 14px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:14,resize:'none',outline:'none',lineHeight:1.6,fontFamily:'inherit' }}/>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          padding:13,borderRadius:14,background:'linear-gradient(135deg,#e8341c,#a82010)',
          color:'#fff',fontWeight:700,fontSize:15,border:'none',cursor:'pointer',opacity:saving?.7:1,
        }}>
          {saving?'Guardando…':saved?'✓ Guardado':'Guardar cambios'}
        </button>
      </div>

      {/* All levels */}
      <div style={{ background:'var(--card)',borderRadius:16,padding:16,border:'1px solid var(--border)',marginBottom:20 }}>
        <div style={{ color:'var(--muted2)',fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:12 }}>NIVELES</div>
        {LEVELS.map(l => (
          <div key={l.level} style={{
            display:'flex', alignItems:'center', gap:10, padding:'8px 0',
            borderBottom:'1px solid var(--border)', opacity: score < l.minScore ? 0.35 : 1,
          }}>
            <span style={{ fontSize:20, minWidth:28 }}>{l.emoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color: l.level===level.level ? l.color : 'var(--text)' }}>
                {l.name} {l.level===level.level && '← vos'}
              </div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{l.desc}</div>
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', whiteSpace:'nowrap' }}>{l.minScore} pts</div>
          </div>
        ))}
      </div>

      <button onClick={async()=>{ await signOut(); router.push('/') }} style={{
        width:'100%',padding:13,borderRadius:14,background:'transparent',
        border:'1px solid var(--border2)',color:'var(--muted2)',fontFamily:'inherit',
        fontWeight:600,fontSize:14,cursor:'pointer',
      }}>Cerrar sesión</button>
    </div>
  )
}
