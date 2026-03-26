'use client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Tip } from '@/types'

const SEG_ICON  = { service:'⚙', product:'◈', employee:'◎' }
const SEG_LABEL = { service:'Servicio', product:'Producto', employee:'Empleado' }

export default function TipCard({ tip, delay=0 }: { tip:Tip; delay?:number }) {
  const good    = tip.type === 'good'
  const profile = tip.profile
  const name    = profile?.full_name || profile?.username || 'Anónimo'
  const ago     = formatDistanceToNow(new Date(tip.created_at), { addSuffix:true, locale:es })

  return (
    <div className="animate-fade-up" style={{
      animationDelay:`${delay}ms`,
      background:'var(--card)', borderRadius:14, padding:'13px 14px', marginBottom:10,
      border:'1px solid var(--border)',
      borderLeft:`3px solid ${good?'var(--green)':'var(--bad)'}`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
        <div style={{
          width:32, height:32, borderRadius:'50%', flexShrink:0,
          background:'linear-gradient(135deg,#c0392b,#8e0000)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontWeight:700, fontSize:13,
        }}>{name[0].toUpperCase()}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:'var(--gold)', fontWeight:700, fontSize:13,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
          <div style={{ color:'var(--muted)', fontSize:11 }}>{ago}</div>
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:4, padding:'3px 9px', borderRadius:99,
          background:good?'var(--green-dim)':'var(--bad-dim)',
          border:`1px solid ${good?'rgba(29,185,84,0.2)':'rgba(232,52,28,0.2)'}`,
          flexShrink:0,
        }}>
          <span style={{ fontSize:10 }}>{SEG_ICON[tip.segment]}</span>
          <span style={{ fontSize:10, fontWeight:700, color:good?'var(--green)':'var(--bad)' }}>
            {SEG_LABEL[tip.segment]}
          </span>
        </div>
      </div>
      <p style={{ color:'var(--text)', fontSize:13, lineHeight:1.65, margin:0 }}>{tip.text}</p>
    </div>
  )
}
