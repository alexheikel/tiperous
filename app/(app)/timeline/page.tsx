// app/(app)/timeline/page.tsx
'use client'
import { useState } from 'react'
import { useRealtimeTips } from '@/hooks/useRealtime'
import TipCard from '@/components/tips/TipCard'
import Link from 'next/link'

type Filter = 'all' | 'good' | 'bad'

export default function TimelinePage() {
  const { tips, loading } = useRealtimeTips()
  const [filter, setFilter] = useState<Filter>('all')

  const visible = filter === 'all' ? tips : tips.filter(t => t.type === filter)
  const good    = visible.filter(t => t.type === 'good')
  const bad     = visible.filter(t => t.type === 'bad')

  return (
    <div>
      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {([['all','Todos'],['good','Buenos ▲'],['bad','Malos ▼']] as [Filter,string][]).map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            padding:'6px 14px', borderRadius:99,
            border: filter === v ? 'none' : '1px solid var(--border2)',
            background: filter === v ? 'var(--red)' : 'transparent',
            color: filter === v ? '#fff' : 'var(--muted2)',
            fontFamily:'inherit', fontWeight:600, fontSize:12, cursor:'pointer',
            transition:'all 0.15s',
            boxShadow: filter === v ? '0 2px 12px rgba(232,52,28,0.3)' : 'none',
          }}>{l}</button>
        ))}
        <div className="live-badge" style={{ marginLeft:'auto' }}>
          <div className="live-dot"/><span>LIVE</span>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>
          <div className="animate-spin" style={{
            width:28, height:28, border:'2px solid var(--border2)',
            borderTopColor:'var(--red)', borderRadius:'50%', margin:'0 auto',
          }}/>
        </div>
      )}

      {!loading && visible.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
          <div>No hay tips todavía. ¡Sé el primero!</div>
          <Link href="/" style={{ color:'var(--red)', fontWeight:700, textDecoration:'none', display:'block', marginTop:12 }}>
            Explorar empresas →
          </Link>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div>
          {filter !== 'bad' && (
            <>
              <div style={{ color:'var(--green)', fontWeight:700, fontSize:11, letterSpacing:1, marginBottom:10 }}>▲ BUENOS</div>
              {good.map((t, i) => <TipCard key={t.id} tip={t} delay={i * 30}/>)}
            </>
          )}
        </div>
        <div>
          {filter !== 'good' && (
            <>
              <div style={{ color:'var(--bad)', fontWeight:700, fontSize:11, letterSpacing:1, marginBottom:10 }}>▼ MALOS</div>
              {bad.map((t, i) => <TipCard key={t.id} tip={t} delay={i * 30}/>)}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
