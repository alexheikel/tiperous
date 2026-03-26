'use client'
import type { Company } from '@/types'

interface Props { company: Company; rank?: number; delay?: number; onClick: () => void }

export default function CompanyCard({ company, rank, delay = 0, onClick }: Props) {
  const s  = company.score_total
  const up = s >= 0

  return (
    <div onClick={onClick} className="card-hover animate-fade-up" style={{
      animationDelay:`${delay}ms`,
      background:'var(--card)', borderRadius:18, padding:'14px 16px', marginBottom:10,
      display:'flex', alignItems:'center', gap:14,
      border:'1px solid var(--border)', position:'relative', overflow:'hidden',
    }}>
      <div style={{
        position:'absolute', left:0, top:0, bottom:0, width:3,
        background: s>0?'var(--green)':s<0?'var(--bad)':'#2a2a2a',
      }}/>
      {rank && (
        <div style={{ color:'var(--muted)', fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:19, minWidth:22, textAlign:'center' }}>
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
        <div style={{ color:'var(--muted)', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
          <span>{company.tips_count} tip{company.tips_count!==1?'s':''}</span>
          <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--muted)', display:'inline-block' }}/>
          <span>{company.category}</span>
          {company.city && <>
            <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--muted)', display:'inline-block' }}/>
            <span>{company.city}</span>
          </>}
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
        <span style={{ fontSize:15, color:up?'var(--green)':'var(--bad)' }}>{up?'▲':'▼'}</span>
        <span style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:22,
          color:up?'var(--green)':'var(--bad)', letterSpacing:-1 }}>
          {s>0?'+':''}{s}
        </span>
      </div>
    </div>
  )
}
