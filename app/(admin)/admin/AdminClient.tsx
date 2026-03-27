'use client'
import { useState } from 'react'

interface Props {
  flaggedTips: any[]
  pendingClaims: any[]
  recentReports: any[]
  stats: { tips:number; companies:number; users:number }
}

export default function AdminClient({ flaggedTips, pendingClaims, recentReports, stats }: Props) {
  const [tab, setTab] = useState<'flagged'|'claims'|'reports'>('flagged')
  const [tips, setTips] = useState(flaggedTips)
  const [claims, setClaims] = useState(pendingClaims)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function unflagTip(id: string) {
    await fetch(`/api/admin/tips/${id}/unflag`, { method:'POST' })
    setTips(prev => prev.filter(t => t.id !== id))
    showToast('Tip restaurado')
  }

  async function deleteTip(id: string) {
    await fetch(`/api/admin/tips/${id}`, { method:'DELETE' })
    setTips(prev => prev.filter(t => t.id !== id))
    showToast('Tip eliminado')
  }

  async function approveClaim(id: string) {
    await fetch(`/api/admin/claims/${id}/approve`, { method:'POST' })
    setClaims(prev => prev.filter(c => c.id !== id))
    showToast('Claim aprobado')
  }

  async function rejectClaim(id: string) {
    await fetch(`/api/admin/claims/${id}/reject`, { method:'POST' })
    setClaims(prev => prev.filter(c => c.id !== id))
    showToast('Claim rechazado')
  }

  const tabs = [
    { id:'flagged',  label:'Flagged',  count:tips.length,   color:'#e8341c' },
    { id:'claims',   label:'Claims',   count:claims.length, color:'#e8b84b' },
    { id:'reports',  label:'Reports',  count:recentReports.length, color:'#7c9ab5' },
  ]

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', color:'#f0f0f2' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:'#1db954', color:'#fff', padding:'10px 18px', borderRadius:12, fontWeight:600, fontSize:13, zIndex:999, boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>
          ✓ {toast}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
        {[
          { label:'Usuarios',  val:stats.users,     icon:'👤', color:'rgba(124,154,181,0.15)', border:'rgba(124,154,181,0.3)', text:'#7c9ab5' },
          { label:'Empresas',  val:stats.companies, icon:'🏢', color:'rgba(232,184,75,0.15)',  border:'rgba(232,184,75,0.3)',  text:'#e8b84b' },
          { label:'Tips',      val:stats.tips,      icon:'★',  color:'rgba(29,185,84,0.15)',   border:'rgba(29,185,84,0.3)',   text:'#1db954' },
        ].map(s=>(
          <div key={s.label} style={{ background:s.color, border:`1px solid ${s.border}`, borderRadius:16, padding:'18px 20px' }}>
            <div style={{ fontSize:22, marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:30, fontWeight:800, color:s.text, letterSpacing:-1 }}>{s.val}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert banners */}
      {(tips.length > 0 || claims.length > 0) && (
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
          {tips.length > 0 && (
            <div style={{ background:'rgba(232,52,28,0.08)', border:'1px solid rgba(232,52,28,0.2)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={()=>setTab('flagged')}>
              <span style={{ fontSize:16 }}>🚩</span>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}><strong style={{ color:'#e8341c' }}>{tips.length} tip{tips.length!==1?'s':''}</strong> necesitan revisión</span>
              <span style={{ marginLeft:'auto', fontSize:12, color:'rgba(255,255,255,0.3)' }}>Ver →</span>
            </div>
          )}
          {claims.length > 0 && (
            <div style={{ background:'rgba(232,184,75,0.08)', border:'1px solid rgba(232,184,75,0.2)', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={()=>setTab('claims')}>
              <span style={{ fontSize:16 }}>🏢</span>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}><strong style={{ color:'#e8b84b' }}>{claims.length} claim{claims.length!==1?'s':''}</strong> pendiente{claims.length!==1?'s':''} de aprobación</span>
              <span style={{ marginLeft:'auto', fontSize:12, color:'rgba(255,255,255,0.3)' }}>Ver →</span>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:'rgba(255,255,255,0.04)', borderRadius:12, padding:4 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{
            flex:1, padding:'9px 0', borderRadius:9, border:'none', cursor:'pointer',
            fontFamily:'inherit', fontWeight:600, fontSize:13, transition:'all .15s',
            background: tab===t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: tab===t.id ? '#fff' : 'rgba(255,255,255,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}>
            {t.label}
            {t.count > 0 && (
              <span style={{ background:t.color, color:'#fff', fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:99, minWidth:18, textAlign:'center' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Flagged tips */}
      {tab==='flagged' && (
        <div>
          {tips.length===0 && (
            <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✓</div>
              <div style={{ fontSize:16 }}>No hay tips flaggeados</div>
            </div>
          )}
          {tips.map(tip=>(
            <div key={tip.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:18, marginBottom:12, border:'1px solid rgba(232,52,28,0.15)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#c0392b,#8e0000)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14 }}>
                    {(tip.profile?.username||'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:'#fff' }}>@{tip.profile?.username||'anon'}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>en {tip.company?.name}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ background:'rgba(232,52,28,0.15)', color:'#e8341c', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, border:'1px solid rgba(232,52,28,0.25)' }}>
                    {tip.reports_count} denuncia{tip.reports_count!==1?'s':''}
                  </span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{new Date(tip.created_at).toLocaleDateString('es')}</span>
                </div>
              </div>

              <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:10, padding:'12px 14px', marginBottom:14, borderLeft:'3px solid rgba(232,52,28,0.4)' }}>
                <p style={{ color:'rgba(255,255,255,0.75)', fontSize:14, lineHeight:1.6, margin:0 }}>{tip.text}</p>
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>unflagTip(tip.id)} style={{ padding:'8px 16px', borderRadius:99, background:'rgba(29,185,84,0.12)', color:'#1db954', border:'1px solid rgba(29,185,84,0.25)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>
                  ✓ Restaurar
                </button>
                <button onClick={()=>deleteTip(tip.id)} style={{ padding:'8px 16px', borderRadius:99, background:'rgba(232,52,28,0.12)', color:'#e8341c', border:'1px solid rgba(232,52,28,0.25)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>
                  Eliminar
                </button>
                <a href={`/t/${tip.id}`} target="_blank" style={{ padding:'8px 14px', borderRadius:99, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.1)', textDecoration:'none', fontSize:13, fontWeight:600 }}>
                  Ver →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claims */}
      {tab==='claims' && (
        <div>
          {claims.length===0 && (
            <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✓</div>
              <div style={{ fontSize:16 }}>No hay claims pendientes</div>
            </div>
          )}
          {claims.map(claim=>(
            <div key={claim.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:16, padding:18, marginBottom:12, border:'1px solid rgba(232,184,75,0.15)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:'rgba(232,184,75,0.15)', border:'1px solid rgba(232,184,75,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏢</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{claim.profile?.full_name || claim.profile?.username}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:2 }}>
                    quiere reclamar <span style={{ color:'#e8b84b', fontWeight:600 }}>{claim.company?.name}</span>
                  </div>
                </div>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{new Date(claim.created_at).toLocaleDateString('es')}</span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>approveClaim(claim.id)} style={{ padding:'8px 18px', borderRadius:99, background:'rgba(29,185,84,0.12)', color:'#1db954', border:'1px solid rgba(29,185,84,0.25)', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}>
                  ✓ Aprobar
                </button>
                <button onClick={()=>rejectClaim(claim.id)} style={{ padding:'8px 16px', borderRadius:99, background:'rgba(232,52,28,0.12)', color:'#e8341c', border:'1px solid rgba(232,52,28,0.25)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13 }}>
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports */}
      {tab==='reports' && (
        <div>
          {recentReports.length===0 && (
            <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✓</div>
              <div style={{ fontSize:16 }}>Sin reportes recientes</div>
            </div>
          )}
          {recentReports.map(r=>(
            <div key={r.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'14px 16px', marginBottom:10, border:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:36, height:36, borderRadius:99, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🚩</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#e8341c', background:'rgba(232,52,28,0.1)', padding:'2px 8px', borderRadius:99 }}>{r.reason}</span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{new Date(r.created_at).toLocaleDateString('es')}</span>
                </div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>"{r.tip?.text?.slice(0,80)}..."</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:4 }}>por @{r.reporter?.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
