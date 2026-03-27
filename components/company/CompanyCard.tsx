'use client'
import { useRouter } from 'next/navigation'
import type { Company } from '@/types'

interface Props { company: Company; rank?: number; delay?: number; onClick?: () => void }

export default function CompanyCard({ company, rank, delay=0, onClick }: Props) {
  const router = useRouter()
  const s  = company.score_total
  const up = s >= 0

  function handleClick() {
    if (onClick) { onClick(); return }
    router.push((company as any).slug ? `/c/${(company as any).slug}` : `/company/${company.id}`)
  }

  const segs = [
    { key:'score_service',  icon:'⚙', label:'Servicio'  },
    { key:'score_product',  icon:'◈', label:'Producto'  },
    { key:'score_employee', icon:'◎', label:'Empleado'  },
  ]

  return (
    <div onClick={handleClick} className="card-hover animate-fade-up" style={{
      animationDelay:`${delay}ms`,
      background:'var(--card)', borderRadius:18, padding:'16px 18px', marginBottom:10,
      border:'1px solid var(--border)', position:'relative', overflow:'hidden', cursor:'pointer',
    }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: s>0?'var(--green)':s<0?'var(--bad)':'#2a2a2a' }}/>

      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:12 }}>
        {rank && (
          <div style={{ color:'var(--muted)', fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:18, minWidth:20, paddingTop:2 }}>
            {rank}
          </div>
        )}
        <div style={{
          width:46, height:46, borderRadius:13, flexShrink:0,
          background:'linear-gradient(135deg,#c0392b,#8e0000)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:21,
          boxShadow:'0 4px 14px rgba(192,57,43,0.3)',
        }}>{company.name[0]}</div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:16, color:'var(--text)',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:3 }}>
            {company.name}
          </div>
          <div style={{ color:'var(--muted)', fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
            <span>{company.category}</span>
            {company.city && <>
              <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--muted)', display:'inline-block' }}/>
              <span>{company.city}</span>
            </>}
            <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--muted)', display:'inline-block' }}/>
            <span>{company.tips_count} tip{company.tips_count!==1?'s':''}</span>
          </div>
        </div>

        {/* Overall score */}
        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          <span style={{ fontSize:15, color:up?'var(--green)':'var(--bad)' }}>{up?'▲':'▼'}</span>
          <span style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:22,
            color:up?'var(--green)':'var(--bad)', letterSpacing:-1 }}>
            {s>0?'+':''}{s}
          </span>
        </div>
      </div>

      {/* Segment scores */}
      <div style={{ display:'flex', gap:6 }}>
        {segs.map(({ key, icon, label }) => {
          const v = (company as any)[key] as number || 0
          return (
            <div key={key} style={{
              display:'flex', alignItems:'center', gap:4,
              padding:'4px 10px', borderRadius:99, fontSize:11,
              background: v>0?'var(--green-dim)':v<0?'var(--bad-dim)':'rgba(255,255,255,0.04)',
              border:`1px solid ${v>0?'rgba(29,185,84,0.2)':v<0?'rgba(232,52,28,0.2)':'var(--border)'}`,
            }}>
              <span style={{ color:'var(--muted)' }}>{icon}</span>
              <span style={{ fontWeight:700, color:v>0?'var(--green)':v<0?'var(--bad)':'var(--muted2)' }}>
                {v>0?'+':''}{v}
              </span>
              <span style={{ color:'var(--muted)', fontWeight:500 }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
