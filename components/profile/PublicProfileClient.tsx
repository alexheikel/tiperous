import { getUserLevel, VIBE_CONFIG } from '@/lib/levels'
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Profile {
  id: string; username: string|null; full_name: string|null; bio: string|null
  followers_count: number; following_count: number; tips_count: number; created_at: string
}

interface Props {
  profile: Profile
  tips: any[]
  isFollowing: boolean
  isOwn: boolean
}

export default function PublicProfileClient({ profile, tips, isFollowing: initialFollowing, isOwn }: Props) {
  const [following,  setFollowing]  = useState(initialFollowing)
  const [followers,  setFollowers]  = useState(profile.followers_count || 0)
  const [loading,    setLoading]    = useState(false)

  const name     = profile.full_name || profile.username || 'Usuario'
  const initials = name[0].toUpperCase()

  async function toggleFollow() {
    setLoading(true)
    const method = following ? 'DELETE' : 'POST'
    const res = await fetch('/api/follow', {
      method, headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ target_id: profile.id }),
    })
    if (res.ok) {
      setFollowing(!following)
      setFollowers(prev => following ? prev - 1 : prev + 1)
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Profile header */}
      <div style={{
        background:'linear-gradient(135deg,#180a08,#1e0c0a)',
        borderRadius:20, padding:'24px 20px', marginBottom:20,
        border:'1px solid rgba(232,52,28,0.15)',
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:20 }}>
          <div style={{
            width:68, height:68, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg,#c0392b,#8e0000)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:28,
            boxShadow:'0 6px 24px rgba(192,57,43,0.4)',
          }}>{initials}</div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:22, margin:'0 0 4px', display:'flex', alignItems:'center', gap:8 }}>
              {name}
              {(() => { const {level} = getUserLevel(profile as any); return <span style={{ fontSize:18 }} title={level.name}>{level.emoji}</span> })()}
            </h1>
            {profile.username && (
              <div style={{ color:'var(--muted)', fontSize:13, marginBottom:4 }}>@{profile.username}</div>
            )}
            {profile.bio && (
              <div style={{ color:'var(--muted2)', fontSize:14, lineHeight:1.5 }}>{profile.bio}</div>
            )}
          </div>
          {!isOwn && (
            <button onClick={toggleFollow} disabled={loading} style={{
              padding:'8px 18px', borderRadius:99, fontFamily:'inherit', fontWeight:700,
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
            <Link href="/profile" style={{
              padding:'8px 16px', borderRadius:99, fontFamily:'inherit', fontWeight:600,
              fontSize:13, textDecoration:'none', color:'var(--muted2)',
              border:'1px solid var(--border2)',
            }}>Editar</Link>
          )}
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:24 }}>
          {[
            { label:'Tips',      val: tips.length },
            { label:'Seguidores', val: followers },
            { label:'Siguiendo', val: profile.following_count || 0 },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:22, color:'var(--text)' }}>{val}</div>
              <div style={{ color:'var(--muted)', fontSize:12 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips feed */}
      <div style={{ color:'var(--muted2)', fontWeight:700, fontSize:11, letterSpacing:1, marginBottom:14 }}>
        TIPS DE {name.toUpperCase()}
      </div>

      {tips.length === 0 && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:36, marginBottom:10 }}>★</div>
          <div>Todavía no dejó ningún tip.</div>
        </div>
      )}

      {tips.map((tip, i) => {
        const good = tip.type === 'good'
        const company = tip.company as any
        const ago = formatDistanceToNow(new Date(tip.created_at), { addSuffix:true, locale:es })
        return (
          <Link key={tip.id} href={`/t/${tip.id}`} style={{ textDecoration:'none' }}>
            <div style={{
              background:'var(--card)', borderRadius:14, padding:'13px 14px', marginBottom:10,
              border:'1px solid var(--border)',
              borderLeft:`3px solid ${good?'var(--green)':'var(--bad)'}`,
              transition:'background .15s',
            }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--card2)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--card)')}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <Link href={`/c/${company?.slug}`} onClick={e=>e.stopPropagation()} style={{
                  color:'var(--red)', fontSize:13, fontWeight:700, textDecoration:'none',
                }}>{company?.name}</Link>
                <span style={{ color:'var(--muted)', fontSize:11 }}>{ago}</span>
              </div>
              <p style={{ color:'var(--text)', fontSize:13, lineHeight:1.6, margin:0 }}>{tip.text}</p>
              <div style={{ marginTop:6, display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ fontSize:11, color:good?'var(--green)':'var(--bad)', fontWeight:700 }}>
                  {good?'▲ Bueno':'▼ Malo'}
                </span>
                <span style={{ color:'var(--muted)', fontSize:11 }}>· {tip.segment}</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
