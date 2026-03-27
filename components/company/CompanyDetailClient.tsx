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
  const router = useRouter()
  const [showTip,  setShowTip]  = useState(false)
  const [qrOpen,   setQrOpen]   = useState(false)
  const [filter,   setFilter]   = useState<'all'|'good'|'bad'>('all')
  const [segFilter, setSegFilter] = useState<'all'|'service'|'product'|'employee'>('all')
  const [activeTab, setActiveTab] = useState<'tips'|'employees'|'products'>('tips')

  const company  = useRealtimeCompany(initial.id) || initial
  const { tips } = useRealtimeTips(initial.id)
  const allTips  = tips.length > 0 ? tips : initialTips
  const s        = company.score_total

  // Filter tips
  const filteredTips = allTips.filter(t => {
    if (filter === 'good' && t.type !== 'good') return false
    if (filter === 'bad'  && t.type !== 'bad')  return false
    if (segFilter !== 'all' && t.segment !== segFilter) return false
    return true
  })
  const goodTips = allTips.filter(t => t.type==='good')
  const badTips  = allTips.filter(t => t.type==='bad')

  // Employees from tips
  const employeeMap: Record<string, { name:string; good:number; bad:number }> = {}
  allTips.filter(t => t.segment==='employee' && (t as any).employee_name).forEach(t => {
    const name = (t as any).employee_name
    if (!employeeMap[name]) employeeMap[name] = { name, good:0, bad:0 }
    if (t.type==='good') employeeMap[name].good++
    else employeeMap[name].bad++
  })
  const employees = Object.values(employeeMap).sort((a,b) => (b.good-b.bad) - (a.good-a.bad))

  // Products from tips
  const productMap: Record<string, { name:string; good:number; bad:number }> = {}
  allTips.filter(t => t.segment==='product' && (t as any).product_title).forEach(t => {
    const name = (t as any).product_title
    if (!productMap[name]) productMap[name] = { name, good:0, bad:0 }
    if (t.type==='good') productMap[name].good++
    else productMap[name].bad++
  })
  const products = Object.values(productMap).sort((a,b) => (b.good-b.bad) - (a.good-a.bad))

  return (
    <div>
      <button onClick={() => router.push('/')} style={{ display:'flex',alignItems:'center',gap:6,background:'none',border:'none',color:'var(--red)',fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:20,padding:0 }}>
        ← Volver
      </button>

      {/* Hero card — liquid glass */}
      <div style={{
        background:'rgba(255,255,255,0.04)', backdropFilter:'blur(40px) saturate(180%)',
        WebkitBackdropFilter:'blur(40px) saturate(180%)',
        borderRadius:22, padding:'22px 20px', marginBottom:18,
        border:'1px solid rgba(255,255,255,0.1)', position:'relative', overflow:'hidden',
        boxShadow:'0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        <div style={{ display:'flex', gap:16, marginBottom:20, alignItems:'flex-start' }}>
          <div style={{ width:62,height:62,borderRadius:17,flexShrink:0,background:'linear-gradient(135deg,#c0392b,#8e0000)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:28,boxShadow:'0 8px 28px rgba(192,57,43,0.45)' }}>
            {company.name[0]}
          </div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:22,margin:'0 0 4px' }}>{company.name}</h1>
            <div style={{ color:'var(--muted)',fontSize:13 }}>{company.category}{company.city && ` · ${company.city}`}</div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color:'var(--red)',fontSize:12,textDecoration:'none',display:'block',marginTop:4 }}>
                {company.website.replace(/^https?:\/\//,'')}
              </a>
            )}
          </div>
          <div style={{ textAlign:'right',flexShrink:0 }}>
            <div style={{ display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end' }}>
              <span style={{ fontSize:20,color:s>=0?'var(--green)':'var(--bad)' }}>{s>=0?'▲':'▼'}</span>
              <span style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:34,color:s>=0?'var(--green)':'var(--bad)',letterSpacing:-2 }}>{s>0?'+':''}{s}</span>
            </div>
            <div style={{ color:'var(--muted)',fontSize:11 }}>overall</div>
          </div>
        </div>

        {/* Segment pills + LIVE + QR */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',alignItems:'center' }}>
          {SEGS.map(seg => {
            const v = company[`score_${seg}` as keyof Company] as number
            return (
              <div key={seg} style={{ display:'flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:99,background:v>0?'var(--green-dim)':v<0?'var(--bad-dim)':'rgba(255,255,255,0.04)',border:`1px solid ${v>0?'rgba(29,185,84,0.2)':v<0?'rgba(232,52,28,0.2)':'var(--border)'}` }}>
                <span style={{ fontSize:11,color:'var(--muted)' }}>{SEG_ICON[seg]}</span>
                <span style={{ fontSize:12,fontWeight:700,color:v>0?'var(--green)':v<0?'var(--bad)':'var(--muted2)' }}>{v>0?'+':''}{v}</span>
                <span style={{ fontSize:11,color:'var(--muted)',fontWeight:500 }}>{SEG_LABEL[seg]}</span>
              </div>
            )
          })}
          <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:8 }}>
            <div className="live-badge"><div className="live-dot"/><span>LIVE</span></div>
            <button onClick={()=>setQrOpen(true)} style={{ background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:99,padding:'5px 12px',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:11,fontWeight:700,fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/></svg>
              QR
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button onClick={() => setShowTip(true)} style={{ width:'100%',padding:14,borderRadius:14,background:'linear-gradient(135deg,#e8341c,#a82010)',color:'#fff',fontWeight:700,fontSize:15,border:'none',cursor:'pointer',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 20px rgba(232,52,28,0.35)' }}>
        ★ Dejar un Tip
      </button>

      {/* Tabs */}
      <div style={{ display:'flex',background:'var(--bg)',borderRadius:14,padding:4,gap:4,marginBottom:20 }}>
        {[
          { id:'tips',      label:`Tips (${allTips.length})` },
          { id:'employees', label:`Empleados (${employees.length})` },
          { id:'products',  label:`Productos (${products.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)} style={{ flex:1,padding:'9px 0',borderRadius:10,border:'none',cursor:'pointer',background:activeTab===tab.id?'var(--card2)':'transparent',color:activeTab===tab.id?'var(--text)':'var(--muted)',fontFamily:'inherit',fontWeight:600,fontSize:12,transition:'all .15s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tips tab */}
      {activeTab==='tips' && (
        <>
          {/* Filters */}
          <div style={{ display:'flex',gap:8,marginBottom:16,flexWrap:'wrap' }}>
            {[{id:'all',label:'Todos'},{id:'good',label:'▲ Buenos'},{id:'bad',label:'▼ Malos'}].map(f=>(
              <button key={f.id} onClick={()=>setFilter(f.id as any)} style={{ padding:'6px 12px',borderRadius:99,fontFamily:'inherit',fontWeight:600,fontSize:12,cursor:'pointer',background:filter===f.id?'var(--red)':'var(--card)',color:filter===f.id?'#fff':'var(--muted2)',border:`1px solid ${filter===f.id?'var(--red)':'var(--border2)'}`,transition:'all .15s' }}>
                {f.label}
              </button>
            ))}
            <div style={{ width:1,background:'var(--border)',margin:'0 4px' }}/>
            {[{id:'all',label:'Todo'},{id:'service',label:'⚙ Servicio'},{id:'product',label:'◈ Producto'},{id:'employee',label:'◎ Empleado'}].map(f=>(
              <button key={f.id} onClick={()=>setSegFilter(f.id as any)} style={{ padding:'6px 12px',borderRadius:99,fontFamily:'inherit',fontWeight:600,fontSize:12,cursor:'pointer',background:segFilter===f.id?'rgba(255,255,255,0.1)':'var(--card)',color:segFilter===f.id?'var(--text)':'var(--muted2)',border:`1px solid ${segFilter===f.id?'rgba(255,255,255,0.2)':'var(--border2)'}`,transition:'all .15s' }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
            <div>
              <div style={{ color:'var(--green)',fontWeight:700,fontSize:11,letterSpacing:1,marginBottom:10 }}>▲ BUENOS ({goodTips.length})</div>
              {filteredTips.filter(t=>t.type==='good').length===0
                ? <div style={{ color:'var(--muted)',fontSize:13 }}>Sé el primero.</div>
                : filteredTips.filter(t=>t.type==='good').map((t,i)=><TipCard key={t.id} tip={t} delay={i*20}/>)
              }
            </div>
            <div>
              <div style={{ color:'var(--bad)',fontWeight:700,fontSize:11,letterSpacing:1,marginBottom:10 }}>▼ MALOS ({badTips.length})</div>
              {filteredTips.filter(t=>t.type==='bad').length===0
                ? <div style={{ color:'var(--muted)',fontSize:13 }}>Sin malos tips.</div>
                : filteredTips.filter(t=>t.type==='bad').map((t,i)=><TipCard key={t.id} tip={t} delay={i*20}/>)
              }
            </div>
          </div>
        </>
      )}

      {/* Employees tab */}
      {activeTab==='employees' && (
        <div>
          {employees.length===0 ? (
            <div style={{ textAlign:'center',padding:'40px 0',color:'var(--muted)' }}>
              <div style={{ fontSize:32,marginBottom:8 }}>◎</div>
              <div>Aún no hay tips sobre empleados.</div>
            </div>
          ) : employees.map((emp, i) => {
            const score = emp.good - emp.bad
            return (
              <div key={emp.name} style={{ background:'var(--card)',borderRadius:14,padding:'14px 16px',marginBottom:10,border:'1px solid var(--border)',display:'flex',alignItems:'center',gap:14 }}>
                <div style={{ width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted2)',fontWeight:700,fontSize:16,flexShrink:0 }}>
                  {emp.name[0].toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:15,marginBottom:4 }}>{emp.name}</div>
                  <div style={{ display:'flex',gap:10,fontSize:12 }}>
                    <span style={{ color:'var(--green)' }}>▲ {emp.good}</span>
                    <span style={{ color:'var(--bad)' }}>▼ {emp.bad}</span>
                  </div>
                </div>
                <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:22,color:score>=0?'var(--green)':'var(--bad)' }}>
                  {score>0?'+':''}{score}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Products tab */}
      {activeTab==='products' && (
        <div>
          {products.length===0 ? (
            <div style={{ textAlign:'center',padding:'40px 0',color:'var(--muted)' }}>
              <div style={{ fontSize:32,marginBottom:8 }}>◈</div>
              <div>Aún no hay tips sobre productos.</div>
            </div>
          ) : products.map((prod, i) => {
            const score = prod.good - prod.bad
            return (
              <div key={prod.name} style={{ background:'var(--card)',borderRadius:14,padding:'14px 16px',marginBottom:10,border:'1px solid var(--border)',display:'flex',alignItems:'center',gap:14 }}>
                <div style={{ width:40,height:40,borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted2)',fontSize:18,flexShrink:0 }}>
                  ◈
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:15,marginBottom:4 }}>{prod.name}</div>
                  <div style={{ display:'flex',gap:10,fontSize:12 }}>
                    <span style={{ color:'var(--green)' }}>▲ {prod.good}</span>
                    <span style={{ color:'var(--bad)' }}>▼ {prod.bad}</span>
                  </div>
                </div>
                <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:22,color:score>=0?'var(--green)':'var(--bad)' }}>
                  {score>0?'+':''}{score}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showTip && <AddTipModal company={company} onClose={()=>setShowTip(false)} onSuccess={()=>setShowTip(false)}/>}
      {qrOpen && <QRModal companyName={company.name} companySlug={(company as any).slug||''} onClose={()=>setQrOpen(false)}/>}
    </div>
  )
}
