'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Company, Tip } from '@/types'
import { useRealtimeTips, useRealtimeCompany } from '@/hooks/useRealtime'
import AddTipModal from '@/components/tips/AddTipModal'
import TipCard from '@/components/tips/TipCard'

const SEGS = ['service','product','employee'] as const

interface Props { company: Company; initialTips: Tip[] }

export default function CompanyDetailClient({ company: initial, initialTips }: Props) {
  const router    = useRouter()
  const [showTip, setShowTip] = useState(false)

  // Live data
  const company   = useRealtimeCompany(initial.id) || initial
  const { tips }  = useRealtimeTips(initial.id)
  const allTips   = tips.length > 0 ? tips : initialTips

  const goodTips  = allTips.filter(t => t.type === 'good')
  const badTips   = allTips.filter(t => t.type === 'bad')
  const s         = company.score_total

  return (
    <div>
      {/* Back */}
      <button onClick={() => router.back()} style={{
        display:'flex', alignItems:'center', gap:6,
        background:'none', border:'none', color:'var(--red)',
        fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer',
        marginBottom:20, padding:0,
      }}>
        ← Volver
      </button>

      {/* Hero */}
      <div style={{
        background:'linear-gradient(135deg,#1a0a08,#200e0a)',
        borderRadius:20, padding:'22px 20px', marginBottom:20,
        border:'1px solid rgba(232,52,28,0.18)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', top:-40, right:-40, width:180, height:180,
          borderRadius:'50%', background:'radial-gradient(circle,rgba(232,52,28,0.12),transparent 70%)',
          pointerEvents:'none',
        }}/>

        <div style={{ display:'flex', gap:16, marginBottom:20, alignItems:'flex-start' }}>
          <div style={{
            width:60, height:60, borderRadius:16, flexShrink:0,
            background:'linear-gradient(135deg,#c0392b,#8e0000)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontFamily:'var(--font-display)', fontWeight:900, fontSize:28,
            boxShadow:'0 8px 24px rgba(192,57,43,0.4)',
          }}>{company.name[0]}</div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:22, marginBottom:4 }}>
              {company.name}
            </h1>
            <div style={{ color:'var(--muted)', fontSize:13 }}>
              {company.category}{company.city && ` · ${company.city}`}
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                style={{ color:'var(--red)', fontSize:12, textDecoration:'none' }}>
                {company.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:18, color: s>=0?'var(--green)':'var(--bad)' }}>{s>=0?'▲':'▼'}</span>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:32,
                color: s>=0?'var(--green)':'var(--bad)', letterSpacing:-2 }}>
                {s > 0 ? '+' : ''}{s}
              </span>
            </div>
            <div style={{ color:'var(--muted)', fontSize:11, marginTop:2 }}>overall</div>
          </div>
        </div>

        {/* Segment scores */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {SEGS.map(seg => {
            const v = company[`score_${seg}` as keyof Company] as number
            return (
              <div key={seg} style={{
                display:'flex', alignItems:'center', gap:5,
                padding:'5px 11px', borderRadius:99,
                background: v>0?'var(--green-dim)':v<0?'var(--bad-dim)':'rgba(255,255,255,0.04)',
                border:`1px solid ${v>0?'rgba(29,185,84,0.2)':v<0?'rgba(232,52,28,0.2)':'var(--border)'}`,
              }}>
                <span style={{ fontSize:11, color:'var(--muted)' }}>
                  {seg==='service'?'⚙':seg==='product'?'◈':'◎'}
                </span>
                <span style={{ fontSize:12, fontWeight:700, color:v>0?'var(--green)':v<0?'var(--bad)':'var(--muted2)' }}>
                  {v>0?'+':''}{v}
                </span>
                <span style={{ fontSize:11, color:'var(--muted)', fontWeight:500, textTransform:'capitalize' }}>{seg}</span>
              </div>
            )
          })}
          {/* Live indicator */}
          <div className="live-badge" style={{ marginLeft:'auto' }}>
            <div className="live-dot"/><span>LIVE</span>
          </div>
        </div>
      </div>

      {/* Leave tip CTA */}
      <button onClick={() => setShowTip(true)} style={{
        width:'100%', padding:14, borderRadius:14,
        background:'linear-gradient(135deg,#e8341c,#a82010)',
        color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:15,
        border:'none', cursor:'pointer', marginBottom:20,
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        boxShadow:'0 4px 20px rgba(232,52,28,0.3)',
        transition:'transform 0.15s, box-shadow 0.15s',
      }}
        onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-1px)')}
        onMouseLeave={e=>(e.currentTarget.style.transform='none')}
      >
        <span style={{ fontSize:18 }}>★</span> Dejar un Tip
      </button>

      {/* Tips split */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div>
          <div style={{ color:'var(--green)', fontWeight:700, fontSize:11, letterSpacing:1, marginBottom:10 }}>
            ▲ BUENOS ({goodTips.length})
          </div>
          {goodTips.length === 0 && <Empty text="Sé el primero en dejar un tip bueno." />}
          {goodTips.map((t, i) => <TipCard key={t.id} tip={t} delay={i * 40} />)}
        </div>
        <div>
          <div style={{ color:'var(--bad)', fontWeight:700, fontSize:11, letterSpacing:1, marginBottom:10 }}>
            ▼ MALOS ({badTips.length})
          </div>
          {badTips.length === 0 && <Empty text="Sin malos tips por ahora." />}
          {badTips.map((t, i) => <TipCard key={t.id} tip={t} delay={i * 40} />)}
        </div>
      </div>

      {showTip && (
        <AddTipModal
          company={company}
          onClose={() => setShowTip(false)}
          onSuccess={() => setShowTip(false)}
        />
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div style={{ color:'var(--muted)', fontSize:13, padding:'12px 0' }}>{text}</div>
}
