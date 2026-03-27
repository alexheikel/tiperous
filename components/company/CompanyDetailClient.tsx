'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Company, Tip } from '@/types'
import { useRealtimeTips, useRealtimeCompany } from '@/hooks/useRealtime'
import AddTipModal from '@/components/tips/AddTipModal'
import TipCard from '@/components/tips/TipCard'
import QRModal from '@/components/company/QRModal'

const SEGS = ['service','product','employee'] as const
const SEG_ICON  = { service:'⚙', product:'◈', employee:'◎' }
const SEG_LABEL = { service:'Servicio', product:'Producto', employee:'Empleado' }

interface Props { company: Company; initialTips: Tip[] }

export default function CompanyDetailClient({ company: initial, initialTips }: Props) {
  const router    = useRouter()
  const [showTip, setShowTip] = useState(false)
  const [qrOpen,   setQrOpen]   = useState(false)
  const company   = useRealtimeCompany(initial.id) || initial
  const { tips }  = useRealtimeTips(initial.id)
  const allTips   = tips.length > 0 ? tips : initialTips
  const goodTips  = allTips.filter(t => t.type==='good')
  const badTips   = allTips.filter(t => t.type==='bad')
  const s         = company.score_total

  return (
    <div>
      <button onClick={() => router.push('/')} style={{
        display:'flex', alignItems:'center', gap:6, background:'none', border:'none',
        color:'var(--red)', fontWeight:700, fontSize:14, cursor:'pointer', marginBottom:20, padding:0,
      }}>← Volver</button>

      {/* Hero card */}
      <div style={{
        background:'linear-gradient(135deg,#180a08 0%,#1e0c0a 100%)',
        borderRadius:22, padding:'22px 20px', marginBottom:18,
        border:'1px solid rgba(232,52,28,0.15)', position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(232,52,28,0.10),transparent 70%)', pointerEvents:'none',
        }}/>
        <div style={{ display:'flex', gap:16, marginBottom:20, alignItems:'flex-start' }}>
          <div style={{
            width:62, height:62, borderRadius:17, flexShrink:0,
            background:'linear-gradient(135deg,#c0392b,#8e0000)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:28,
            boxShadow:'0 8px 28px rgba(192,57,43,0.45)',
          }}>{company.name[0]}</div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:22, marginBottom:4, margin:'0 0 4px' }}>
              {company.name}
            </h1>
            <div style={{ color:'var(--muted)', fontSize:13 }}>
              {company.category}{company.city && ` · ${company.city}`}
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                style={{ color:'var(--red)', fontSize:12, textDecoration:'none', display:'block', marginTop:4 }}>
                {company.website.replace(/^https?:\/\//,'')}
              </a>
            )}
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end' }}>
              <span style={{ fontSize:20, color:s>=0?'var(--green)':'var(--bad)' }}>{s>=0?'▲':'▼'}</span>
              <span style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:34,
                color:s>=0?'var(--green)':'var(--bad)', letterSpacing:-2 }}>{s>0?'+':''}{s}</span>
            </div>
            <div style={{ color:'var(--muted)', fontSize:11 }}>overall</div>
          </div>
        </div>

        {/* Segment pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          {SEGS.map(seg => {
            const v = company[`score_${seg}` as keyof Company] as number
            return (
              <div key={seg} style={{
                display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:99,
                background:v>0?'var(--green-dim)':v<0?'var(--bad-dim)':'rgba(255,255,255,0.04)',
                border:`1px solid ${v>0?'rgba(29,185,84,0.2)':v<0?'rgba(232,52,28,0.2)':'var(--border)'}`,
              }}>
                <span style={{ fontSize:11, color:'var(--muted)' }}>{SEG_ICON[seg]}</span>
                <span style={{ fontSize:12, fontWeight:700, color:v>0?'var(--green)':v<0?'var(--bad)':'var(--muted2)' }}>{v>0?'+':''}{v}</span>
                <span style={{ fontSize:11, color:'var(--muted)', fontWeight:500 }}>{SEG_LABEL[seg]}</span>
              </div>
            )
          })}
          <div className="live-badge" style={{ marginLeft:'auto' }}>
            <div className="live-dot"/><span>LIVE</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button onClick={() => setShowTip(true)} style={{
        width:'100%', padding:14, borderRadius:14,
        background:'linear-gradient(135deg,#e8341c,#a82010)',
        color:'#fff', fontWeight:700, fontSize:15, border:'none', cursor:'pointer',
        marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        boxShadow:'0 4px 24px rgba(232,52,28,0.35)', transition:'transform .15s, box-shadow .15s',
      }}
        onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-1px)')}
        onMouseLeave={e=>(e.currentTarget.style.transform='none')}
      >
        <span style={{ fontSize:18 }}>★</span> Dejar un Tip
      </button>

      {/* Tips grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div>
          <div style={{ color:'var(--green)', fontWeight:700, fontSize:11, letterSpacing:1, marginBottom:10 }}>
            ▲ BUENOS ({goodTips.length})
          </div>
          {goodTips.length===0 && <p style={{ color:'var(--muted)', fontSize:13 }}>Sé el primero.</p>}
          {goodTips.map((t,i) => <TipCard key={t.id} tip={t} delay={i*35}/>)}
        </div>
        <div>
          <div style={{ color:'var(--bad)', fontWeight:700, fontSize:11, letterSpacing:1, marginBottom:10 }}>
            ▼ MALOS ({badTips.length})
          </div>
          {badTips.length===0 && <p style={{ color:'var(--muted)', fontSize:13 }}>Sin malos tips.</p>}
          {badTips.map((t,i) => <TipCard key={t.id} tip={t} delay={i*35}/>)}
        </div>
      </div>

      {showTip && <AddTipModal company={company} onClose={()=>setShowTip(false)} onSuccess={()=>setShowTip(false)}/>}
      {qrOpen && (company as any).slug && <QRModal companyName={company.name} companySlug={(company as any).slug} onClose={()=>setQrOpen(false)}/>}
    </div>
  )
}
