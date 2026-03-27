'use client'
import { useState } from 'react'

interface Props {
  flaggedTips: any[]
  pendingClaims: any[]
  recentReports: any[]
  stats: { tips:number; companies:number; users:number }
}

export default function AdminClient({ flaggedTips, pendingClaims, recentReports, stats }: Props) {
  const [tab, setTab] = useState<'overview'|'flagged'|'claims'|'reports'>('overview')
  const [tips, setTips] = useState(flaggedTips)
  const [claims, setClaims] = useState(pendingClaims)

  async function unflagTip(id: string) {
    await fetch(`/api/admin/tips/${id}/unflag`, { method:'POST' })
    setTips(prev => prev.filter(t => t.id !== id))
  }

  async function deleteTip(id: string) {
    await fetch(`/api/admin/tips/${id}`, { method:'DELETE' })
    setTips(prev => prev.filter(t => t.id !== id))
  }

  async function approveClaim(id: string) {
    await fetch(`/api/admin/claims/${id}/approve`, { method:'POST' })
    setClaims(prev => prev.filter(c => c.id !== id))
  }

  async function rejectClaim(id: string) {
    await fetch(`/api/admin/claims/${id}/reject`, { method:'POST' })
    setClaims(prev => prev.filter(c => c.id !== id))
  }

  const tabs = [
    { id:'overview', label:'Overview' },
    { id:'flagged',  label:`Flagged (${tips.length})` },
    { id:'claims',   label:`Claims (${claims.length})` },
    { id:'reports',  label:`Reports (${recentReports.length})` },
  ]

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Usuarios', val:stats.users, color:'#7c9ab5' },
          { label:'Empresas', val:stats.companies, color:'#e8b84b' },
          { label:'Tips',     val:stats.tips, color:'#1db954' },
        ].map(s=>(
          <div key={s.label} style={{ background:'rgba(255,255,255,0.05)', borderRadius:14, padding:'16px 20px', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize:32, fontWeight:900, color:s.color }}>{s.val}</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ padding:'8px 16px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13, background:tab===t.id?'#e8341c':'rgba(255,255,255,0.06)', color:tab===t.id?'#fff':'rgba(255,255,255,0.5)', transition:'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Flagged tips */}
      {tab==='flagged' && (
        <div>
          {tips.length===0 && <div style={{ color:'rgba(255,255,255,0.3)', padding:'40px 0', textAlign:'center' }}>No hay tips flaggeados 🎉</div>}
          {tips.map(tip=>(
            <div key={tip.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:16, marginBottom:12, border:'1px solid rgba(232,52,28,0.2)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  <span style={{ color:'#e8341c', fontWeight:700 }}>{tip.profile?.username || 'anon'}</span>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12, marginLeft:8 }}>en {tip.company?.name}</span>
                  <span style={{ marginLeft:8, fontSize:11, background:'rgba(232,52,28,0.15)', color:'#e8341c', padding:'2px 8px', borderRadius:99 }}>{tip.reports_count} denuncias</span>
                </div>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>{new Date(tip.created_at).toLocaleDateString('es')}</span>
              </div>
              <p style={{ color:'rgba(255,255,255,0.8)', fontSize:14, marginBottom:12 }}>{tip.text}</p>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>unflagTip(tip.id)} style={{ padding:'7px 14px', borderRadius:99, background:'rgba(29,185,84,0.15)', color:'#1db954', border:'1px solid rgba(29,185,84,0.3)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:12 }}>
                  ✓ Restaurar
                </button>
                <button onClick={()=>deleteTip(tip.id)} style={{ padding:'7px 14px', borderRadius:99, background:'rgba(232,52,28,0.15)', color:'#e8341c', border:'1px solid rgba(232,52,28,0.3)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:12 }}>
                  🗑 Eliminar
                </button>
                <a href={`/t/${tip.id}`} target="_blank" style={{ padding:'7px 14px', borderRadius:99, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', border:'1px solid rgba(255,255,255,0.1)', textDecoration:'none', fontSize:12, fontWeight:600 }}>
                  Ver →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Business claims */}
      {tab==='claims' && (
        <div>
          {claims.length===0 && <div style={{ color:'rgba(255,255,255,0.3)', padding:'40px 0', textAlign:'center' }}>No hay claims pendientes 🎉</div>}
          {claims.map(claim=>(
            <div key={claim.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:16, marginBottom:12, border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{claim.profile?.full_name || claim.profile?.username}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>quiere reclamar → <span style={{ color:'#e8b84b' }}>{claim.company?.name}</span></div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>approveClaim(claim.id)} style={{ padding:'7px 14px', borderRadius:99, background:'rgba(29,185,84,0.15)', color:'#1db954', border:'1px solid rgba(29,185,84,0.3)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:12 }}>
                  ✓ Aprobar
                </button>
                <button onClick={()=>rejectClaim(claim.id)} style={{ padding:'7px 14px', borderRadius:99, background:'rgba(232,52,28,0.15)', color:'#e8341c', border:'1px solid rgba(232,52,28,0.3)', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:12 }}>
                  ✗ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reports */}
      {tab==='reports' && (
        <div>
          {recentReports.length===0 && <div style={{ color:'rgba(255,255,255,0.3)', padding:'40px 0', textAlign:'center' }}>Sin reportes</div>}
          {recentReports.map(r=>(
            <div key={r.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:16, marginBottom:10, border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ color:'#e8341c', fontSize:13, fontWeight:600 }}>{r.reason}</span>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>{new Date(r.created_at).toLocaleDateString('es')}</span>
              </div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13, marginBottom:4 }}>"{r.tip?.text?.slice(0,80)}..."</div>
              <div style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>por @{r.reporter?.username}</div>
            </div>
          ))}
        </div>
      )}

      {/* Overview */}
      {tab==='overview' && (
        <div style={{ color:'rgba(255,255,255,0.5)', textAlign:'center', padding:'40px 0' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🛡️</div>
          <div style={{ fontSize:18, marginBottom:8, color:'rgba(255,255,255,0.8)' }}>Panel de Moderación</div>
          <div>Seleccioná una pestaña para moderar contenido</div>
          {(tips.length > 0 || claims.length > 0) && (
            <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'center' }}>
              {tips.length>0 && <span style={{ background:'rgba(232,52,28,0.15)', color:'#e8341c', padding:'6px 14px', borderRadius:99, fontSize:13, fontWeight:600 }}>⚠️ {tips.length} tips flaggeados</span>}
              {claims.length>0 && <span style={{ background:'rgba(232,180,75,0.15)', color:'#e8b84b', padding:'6px 14px', borderRadius:99, fontSize:13, fontWeight:600 }}>🏢 {claims.length} claims pendientes</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
