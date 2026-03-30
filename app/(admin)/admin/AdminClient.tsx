'use client'
import React, { useState } from 'react'

const LEVELS = [
  { name:'Curioso',   emoji:'👀', color:'#6e6e7a' },
  { name:'Vecino',    emoji:'🏘️', color:'#7c9ab5' },
  { name:'Conocedor', emoji:'🎯', color:'#5ba85a' },
  { name:'Crítico',   emoji:'⚡', color:'#e8b84b' },
  { name:'Experto',   emoji:'🔥', color:'#e87c34' },
  { name:'Gurú',      emoji:'💎', color:'#9b59b6' },
  { name:'Leyenda',   emoji:'👑', color:'#e8341c' },
]

interface Props {
  flaggedTips: any[]
  pendingClaims: any[]
  recentReports: any[]
  stats: { tips:number; companies:number; users:number; comments:number }
  userGrowth: any[]
  categoryMap: Record<string,number>
  levelCounts: number[]
  paidCompanies: any[]
  recentUsers: any[]
  recentCompanies: any[]
}

export default function AdminClient({ flaggedTips, pendingClaims, recentReports, stats, categoryMap, levelCounts, paidCompanies, recentUsers, recentCompanies, userGrowth }: Props) {
  const [tab, setTab] = useState<'overview'|'flagged'|'claims'|'reports'|'companies'|'users'>('overview')
  const [tips, setTips] = useState(flaggedTips)
  const [claims, setClaims] = useState(pendingClaims)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(''), 2500) }

  async function unflagTip(id: string) { await fetch(`/api/admin/tips/${id}/unflag`,{method:'POST'}); setTips(p=>p.filter(t=>t.id!==id)); showToast('Tip restaurado') }
  async function deleteTip(id: string) { await fetch(`/api/admin/tips/${id}`,{method:'DELETE'}); setTips(p=>p.filter(t=>t.id!==id)); showToast('Tip eliminado') }
  async function approveClaim(id: string) { await fetch(`/api/admin/claims/${id}/approve`,{method:'POST'}); setClaims(p=>p.filter(c=>c.id!==id)); showToast('Claim aprobado') }
  async function rejectClaim(id: string) { await fetch(`/api/admin/claims/${id}/reject`,{method:'POST'}); setClaims(p=>p.filter(c=>c.id!==id)); showToast('Claim rechazado') }

  const totalUsers = levelCounts.reduce((a,b)=>a+b,0)
  const maxCat = Math.max(...Object.values(categoryMap), 1)

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', color:'#f0f0f2' }}>

      {toast && <div style={{ position:'fixed',top:20,right:20,background:'#1db954',color:'#fff',padding:'10px 18px',borderRadius:12,fontWeight:600,fontSize:13,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,0.4)' }}>✓ {toast}</div>}

      {/* Main stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[
          { label:'Usuarios',    val:stats.users,    icon:'👤', color:'#7c9ab5' },
          { label:'Empresas',    val:stats.companies, icon:'🏢', color:'#e8b84b' },
          { label:'Tips',        val:stats.tips,     icon:'★',  color:'#1db954' },
          { label:'Comentarios', val:stats.comments, icon:'💬', color:'#9b59b6' },
        ].map(s=>(
          <div key={s.label} style={{ background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'14px 16px' }}>
            <div style={{ fontSize:18,marginBottom:4 }}>{s.icon}</div>
            <div style={{ fontSize:26,fontWeight:800,color:s.color,letterSpacing:-1 }}>{s.val}</div>
            <div style={{ fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* User Growth Chart */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:18, marginBottom:20 }}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:16, color:'rgba(255,255,255,0.6)', letterSpacing:.5 }}>USUARIOS NUEVOS — ÚLTIMOS 30 DÍAS</div>
        <UserGrowthChart data={userGrowth}/>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:6,marginBottom:20,background:'rgba(255,255,255,0.04)',borderRadius:12,padding:4 }}>
        {[
          { id:'overview', label:'Overview', count:0 },
          { id:'flagged',  label:'Flagged',  count:tips.length,   color:'#e8341c' },
          { id:'claims',   label:'Claims',   count:claims.length, color:'#e8b84b' },
          { id:'reports',  label:'Reports',  count:recentReports.length, color:'#7c9ab5' },
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ flex:1,padding:'9px 0',borderRadius:9,border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:12,transition:'all .15s',background:tab===t.id?'rgba(255,255,255,0.08)':'transparent',color:tab===t.id?'#fff':'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:5 }}>
            {t.label}
            {(t.count||0)>0 && <span style={{ background:(t as any).color||'#666',color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:99 }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==='overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

          {/* Levels */}
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:18 }}>
            <div style={{ fontWeight:700,fontSize:13,marginBottom:14,color:'rgba(255,255,255,0.6)',letterSpacing:.5 }}>USUARIOS POR NIVEL</div>
            {LEVELS.map((l,i)=>{
              const count = levelCounts[i]||0
              const pct   = totalUsers > 0 ? Math.round((count/totalUsers)*100) : 0
              return (
                <div key={l.name} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
                    <span style={{ fontSize:13 }}>{l.emoji} {l.name}</span>
                    <span style={{ fontSize:12,color:'rgba(255,255,255,0.4)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.06)',borderRadius:99,height:4,overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`,height:'100%',background:l.color,borderRadius:99,transition:'width .5s' }}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Categories */}
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:18 }}>
            <div style={{ fontWeight:700,fontSize:13,marginBottom:14,color:'rgba(255,255,255,0.6)',letterSpacing:.5 }}>EMPRESAS POR CATEGORÍA</div>
            {Object.entries(categoryMap).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>(
              <div key={cat} style={{ marginBottom:10 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
                  <span style={{ fontSize:13 }}>{cat}</span>
                  <span style={{ fontSize:12,color:'rgba(255,255,255,0.4)' }}>{count}</span>
                </div>
                <div style={{ background:'rgba(255,255,255,0.06)',borderRadius:99,height:4,overflow:'hidden' }}>
                  <div style={{ width:`${Math.round((count/maxCat)*100)}%`,height:'100%',background:'#e8341c',borderRadius:99 }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Paid companies */}
          <div style={{ background:'rgba(232,184,75,0.06)',border:'1px solid rgba(232,184,75,0.15)',borderRadius:16,padding:18 }}>
            <div style={{ fontWeight:700,fontSize:13,marginBottom:14,color:'rgba(232,184,75,0.8)',letterSpacing:.5 }}>EMPRESAS PAGAS ({paidCompanies.length})</div>
            {paidCompanies.length===0 && <div style={{ color:'rgba(255,255,255,0.3)',fontSize:13 }}>Ninguna todavía</div>}
            {paidCompanies.map(p=>(
              <div key={p.id} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                <div style={{ width:28,height:28,borderRadius:8,background:'rgba(232,184,75,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🏢</div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600 }}>{p.full_name||p.username}</div>
                  <div style={{ fontSize:11,color:'rgba(255,255,255,0.3)' }}>@{p.username}</div>
                </div>
                <span style={{ marginLeft:'auto',fontSize:10,background:'rgba(232,184,75,0.15)',color:'#e8b84b',padding:'2px 8px',borderRadius:99,fontWeight:700 }}>PAGO</span>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:18 }}>
            <div style={{ fontWeight:700,fontSize:13,marginBottom:14,color:'rgba(255,255,255,0.6)',letterSpacing:.5 }}>ÚLTIMOS USUARIOS</div>
            {recentUsers.map(u=>(
              <div key={u.id} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                <div style={{ width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#c0392b,#8e0000)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:12 }}>
                  {(u.username||'?')[0].toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13,fontWeight:600 }}>@{u.username}</div>
                </div>
                <span style={{ fontSize:11,color:'rgba(255,255,255,0.3)' }}>{new Date(u.created_at).toLocaleDateString('es',{day:'numeric',month:'short'})}</span>
              </div>
            ))}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)',marginTop:12,paddingTop:12,fontWeight:700,fontSize:13,color:'rgba(255,255,255,0.6)',letterSpacing:.5,marginBottom:10 }}>ÚLTIMAS EMPRESAS</div>
            {recentCompanies.map(c=>(
              <div key={c.id} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                <div style={{ width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700 }}>
                  {c.name[0]}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize:11,color:'rgba(255,255,255,0.3)' }}>{c.category}</div>
                </div>
                <span style={{ fontSize:11,color:'rgba(255,255,255,0.3)',flexShrink:0 }}>{new Date(c.created_at).toLocaleDateString('es',{day:'numeric',month:'short'})}</span>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {(tips.length>0||claims.length>0) && (
            <div style={{ gridColumn:'1/-1' }}>
              {tips.length>0 && <div onClick={()=>setTab('flagged')} style={{ background:'rgba(232,52,28,0.08)',border:'1px solid rgba(232,52,28,0.2)',borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:8 }}>
                <span>🚩</span><span style={{ fontSize:13,color:'rgba(255,255,255,0.8)' }}><strong style={{ color:'#e8341c' }}>{tips.length} tips</strong> necesitan revisión</span><span style={{ marginLeft:'auto',fontSize:12,color:'rgba(255,255,255,0.3)' }}>Ver →</span>
              </div>}
              {claims.length>0 && <div onClick={()=>setTab('claims')} style={{ background:'rgba(232,184,75,0.08)',border:'1px solid rgba(232,184,75,0.2)',borderRadius:12,padding:'10px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
                <span>🏢</span><span style={{ fontSize:13,color:'rgba(255,255,255,0.8)' }}><strong style={{ color:'#e8b84b' }}>{claims.length} claims</strong> pendientes</span><span style={{ marginLeft:'auto',fontSize:12,color:'rgba(255,255,255,0.3)' }}>Ver →</span>
              </div>}
            </div>
          )}
        </div>
      )}

      {/* FLAGGED */}
      {tab==='flagged' && (
        <div>
          {tips.length===0 && <EmptyState icon="✓" text="No hay tips flaggeados"/>}
          {tips.map(tip=>(
            <div key={tip.id} style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:18,marginBottom:12,border:'1px solid rgba(232,52,28,0.15)' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#c0392b,#8e0000)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:14 }}>{(tip.profile?.username||'A')[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14 }}>@{tip.profile?.username||'anon'}</div>
                    <div style={{ fontSize:12,color:'rgba(255,255,255,0.4)' }}>en {tip.company?.name}</div>
                  </div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <span style={{ background:'rgba(232,52,28,0.15)',color:'#e8341c',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:99,border:'1px solid rgba(232,52,28,0.25)' }}>{tip.reports_count} denuncia{tip.reports_count!==1?'s':''}</span>
                  <span style={{ fontSize:12,color:'rgba(255,255,255,0.3)' }}>{new Date(tip.created_at).toLocaleDateString('es')}</span>
                </div>
              </div>
              <div style={{ background:'rgba(0,0,0,0.2)',borderRadius:10,padding:'12px 14px',marginBottom:14,borderLeft:'3px solid rgba(232,52,28,0.4)' }}>
                <p style={{ color:'rgba(255,255,255,0.75)',fontSize:14,lineHeight:1.6,margin:0 }}>{tip.text}</p>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>unflagTip(tip.id)} style={{ padding:'8px 16px',borderRadius:99,background:'rgba(29,185,84,0.12)',color:'#1db954',border:'1px solid rgba(29,185,84,0.25)',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:13 }}>✓ Restaurar</button>
                <button onClick={()=>deleteTip(tip.id)} style={{ padding:'8px 16px',borderRadius:99,background:'rgba(232,52,28,0.12)',color:'#e8341c',border:'1px solid rgba(232,52,28,0.25)',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:13 }}>Eliminar</button>
                <a href={`/t/${tip.id}`} target="_blank" style={{ padding:'8px 14px',borderRadius:99,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.5)',border:'1px solid rgba(255,255,255,0.1)',textDecoration:'none',fontSize:13,fontWeight:600 }}>Ver →</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CLAIMS */}
      {tab==='claims' && (
        <div>
          {claims.length===0 && <EmptyState icon="✓" text="No hay claims pendientes"/>}
          {claims.map(claim=>(
            <div key={claim.id} style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:18,marginBottom:12,border:'1px solid rgba(232,184,75,0.15)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:14 }}>
                <div style={{ width:44,height:44,borderRadius:12,background:'rgba(232,184,75,0.15)',border:'1px solid rgba(232,184,75,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>🏢</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:15 }}>{claim.profile?.full_name||claim.profile?.username}</div>
                  <div style={{ fontSize:13,color:'rgba(255,255,255,0.4)',marginTop:2 }}>quiere reclamar <span style={{ color:'#e8b84b',fontWeight:600 }}>{claim.company?.name}</span></div>
                </div>
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={()=>approveClaim(claim.id)} style={{ padding:'8px 18px',borderRadius:99,background:'rgba(29,185,84,0.12)',color:'#1db954',border:'1px solid rgba(29,185,84,0.25)',cursor:'pointer',fontFamily:'inherit',fontWeight:700,fontSize:13 }}>✓ Aprobar</button>
                <button onClick={()=>rejectClaim(claim.id)} style={{ padding:'8px 16px',borderRadius:99,background:'rgba(232,52,28,0.12)',color:'#e8341c',border:'1px solid rgba(232,52,28,0.25)',cursor:'pointer',fontFamily:'inherit',fontWeight:600,fontSize:13 }}>Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPANIES */}
      {tab==='companies' && <CompaniesManager/>}

      {/* USERS */}
      {tab==='users' && <UsersManager recentUsers={recentUsers}/>}

      {/* REPORTS */}
      {tab==='reports' && (
        <div>
          {recentReports.length===0 && <EmptyState icon="✓" text="Sin reportes recientes"/>}
          {recentReports.map(r=>(
            <div key={r.id} style={{ background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'14px 16px',marginBottom:10,border:'1px solid rgba(255,255,255,0.07)',display:'flex',gap:14,alignItems:'flex-start' }}>
              <div style={{ width:36,height:36,borderRadius:99,background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>🚩</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
                  <span style={{ fontSize:12,fontWeight:700,color:'#e8341c',background:'rgba(232,52,28,0.1)',padding:'2px 8px',borderRadius:99 }}>{r.reason}</span>
                  <span style={{ fontSize:12,color:'rgba(255,255,255,0.3)' }}>{new Date(r.created_at).toLocaleDateString('es')}</span>
                </div>
                <div style={{ color:'rgba(255,255,255,0.6)',fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>"{r.tip?.text?.slice(0,80)}..."</div>
                <div style={{ fontSize:12,color:'rgba(255,255,255,0.3)',marginTop:4 }}>por @{r.reporter?.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, text }: { icon:string; text:string }) {
  return (
    <div style={{ textAlign:'center',padding:'60px 0',color:'rgba(255,255,255,0.3)' }}>
      <div style={{ fontSize:48,marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:16 }}>{text}</div>
    </div>
  )
}

function UserGrowthChart({ data }: { data: any[] }) {
  const days = 30
  const counts: Record<string, number> = {}
  const cumulative: Record<string, number> = {}
  
  // Build daily counts
  for (let i = days-1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    counts[key] = 0
  }
  data.forEach(u => {
    const key = u.created_at?.split('T')[0]
    if (key && counts[key] !== undefined) counts[key]++
  })

  const keys = Object.keys(counts).sort()
  let cum = 0
  keys.forEach(k => { cum += counts[k]; cumulative[k] = cum })

  const maxNew = Math.max(...Object.values(counts), 1)
  const maxCum = Math.max(...Object.values(cumulative), 1)
  const W = 100 / keys.length

  const [hover, setHover] = React.useState<string|null>(null)

  return (
    <div style={{ position:'relative' }}>
      {/* Range selector */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['7d','14d','30d'].map(r => (
          <button key={r} style={{ padding:'4px 12px', borderRadius:99, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>{r}</button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:120, position:'relative' }}>
        {keys.map((k, i) => {
          const newH = Math.max(2, (counts[k]/maxNew)*100)
          const isHovered = hover === k
          return (
            <div key={k} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, cursor:'pointer', position:'relative' }}
              onMouseEnter={()=>setHover(k)} onMouseLeave={()=>setHover(null)}>
              {isHovered && (
                <div style={{ position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)', background:'rgba(20,20,22,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 10px', fontSize:11, color:'#fff', whiteSpace:'nowrap', zIndex:10, marginBottom:4 }}>
                  <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:2 }}>{k.slice(5)}</div>
                  <div style={{ color:'#e8341c', fontWeight:700 }}>+{counts[k]} nuevos</div>
                  <div style={{ color:'rgba(255,255,255,0.4)' }}>{cumulative[k]} total</div>
                </div>
              )}
              <div style={{ width:'100%', height:`${newH}%`, background: isHovered?'#e8341c':'rgba(232,52,28,0.5)', borderRadius:'3px 3px 0 0', transition:'background .15s' }}/>
            </div>
          )
        })}
      </div>

      {/* X axis labels */}
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{keys[0]?.slice(5)}</span>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{keys[Math.floor(keys.length/2)]?.slice(5)}</span>
        <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{keys[keys.length-1]?.slice(5)}</span>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginTop:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:12, height:12, borderRadius:3, background:'rgba(232,52,28,0.5)' }}/>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Nuevos por día</span>
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>
          Total últimos 30d: <strong style={{ color:'#e8341c' }}>{data.length}</strong>
        </div>
      </div>
    </div>
  )
}

function CompaniesManager() {
  const [companies, setCompanies] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<any>(null)
  const [toast, setToast] = React.useState('')

  React.useEffect(() => {
    fetch('/api/companies').then(r=>r.json()).then(d => {
      setCompanies(d.data||[])
      setLoading(false)
    })
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(''), 2500) }

  async function deleteCompany(id: string) {
    if (!confirm('Borrar empresa y todos sus tips?')) return
    await fetch(`/api/admin/companies/${id}`, { method:'DELETE' })
    setCompanies(prev => prev.filter(c => c.id !== id))
    showToast('Empresa eliminada')
  }

  async function saveEdit() {
    if (!editing) return
    await fetch(`/api/admin/companies/${editing.id}`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:editing.name, category:editing.category, city:editing.city })
    })
    setCompanies(prev => prev.map(c => c.id===editing.id ? {...c, ...editing} : c))
    setEditing(null)
    showToast('Empresa actualizada')
  }

  if (loading) return <div style={{ color:'rgba(255,255,255,0.3)', padding:40, textAlign:'center' }}>Cargando...</div>

  return (
    <div>
      {toast && <div style={{ position:'fixed',top:20,right:20,background:'#1db954',color:'#fff',padding:'10px 18px',borderRadius:12,fontWeight:600,fontSize:13,zIndex:999 }}>✓ {toast}</div>}
      {editing && (
        <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:20, marginBottom:20 }}>
          <div style={{ fontWeight:700, marginBottom:12 }}>Editar empresa</div>
          {[['Nombre','name'],['Categoría','category'],['Ciudad','city']].map(([label,key]) => (
            <div key={key} style={{ marginBottom:10 }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>{label}</div>
              <input value={editing[key]||''} onChange={e=>setEditing({...editing,[key]:e.target.value})}
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as any }}/>
            </div>
          ))}
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={saveEdit} style={{ padding:'8px 18px', borderRadius:99, background:'#e8341c', color:'#fff', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>Guardar</button>
            <button onClick={()=>setEditing(null)} style={{ padding:'8px 16px', borderRadius:99, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{ marginBottom:12, color:'rgba(255,255,255,0.4)', fontSize:13 }}>{companies.length} empresas</div>
      {companies.map(c => (
        <div key={c.id} style={{ background:'rgba(255,255,255,0.04)', borderRadius:14, padding:'12px 16px', marginBottom:8, border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#c0392b,#8e0000)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16, flexShrink:0 }}>{c.name[0]}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{c.category} · {c.city} · {c.tips_count||0} tips · score: {c.score_total||0}</div>
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            <button onClick={()=>setEditing({...c})} style={{ padding:'6px 12px', borderRadius:99, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontFamily:'inherit', fontSize:12 }}>Editar</button>
            <button onClick={()=>deleteCompany(c.id)} style={{ padding:'6px 12px', borderRadius:99, background:'rgba(232,52,28,0.12)', color:'#e8341c', border:'1px solid rgba(232,52,28,0.25)', cursor:'pointer', fontFamily:'inherit', fontSize:12 }}>Borrar</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function UsersManager({ recentUsers }: { recentUsers: any[] }) {
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [toast, setToast] = React.useState('')
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    fetch('/api/profiles?all=1').then(r=>r.json()).then(d => {
      setUsers(d.data||[])
      setLoading(false)
    })
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(''), 2500) }

  async function banUser(id: string, name: string) {
    if (!confirm(`Bannear a ${name}? Se eliminarán sus acceso.`)) return
    await fetch(`/api/admin/users/${id}/ban`, { method:'POST' })
    setUsers(prev => prev.map(u => u.id===id ? {...u, is_banned:true} : u))
    showToast(`${name} baneado`)
  }

  const filtered = users.filter(u => 
    !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ color:'rgba(255,255,255,0.3)', padding:40, textAlign:'center' }}>Cargando...</div>

  return (
    <div>
      {toast && <div style={{ position:'fixed',top:20,right:20,background:'#1db954',color:'#fff',padding:'10px 18px',borderRadius:12,fontWeight:600,fontSize:13,zIndex:999 }}>✓ {toast}</div>}
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Buscar usuario..."
        style={{ width:'100%', padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:16, fontFamily:'inherit', outline:'none', marginBottom:16, boxSizing:'border-box' as any }}/>
      <div style={{ marginBottom:12, color:'rgba(255,255,255,0.4)', fontSize:13 }}>{filtered.length} usuarios</div>
      {filtered.slice(0,50).map(u => (
        <div key={u.id} style={{ background: u.is_banned?'rgba(232,52,28,0.06)':'rgba(255,255,255,0.04)', borderRadius:14, padding:'12px 16px', marginBottom:8, border:`1px solid ${u.is_banned?'rgba(232,52,28,0.2)':'rgba(255,255,255,0.07)'}`, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#c0392b,#8e0000)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:14, flexShrink:0 }}>{(u.username||'?')[0].toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14 }}>@{u.username} {u.is_banned && <span style={{ fontSize:11, color:'#e8341c', marginLeft:6 }}>BANEADO</span>}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{u.full_name} · {u.tips_count||0} tips · {u.followers_count||0} seguidores</div>
          </div>
          {!u.is_banned && u.id !== 'd9f0b65f-d7ce-4739-b214-61264bee95ed' && (
            <button onClick={()=>banUser(u.id, u.username)} style={{ padding:'6px 12px', borderRadius:99, background:'rgba(232,52,28,0.12)', color:'#e8341c', border:'1px solid rgba(232,52,28,0.25)', cursor:'pointer', fontFamily:'inherit', fontSize:12, flexShrink:0 }}>Bannear</button>
          )}
        </div>
      ))}
    </div>
  )
}
