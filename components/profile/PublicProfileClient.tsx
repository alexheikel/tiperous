'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { getUserLevel, LEVELS, VIBE_CONFIG, COUNTRY_FLAGS } from '@/lib/levels'

interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  followers_count: number | null
  following_count: number | null
  tips_count: number | null
  good_tips_count: number | null
  bad_tips_count: number | null
  reports_received: number | null
  created_at: string
}

interface Props {
  profile: Profile
  tips: any[]
  isFollowing: boolean
  isOwn: boolean
  countries?: string[]
}

export default function PublicProfileClient({ profile, tips, isFollowing: initialFollowing, isOwn, countries = [] }: Props) {
  const [following, setFollowing] = useState(initialFollowing)
  const [followers, setFollowers] = useState(profile.followers_count || 0)
  const [loading,   setLoading]   = useState(false)

  const name     = profile.full_name || profile.username || 'Usuario'
  const initials = name[0].toUpperCase()

  const { level, score, vibe, vibePercent } = getUserLevel(profile)
  const vibeConf  = VIBE_CONFIG[vibe]
  const nextLevel = LEVELS.find(l => l.minScore > score)
  const progress  = nextLevel
    ? Math.min(100, Math.round(((score - level.minScore) / (nextLevel.minScore - level.minScore)) * 100))
    : 100
  const communityAvg = 60
  const diff = vibePercent - communityAvg

  async function toggleFollow() {
    setLoading(true)
    const method = following ? 'DELETE' : 'POST'
    const res = await fetch('/api/follow', {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_id: profile.id }),
      redirect: 'follow',
    })
    if (res.ok) { setFollowing(!following); setFollowers((prev:number) => following ? prev - 1 : prev + 1) }
    setLoading(false)
  }

  return (
    <div>
      {/* ── Hero ── */}
      <div style={{
        background:'linear-gradient(135deg,#180a08,#1e0c0a)',
        borderRadius:20, padding:'22px 18px', marginBottom:16,
        border:'1px solid rgba(232,52,28,0.15)', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(232,52,28,0.07),transparent 70%)',pointerEvents:'none' }}/>

        {/* Top row */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:18 }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:66,height:66,borderRadius:'50%',background:'linear-gradient(135deg,#c0392b,#8e0000)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:26,boxShadow:'0 6px 20px rgba(192,57,43,0.4)' }}>
              {initials}
            </div>
            <div style={{ position:'absolute',bottom:-4,right:-4,background:level.color,borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,border:'2px solid #0c0c0e' }}>
              {level.emoji}
            </div>
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:19,marginBottom:2 }}>
              {name}
            </div>
            {profile.username && <div style={{ color:'var(--muted)',fontSize:13,marginBottom:4 }}>@{profile.username}</div>}
            {profile.bio && <div style={{ color:'var(--muted2)',fontSize:13,lineHeight:1.5,marginBottom:6 }}>{profile.bio}</div>}
            {/* Country flags */}
            {countries.length > 0 && (
              <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                {countries.map(c=>(
                  <span key={c} style={{ fontSize:18 }} title={c}>{COUNTRY_FLAGS[c]||'🌍'}</span>
                ))}
              </div>
            )}
          </div>

          {!isOwn && (
            <button onClick={toggleFollow} disabled={loading} style={{
              padding:'8px 16px', borderRadius:99, fontFamily:'inherit', fontWeight:700,
              fontSize:13, cursor:'pointer', flexShrink:0, transition:'all .15s',
              background: following ? 'transparent' : 'linear-gradient(135deg,#e8341c,#a82010)',
              color: following ? 'var(--muted2)' : '#fff',
              border: following ? '1px solid var(--border2)' : 'none',
              boxShadow: following ? 'none' : '0 3px 14px rgba(232,52,28,0.35)',
              opacity: loading ? 0.7 : 1,
            }}>
              {following ? 'Siguiendo' : '+ Seguir'}
            </button>
          )}
          {isOwn && (
            <Link href="/profile" style={{ padding:'7px 14px',borderRadius:10,fontFamily:'inherit',fontWeight:600,fontSize:12,textDecoration:'none',color:'var(--muted2)',border:'1px solid var(--border2)' }}>
              Editar
            </Link>
          )}
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
          <div style={{ background:'rgba(255,255,255,0.07)',borderRadius:99,height:5,overflow:'hidden',marginBottom:3 }}>
            <div style={{ width:`${progress}%`,height:'100%',background:`linear-gradient(90deg,${level.color},${level.color}99)`,borderRadius:99,transition:'width .6s ease' }}/>
          </div>
          <div style={{ fontSize:11,color:'var(--muted)' }}>{level.desc}</div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14 }}>
          {[
            { label:'Tips',       val: profile.tips_count||0,      color:'var(--text)'  },
            { label:'Positivos',  val: profile.good_tips_count||0, color:'var(--green)' },
            { label:'Críticos',   val: profile.bad_tips_count||0,  color:'var(--bad)'   },
            { label:'Seguidores', val: followers,                   color:'#7c9ab5'      },
          ].map(({ label, val, color }) => (
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
          <div style={{ position:'relative',marginBottom:4 }}>
            <div style={{ height:8,borderRadius:99,background:'linear-gradient(90deg,#e8341c 0%,#e8b84b 50%,#1db954 100%)',position:'relative' }}>
              <div style={{ position:'absolute',top:-4,left:`${communityAvg}%`,transform:'translateX(-50%)',width:2,height:16,background:'rgba(255,255,255,0.35)',borderRadius:1 }}/>
              <div style={{ position:'absolute',top:-5,left:`${vibePercent}%`,transform:'translateX(-50%)',width:18,height:18,borderRadius:'50%',background:vibeConf.color,border:'2px solid #0c0c0e',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,boxShadow:`0 0 8px ${vibeConf.color}66`,transition:'left .5s ease' }}>
                {vibeConf.emoji}
              </div>
            </div>
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--muted)',marginTop:12 }}>
            <span>😤 Más crítico</span>
            <span style={{ color:'rgba(255,255,255,0.2)',fontSize:9 }}>
              {diff > 5 ? `+${diff}% vs promedio` : diff < -5 ? `${diff}% vs promedio` : 'cerca del promedio'}
            </span>
            <span>😊 Más positivo</span>
          </div>
        </div>
      </div>

      {/* ── Tips feed ── */}
      <div style={{ color:'var(--muted2)',fontWeight:700,fontSize:11,letterSpacing:1,marginBottom:12 }}>
        TIPS DE {name.toUpperCase()}
      </div>

      {tips.length === 0 && (
        <div style={{ textAlign:'center',padding:'40px 0',color:'var(--muted)' }}>
          <div style={{ fontSize:36,marginBottom:10 }}>★</div>
          <div>Todavía no dejó ningún tip.</div>
        </div>
      )}

      {tips.map((tip, i) => {
        const good    = tip.type === 'good'
        const company = tip.company as any
        const ago     = formatDistanceToNow(new Date(tip.created_at), { addSuffix:true, locale:es })
        return (
          <Link key={tip.id} href={`/t/${tip.id}`} style={{ textDecoration:'none' }}>
            <div style={{
              background:'var(--card)', borderRadius:14, padding:'13px 14px', marginBottom:10,
              border:'1px solid var(--border)', borderLeft:`3px solid ${good?'var(--green)':'var(--bad)'}`,
              transition:'background .15s',
            }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--card2)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--card)')}
            >
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
                <Link href={`/c/${company?.slug}`} onClick={e=>e.stopPropagation()} style={{ color:'var(--red)',fontSize:13,fontWeight:700,textDecoration:'none' }}>
                  {company?.name}
                </Link>
                <span style={{ color:'var(--muted)',fontSize:11 }}>{ago}</span>
              </div>
              <p style={{ color:'var(--text)',fontSize:13,lineHeight:1.6,margin:'0 0 6px' }}>{tip.text}</p>
              <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                <span style={{ fontSize:11,color:good?'var(--green)':'var(--bad)',fontWeight:700 }}>
                  {good?'▲ Bueno':'▼ Malo'}
                </span>
                <span style={{ color:'var(--muted)',fontSize:11 }}>· {tip.segment}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
