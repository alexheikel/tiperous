'use client'
import { useState, useEffect } from 'react'
import { useRealtimeTips } from '@/hooks/useRealtime'
import TipCard from '@/components/tips/TipCard'
import Link from 'next/link'
import { getUserLevel, LEVELS } from '@/lib/levels'

type TypeFilter = 'all' | 'good' | 'bad'
type SegFilter  = 'all' | 'service' | 'product' | 'employee'

const LEVEL_FILTERS = [
  { id:'all',    label:'Todos',     emoji:'' },
  { id:'1',      label:'Curiosos',  emoji:'👀' },
  { id:'2',      label:'Vecinos',   emoji:'🏘️' },
  { id:'3',      label:'Conocedores',emoji:'🎯' },
  { id:'4',      label:'Críticos',  emoji:'⚡' },
  { id:'5',      label:'Expertos',  emoji:'🔥' },
  { id:'6',      label:'Gurús',     emoji:'💎' },
  { id:'7',      label:'Leyendas',  emoji:'👑' },
]

export default function TimelinePage() {
  const { tips, loading } = useRealtimeTips()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [segFilter,  setSegFilter]  = useState<SegFilter>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [followingOnly, setFollowingOnly] = useState(false)
  const [profileCache, setProfileCache] = useState<Record<string,any>>({})
  const [currentUserId, setCurrentUserId] = useState<string|null>(null)
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    // Get current user and following list
    fetch('/api/me').then(r=>r.json()).then(d => {
      if (d.user) {
        setCurrentUserId(d.user.id)
        fetch(`/api/follow/list?user_id=${d.user.id}`)
          .then(r=>r.json())
          .then(d => setFollowingIds(d.data?.map((f:any)=>f.following_id)||[]))
      }
    }).catch(()=>{})
  }, [])

  // Cache profiles for level filtering
  useEffect(() => {
    if (levelFilter === 'all') return
    const userIds = [...new Set(tips.map(t => t.user_id).filter(id => !profileCache[id]))]
    if (!userIds.length) return
    fetch(`/api/profiles?ids=${userIds.join(',')}`)
      .then(r=>r.json())
      .then(d => {
        const map: Record<string,any> = {}
        ;(d.data||[]).forEach((p:any) => { map[p.id] = p })
        setProfileCache(prev => ({...prev, ...map}))
      }).catch(()=>{})
  }, [tips, levelFilter])

  const visible = tips.filter(t => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (segFilter  !== 'all' && t.segment !== segFilter) return false
    if (followingOnly && !followingIds.includes(t.user_id)) return false
    if (levelFilter !== 'all') {
      const profile = profileCache[t.user_id]
      if (profile) {
        const { level } = getUserLevel(profile)
        if (String(level.level) !== levelFilter) return false
      }
    }
    return true
  })

  const good = visible.filter(t => t.type==='good')
  const bad  = visible.filter(t => t.type==='bad')

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:20, margin:0 }}>Timeline</h2>
        <div className="live-badge"><div className="live-dot"/><span>LIVE</span></div>
      </div>

      {/* Type filter */}
      <div style={{ display:'flex', background:'var(--card)', borderRadius:99, padding:3, gap:2, marginBottom:10 }}>
        {([['all','Todos'],['good','▲ Buenos'],['bad','▼ Malos']] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTypeFilter(id)} style={{
            flex:1, padding:'7px 0', borderRadius:99, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontWeight:600, fontSize:12, transition:'all .15s',
            background: typeFilter===id ? id==='good'?'var(--green-dim)':id==='bad'?'var(--bad-dim)':'var(--card2)' : 'transparent',
            color: typeFilter===id ? id==='good'?'var(--green)':id==='bad'?'var(--bad)':'var(--text)' : 'var(--muted)',
          }}>{label}</button>
        ))}
      </div>

      {/* Segment + Following filters */}
      <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
        <button onClick={()=>setSegFilter(s=>s==='all'?'service':s==='service'?'product':s==='product'?'employee':'all')} style={{
          padding:'6px 13px', borderRadius:99, border:'1px solid var(--border2)', cursor:'pointer',
          fontFamily:'inherit', fontWeight:600, fontSize:12, transition:'all .15s',
          background: segFilter!=='all'?'rgba(255,255,255,0.08)':'var(--card)',
          color: segFilter!=='all'?'var(--text)':'var(--muted)',
        }}>
          {segFilter==='all'?'⚙◈◎ Segmento':segFilter==='service'?'⚙ Servicio':segFilter==='product'?'◈ Producto':'◎ Empleado'}
        </button>

        {currentUserId && (
          <button onClick={()=>setFollowingOnly(!followingOnly)} style={{
            padding:'6px 13px', borderRadius:99, border:'1px solid var(--border2)', cursor:'pointer',
            fontFamily:'inherit', fontWeight:600, fontSize:12, transition:'all .15s',
            background: followingOnly?'rgba(124,154,181,0.15)':'var(--card)',
            color: followingOnly?'#7c9ab5':'var(--muted)',
          }}>
            👥 {followingOnly ? 'Siguiendo' : 'Todos'}
          </button>
        )}
      </div>

      {/* Level filter */}
      <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
        {LEVEL_FILTERS.map(l => (
          <button key={l.id} onClick={()=>setLevelFilter(l.id)} style={{
            padding:'5px 12px', borderRadius:99, border:'1px solid var(--border2)',
            cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:12,
            whiteSpace:'nowrap', flexShrink:0, transition:'all .15s',
            background: levelFilter===l.id ? 'var(--red)' : 'var(--card)',
            color: levelFilter===l.id ? '#fff' : 'var(--muted2)',
          }}>
            {l.emoji && <span style={{ marginRight:4 }}>{l.emoji}</span>}
            {l.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:'40px 0' }}>
          <div className="animate-spin" style={{ width:28,height:28,border:'2px solid var(--border2)',borderTopColor:'var(--red)',borderRadius:'50%',margin:'0 auto' }}/>
        </div>
      )}

      {!loading && visible.length===0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
          <div style={{ marginBottom:8 }}>No hay tips con estos filtros.</div>
          <Link href="/" style={{ color:'var(--red)',fontWeight:700,textDecoration:'none' }}>
            Explorar empresas →
          </Link>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            {typeFilter!=='bad' && <>
              <div style={{ color:'var(--green)',fontWeight:700,fontSize:11,letterSpacing:1,marginBottom:10 }}>
                ▲ BUENOS ({good.length})
              </div>
              {good.map((t,i) => <TipCard key={t.id} tip={t} delay={i*30}/>)}
            </>}
          </div>
          <div>
            {typeFilter!=='good' && <>
              <div style={{ color:'var(--bad)',fontWeight:700,fontSize:11,letterSpacing:1,marginBottom:10 }}>
                ▼ MALOS ({bad.length})
              </div>
              {bad.map((t,i) => <TipCard key={t.id} tip={t} delay={i*30}/>)}
            </>}
          </div>
        </div>
      )}
    </div>
  )
}
