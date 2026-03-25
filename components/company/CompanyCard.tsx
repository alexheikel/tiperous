'use client'
import type { Company } from '@/types'

interface Props {
  company: Company
  rank?:   number
  delay?:  number
  onClick: () => void
}

export default function CompanyCard({ company, rank, delay = 0, onClick }: Props) {
  const s  = company.score_total
  const up = s >= 0

  return (
    <div
      onClick={onClick}
      className="animate-fade-up"
      style={{
        animationDelay:`${delay}ms`,
        background:'var(--card)', borderRadius:16, padding:'14px 16px',
        marginBottom:10, cursor:'pointer',
        display:'flex', alignItems:'center', gap:14,
        border:'1px solid var(--border)',
        position:'relative', overflow:'hidden',
        transition:'background 0.18s, transform 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background   = 'var(--card2)'
        e.currentTarget.style.transform    = 'translateY(-2px)'
        e.currentTarget.style.boxShadow    = '0 8px 32px rgba(0,0,0,0.35)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background   = 'var(--card)'
        e.currentTarget.style.transform    = 'translateY(0)'
        e.currentTarget.style.boxShadow    = 'none'
      }}
    >
      {/* score strip */}
      <div style={{
        position:'absolute', left:0, top:0, bottom:0, width:3,
        background: s > 0 ? 'var(--green)' : s < 0 ? 'var(--bad)' : '#333',
        borderRadius:'3px 0 0 3px',
      }}/>

      {rank && (
        <div style={{ color:'var(--muted)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:20, minWidth:22, textAlign:'center' }}>
          {rank}
        </div>
      )}

      {/* Logo */}
      <div style={{
        width:44, height:44, borderRadius:12, flexShrink:0,
        background:'linear-gradient(135deg,#c0392b,#8e0000)',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'#fff', fontFamily:'var(--font-display)', fontWeight:900, fontSize:20,
        boxShadow:'0 4px 12px rgba(192,57,43,0.28)',
      }}>
        {company.name[0]}
      </div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:16, color:'var(--text)',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:2 }}>
          {company.name}
        </div>
        <div style={{ color:'var(--muted)', fontSize:12 }}>
          {company.tips_count} tip{company.tips_count !== 1 ? 's' : ''} · {company.category}
          {company.city && ` · ${company.city}`}
        </div>
      </div>

      {/* Score */}
      <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
        <span style={{ fontSize:16, color: up ? 'var(--green)' : 'var(--bad)' }}>{up ? '▲' : '▼'}</span>
        <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:20,
          color: up ? 'var(--green)' : 'var(--bad)', letterSpacing:-1 }}>
          {s > 0 ? '+' : ''}{s}
        </span>
      </div>
    </div>
  )
}
