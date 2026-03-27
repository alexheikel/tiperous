'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Props {
  stats: { tips:number; companies:number; users:number }
  topCompanies: any[]
  recentTips: any[]
}

const SEG_LABEL = { service:'Servicio', product:'Producto', employee:'Empleado' }

export default function LandingClient({ stats, topCompanies, recentTips }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div style={{ minHeight:'100dvh', background:'#0c0c0e', color:'#f0f0f2', fontFamily:'system-ui,-apple-system,sans-serif', overflowX:'hidden' }}>

      {/* Nav */}
      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(12,12,14,0.85)',backdropFilter:'blur(24px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <Link href="/" style={{ textDecoration:'none' }}>
          <img src="/logo-text-v2.png" alt="Tiperous" style={{ height:36,width:'auto' }}/>
        </Link>
        <div style={{ display:'flex',gap:10,alignItems:'center' }}>
          <Link href="/login" style={{ padding:'8px 16px',borderRadius:99,color:'rgba(255,255,255,0.6)',textDecoration:'none',fontSize:14,fontWeight:600 }}>
            Ingresar
          </Link>
          <Link href="/register" style={{ padding:'8px 20px',borderRadius:99,background:'#e8341c',color:'#fff',textDecoration:'none',fontSize:14,fontWeight:700,boxShadow:'0 4px 16px rgba(232,52,28,0.35)' }}>
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding:'140px 24px 80px',textAlign:'center',maxWidth:720,margin:'0 auto',position:'relative' }}>
        {/* Glow */}
        <div style={{ position:'absolute',top:80,left:'50%',transform:'translateX(-50%)',width:600,height:400,background:'radial-gradient(ellipse,rgba(232,52,28,0.12),transparent 70%)',pointerEvents:'none' }}/>

        <div style={{ display:'inline-flex',alignItems:'center',gap:8,background:'rgba(232,52,28,0.1)',border:'1px solid rgba(232,52,28,0.25)',borderRadius:99,padding:'6px 14px',marginBottom:28,fontSize:13,color:'rgba(232,52,28,0.9)',fontWeight:600 }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'#e8341c',display:'inline-block',animation:'pulse 2s infinite' }}/>
          {stats.tips.toLocaleString()} tips en vivo
        </div>

        <h1 style={{ fontFamily:'Georgia,"Playfair Display",serif',fontWeight:900,fontSize:'clamp(36px,6vw,68px)',lineHeight:1.1,margin:'0 0 20px',letterSpacing:-2 }}>
          Simple app para<br/>
          <span style={{ color:'#e8341c' }}>TIPEAR</span> una empresa
        </h1>

        <p style={{ fontSize:'clamp(16px,2.5vw,20px)',color:'rgba(255,255,255,0.55)',lineHeight:1.7,margin:'0 auto 36px',maxWidth:500 }}>
          Contale a tu comunidad cómo fue el Servicio, Producto o los Empleados de una empresa. Dales un tip.
        </p>

        <div style={{ display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:60 }}>
          <Link href="/register" style={{ padding:'14px 32px',borderRadius:99,background:'#e8341c',color:'#fff',textDecoration:'none',fontSize:16,fontWeight:700,boxShadow:'0 6px 24px rgba(232,52,28,0.4)',transition:'transform .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.03)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
          >
            ★ Dejar mi primer tip
          </Link>
          <Link href="/" style={{ padding:'14px 28px',borderRadius:99,background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.7)',textDecoration:'none',fontSize:16,fontWeight:600,border:'1px solid rgba(255,255,255,0.1)' }}>
            Explorar empresas →
          </Link>
        </div>

        {/* 3D Phone mockup */}
        <div style={{ perspective:1200, margin:'0 auto 52px', width:320, height:520 }}>
          <div style={{
            width:250, height:500, margin:'0 auto',
            transform:'rotateY(-18deg) rotateX(6deg)',
            transformStyle:'preserve-3d', overflow:'visible',
            transition:'transform .6s ease',
          }}
            onMouseEnter={e=>(e.currentTarget.style.transform='rotateY(-8deg) rotateX(3deg)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='rotateY(-18deg) rotateX(6deg)')}
          >
            {/* Phone shell */}
            <div style={{ width:250, height:500, borderRadius:44, background:'#18181b', border:'8px solid #27272a', boxShadow:'20px 20px 60px rgba(0,0,0,0.7), -4px -4px 20px rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,255,255,0.06)', position:'relative', overflow:'hidden' }}>

              {/* Dynamic island */}
              <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', width:80, height:22, borderRadius:14, background:'#000', zIndex:10 }}/>

              {/* Screen content */}
              <div style={{ width:'100%', height:'100%', background:'#0c0c0e', display:'flex', flexDirection:'column', overflow:'hidden' }}>

                {/* Status */}
                <div style={{ padding:'14px 20px 6px', display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:600, flexShrink:0 }}>
                  <span>9:41</span>
                  <span>●●●</span>
                </div>

                {/* Header */}
                <div style={{ padding:'6px 14px 8px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
                  <span style={{ color:'#e8341c', fontSize:14, fontWeight:800, fontFamily:'Georgia,serif' }}>Tiperous.</span>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'3px 8px', fontSize:9, color:'rgba(255,255,255,0.6)' }}>📍 ASU</div>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#c0392b,#8e0000)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:700 }}>A</div>
                  </div>
                </div>

                {/* Search bar */}
                <div style={{ padding:'8px 12px 6px', flexShrink:0 }}>
                  <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'6px 10px', fontSize:10, color:'rgba(255,255,255,0.3)' }}>Buscar empresas...</div>
                </div>

                {/* Stats row */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, padding:'0 12px 8px', flexShrink:0 }}>
                  {[['9','Empresas','#f0f0f2'],['4','Buenos','#1db954'],['6','Malos','#e8341c']].map(([val,label,color])=>(
                    <div key={label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'6px 4px', textAlign:'center' }}>
                      <div style={{ fontSize:13, fontWeight:800, color, fontFamily:'Georgia,serif' }}>{val}</div>
                      <div style={{ fontSize:8, color:'rgba(255,255,255,0.35)', marginTop:1 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Best/worst labels */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, padding:'0 12px 4px', flexShrink:0 }}>
                  <div style={{ fontSize:9, color:'#1db954', fontWeight:700 }}>▲ MEJORES</div>
                  <div style={{ fontSize:9, color:'#e8341c', fontWeight:700 }}>▼ PEORES</div>
                </div>

                {/* Company cards */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, padding:'0 12px', flex:1, overflow:'hidden' }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {[['Bayres Pizza','+1',true],['La Vienesa','+4',true],['Mercado Libre','+3',true]].map(([n,s,g])=>(
                      <div key={n as string} style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'6px 8px', borderLeft:`2px solid ${g?'#1db954':'#e8341c'}` }}>
                        <div style={{ fontSize:9, fontWeight:700, color:'#f0f0f2', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n}</div>
                        <div style={{ fontSize:11, fontWeight:800, color:'#1db954' }}>{s}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {[['Tigo','-3',false],['Personal','-3',false],['Bank of Am.','-4',false]].map(([n,s,g])=>(
                      <div key={n as string} style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'6px 8px', borderLeft:`2px solid ${g?'#1db954':'#e8341c'}` }}>
                        <div style={{ fontSize:9, fontWeight:700, color:'#f0f0f2', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n}</div>
                        <div style={{ fontSize:11, fontWeight:800, color:'#e8341c' }}>{s}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom nav */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'8px 0 14px', borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(12,12,14,0.9)', flexShrink:0 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    <div style={{ width:16, height:16, borderRadius:8, border:'1.5px solid #e8341c' }}/>
                    <span style={{ fontSize:8, color:'#e8341c', fontWeight:600 }}>Explore</span>
                  </div>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'#e8341c', display:'flex', alignItems:'center', justifyContent:'center', marginTop:-16, boxShadow:'0 4px 16px rgba(232,52,28,0.6)' }}>
                    <span style={{ color:'#fff', fontSize:16 }}>★</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    <div style={{ width:16, height:16, borderRadius:8, border:'1.5px solid rgba(255,255,255,0.2)' }}/>
                    <span style={{ fontSize:8, color:'rgba(255,255,255,0.35)', fontWeight:600 }}>Timeline</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex',gap:40,justifyContent:'center',flexWrap:'wrap' }}>
          {[
            { val:stats.users.toLocaleString(),    label:'Usuarios' },
            { val:stats.companies.toLocaleString(), label:'Empresas' },
            { val:stats.tips.toLocaleString(),      label:'Tips' },
          ].map(s=>(
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Georgia,serif',fontWeight:900,fontSize:32,color:'#fff',letterSpacing:-1 }}>{s.val}</div>
              <div style={{ fontSize:13,color:'rgba(255,255,255,0.4)',marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding:'60px 24px',maxWidth:900,margin:'0 auto' }}>
        <h2 style={{ fontFamily:'Georgia,serif',fontWeight:900,fontSize:32,textAlign:'center',marginBottom:12,letterSpacing:-1 }}>¿Cómo funciona?</h2>
        <p style={{ textAlign:'center',color:'rgba(255,255,255,0.4)',fontSize:15,marginBottom:48 }}>Simple, rápido y honesto</p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20 }}>
          {[
            { icon:'🔍', title:'Buscá la empresa', desc:'Encontrá cualquier empresa, restaurante, tienda o servicio en tu ciudad.' },
            { icon:'★',  title:'Dejá tu tip', desc:'Contá tu experiencia sobre el servicio, un producto o un empleado. Máximo 140 caracteres.' },
            { icon:'📊', title:'Sumá al score', desc:'Tu tip suma o resta al score de la empresa. La comunidad decide la reputación.' },
            { icon:'🏆', title:'Subí de nivel', desc:'Cuantos más tips dejás, más sube tu nivel. De Curioso a Leyenda.' },
          ].map((s,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.04)',borderRadius:20,padding:'24px 20px',border:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize:36,marginBottom:14 }}>{s.icon}</div>
              <div style={{ fontFamily:'Georgia,serif',fontWeight:700,fontSize:18,marginBottom:8 }}>{s.title}</div>
              <div style={{ color:'rgba(255,255,255,0.45)',fontSize:14,lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Top companies */}
      {topCompanies.length > 0 && (
        <section style={{ padding:'60px 24px',maxWidth:900,margin:'0 auto' }}>
          <h2 style={{ fontFamily:'Georgia,serif',fontWeight:900,fontSize:32,textAlign:'center',marginBottom:12,letterSpacing:-1 }}>Mejores empresas</h2>
          <p style={{ textAlign:'center',color:'rgba(255,255,255,0.4)',fontSize:15,marginBottom:40 }}>Las más recomendadas por la comunidad</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12 }}>
            {topCompanies.map(c=>(
              <Link key={c.slug||c.name} href={c.slug?`/c/${c.slug}`:'/'}  style={{ textDecoration:'none' }}>
                <div style={{ background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'16px 18px',border:'1px solid rgba(255,255,255,0.07)',borderLeft:`3px solid ${c.score_total>=0?'#1db954':'#e8341c'}`,transition:'background .15s',cursor:'pointer' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
                >
                  <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:10 }}>
                    <div style={{ width:40,height:40,borderRadius:11,background:'linear-gradient(135deg,#c0392b,#8e0000)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'Georgia,serif',fontWeight:900,fontSize:18,flexShrink:0 }}>
                      {c.name[0]}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:700,fontSize:15,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#f0f0f2' }}>{c.name}</div>
                      <div style={{ fontSize:12,color:'rgba(255,255,255,0.4)' }}>{c.category}{c.city&&` · ${c.city}`}</div>
                    </div>
                    <div style={{ fontFamily:'Georgia,serif',fontWeight:900,fontSize:22,color:c.score_total>=0?'#1db954':'#e8341c',flexShrink:0 }}>
                      {c.score_total>0?'+':''}{c.score_total}
                    </div>
                  </div>
                  <div style={{ display:'flex',gap:6 }}>
                    {[['⚙',c.score_service,'Serv'],['◈',c.score_product,'Prod'],['◎',c.score_employee,'Emp']].map(([icon,val,label])=>(
                      <div key={label as string} style={{ display:'flex',alignItems:'center',gap:3,padding:'3px 8px',borderRadius:99,fontSize:11,background:(val as number)>0?'rgba(29,185,84,0.1)':(val as number)<0?'rgba(232,52,28,0.1)':'rgba(255,255,255,0.04)',border:`1px solid ${(val as number)>0?'rgba(29,185,84,0.2)':(val as number)<0?'rgba(232,52,28,0.2)':'rgba(255,255,255,0.06)'}` }}>
                        <span style={{ color:'rgba(255,255,255,0.4)' }}>{icon}</span>
                        <span style={{ fontWeight:700,color:(val as number)>0?'#1db954':(val as number)<0?'#e8341c':'rgba(255,255,255,0.4)' }}>{(val as number)>0?'+':''}{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign:'center',marginTop:24 }}>
            <Link href="/" style={{ color:'#e8341c',fontWeight:600,fontSize:14,textDecoration:'none' }}>Ver todas las empresas →</Link>
          </div>
        </section>
      )}

      {/* Recent tips */}
      {recentTips.length > 0 && (
        <section style={{ padding:'60px 24px',maxWidth:900,margin:'0 auto' }}>
          <h2 style={{ fontFamily:'Georgia,serif',fontWeight:900,fontSize:32,textAlign:'center',marginBottom:12,letterSpacing:-1 }}>Tips recientes</h2>
          <p style={{ textAlign:'center',color:'rgba(255,255,255,0.4)',fontSize:15,marginBottom:40 }}>Lo que dice la comunidad ahora mismo</p>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12 }}>
            {recentTips.slice(0,6).map((t,i)=>{
              const good = t.type==='good'
              const company = t.company as any
              return (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(255,255,255,0.07)',borderLeft:`3px solid ${good?'#1db954':'#e8341c'}` }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                    <span style={{ fontSize:11,fontWeight:700,color:good?'#1db954':'#e8341c' }}>{good?'▲ Bueno':'▼ Malo'} · {(SEG_LABEL as any)[t.segment]}</span>
                    {company?.name && <span style={{ fontSize:11,color:'rgba(255,255,255,0.35)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:100 }}>{company.name}</span>}
                  </div>
                  <p style={{ color:'rgba(255,255,255,0.75)',fontSize:13,lineHeight:1.6,margin:0 }}>"{t.text}"</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Business CTA */}
      <section style={{ padding:'60px 24px',maxWidth:700,margin:'0 auto',textAlign:'center' }}>
        <div style={{ background:'linear-gradient(135deg,rgba(232,52,28,0.1),rgba(168,32,16,0.05))',border:'1px solid rgba(232,52,28,0.2)',borderRadius:24,padding:'48px 32px' }}>
          <div style={{ fontSize:48,marginBottom:16 }}>🏢</div>
          <h2 style={{ fontFamily:'Georgia,serif',fontWeight:900,fontSize:28,marginBottom:12,letterSpacing:-1 }}>¿Tenés un negocio?</h2>
          <p style={{ color:'rgba(255,255,255,0.5)',fontSize:15,lineHeight:1.7,marginBottom:28,maxWidth:400,margin:'0 auto 28px' }}>
            Respondé a los tips, construí tu reputación y mostrá tu lado de la historia. Pago único $99 USD.
          </p>
          <Link href="/business/register" style={{ display:'inline-block',padding:'13px 28px',borderRadius:99,background:'#e8341c',color:'#fff',textDecoration:'none',fontSize:15,fontWeight:700,boxShadow:'0 4px 20px rgba(232,52,28,0.35)' }}>
            Activar cuenta Business →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding:'40px 24px',borderTop:'1px solid rgba(255,255,255,0.06)',textAlign:'center',color:'rgba(255,255,255,0.25)',fontSize:13 }}>
        <div style={{ marginBottom:16 }}>
          <img src="/logo-text-v2.png" alt="Tiperous" style={{ height:28,opacity:.5 }}/>
        </div>
        <div style={{ display:'flex',justifyContent:'center',gap:24,marginBottom:16,flexWrap:'wrap' }}>
          {[['Explorar','/'],[' Timeline','/timeline'],['Para empresas','/business/register'],['Ingresar','/login']].map(([label,href])=>(
            <Link key={href} href={href} style={{ color:'rgba(255,255,255,0.35)',textDecoration:'none',fontSize:13 }}>{label}</Link>
          ))}
        </div>
        <div>© {new Date().getFullYear()} Tiperous. La voz de tu comunidad.</div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1}
          50%{opacity:.4}
        }
      `}</style>
    </div>
  )
}
