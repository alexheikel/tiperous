'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Company } from '@/types'
import CompanyCard from './CompanyCard'
import AddTipModal from '../tips/AddTipModal'
import { useAuth } from '@/hooks/useAuth'
import type { LocationState } from '@/types/location'

interface Props { initialCompanies: Company[] }

export default function ExploreClient({ initialCompanies }: Props) {
  const router   = useRouter()
  const params   = useSearchParams()
  const { user } = useAuth()

  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState<{ local:Company[]; google:any[] }>({ local:initialCompanies, google:[] })
  const [searching,  setSearching]  = useState(false)
  const [tipTarget,  setTipTarget]  = useState<Company|null>(null)
  const [sortChrono, setSortChrono] = useState(false)
  const [location,   setLocation]   = useState<LocationState|null>(null)
  const [nearby,     setNearby]     = useState<Company[]>([])
  const [showNearby, setShowNearby] = useState(false)
  const debounceRef  = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (params.get('tip')==='1' && initialCompanies.length>0) setTipTarget(initialCompanies[0])
  }, [])

  // Listen to location changes from AppShell
  useEffect(() => {
    const saved = localStorage.getItem('tiperous_location')
    if (saved) { try { setLocation(JSON.parse(saved)) } catch {} }

    const handler = (e: any) => setLocation(e.detail)
    window.addEventListener('locationChange', handler)
    return () => window.removeEventListener('locationChange', handler)
  }, [])

  // Load companies based on location
  useEffect(() => {
    if (query.trim()) return
    async function loadCompanies() {
      const url = new URL('/api/companies', window.location.origin)
      if (location?.lat && location?.lng) {
        // Load nearby companies for the selected city
        url.searchParams.set('nearby', '1')
        url.searchParams.set('lat', String(location.lat))
        url.searchParams.set('lng', String(location.lng))
        const res  = await fetch(url)
        const data = await res.json()
        setNearby(data.data || [])
        // // setShowNearby(true) - disabled auto - disabled auto
      }
      // Also load companies for this country
      const url2 = new URL('/api/companies', window.location.origin)
      if (location?.countryCode && location.countryCode !== 'ALL') {
        url2.searchParams.set('country', location.countryCode)
      }
      const res2  = await fetch(url2)
      const data2 = await res2.json()
      setResults({ local: data2.data || [], google: [] })
    }
    loadCompanies()
  }, [location])

  // Search
  useEffect(() => {
    if (!query.trim()) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const url = new URL('/api/companies/search', window.location.origin)
      url.searchParams.set('q', query)
      if (location?.lat) { url.searchParams.set('lat', String(location.lat)); url.searchParams.set('lng', String(location.lng!)) }
      const res  = await fetch(url)
      const data = await res.json()
      setResults(data.data || { local:[], google:[] })
      setSearching(false)
    }, 350)
  }, [query, location])

  const filtered = results.local
  const sorted   = sortChrono
    ? [...filtered].sort((a,b)=>new Date((b as any).created_at||0).getTime()-new Date((a as any).created_at||0).getTime())
    : [...filtered].sort((a,b)=>b.score_total-a.score_total)
  const best  = sorted.filter(c=>c.score_total>0).slice(0,6)
  const worst = [...filtered].sort((a,b)=>a.score_total-b.score_total).filter(c=>c.score_total<0).slice(0,6)

  function handleCompanyClick(company: any) {
    if (company._source==='google') {
      fetch('/api/companies', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ google_place_id:company.google_place_id }) })
        .then(r=>r.json()).then(({ data }) => { if (data?.id) router.push(`/c/${data.slug||data.id}`) })
      return
    }
    router.push((company as any).slug ? `/c/${(company as any).slug}` : `/company/${company.id}`)
  }

  return (
    <div>
      {/* Search bar */}
      <div style={{ position:'relative', marginBottom:12 }}>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar empresas o lugares…"
          style={{ width:'100%',padding:'12px 16px',borderRadius:14,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:15,outline:'none',fontFamily:'inherit' }}/>
        {searching && <div style={{ position:'absolute',right:16,top:'50%',transform:'translateY(-50%)' }}>
          <div className="animate-spin" style={{ width:16,height:16,border:'2px solid var(--border2)',borderTopColor:'var(--red)',borderRadius:'50%' }}/>
        </div>}
      </div>

      {/* Sort toggle */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        <button onClick={()=>setSortChrono(!sortChrono)} style={{
          padding:'6px 12px', borderRadius:99, fontFamily:'inherit', fontWeight:600, fontSize:12, cursor:'pointer',
          background: sortChrono ? 'var(--red)' : 'var(--card)',
          color: sortChrono ? '#fff' : 'var(--muted2)',
          border:`1px solid ${sortChrono?'var(--red)':'var(--border2)'}`,
          transition:'all .15s',
        }}>
          {sortChrono ? '🕐 Recientes' : '⭐ Top score'}
        </button>
      </div>

      {query.trim() ? (
        <div>
          {results.local.length>0 && <div style={{ marginBottom:20 }}>
            <SLabel>En Tiperous</SLabel>
            {results.local.map((c,i)=><CompanyCard key={c.id} company={c} delay={i*30} onClick={()=>handleCompanyClick(c)}/>)}
          </div>}
          {results.google.length>0 && <div>
            <SLabel>Google Places <span style={{ color:'var(--muted)',fontWeight:400 }}>— click para agregar</span></SLabel>
            {results.google.map(c=>(
              <div key={c.id} onClick={()=>handleCompanyClick(c)} style={{ background:'var(--card)',borderRadius:16,padding:'14px 16px',marginBottom:10,cursor:'pointer',border:'1px solid var(--border)',display:'flex',alignItems:'center',gap:14,transition:'background .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--card2)')}
                onMouseLeave={e=>(e.currentTarget.style.background='var(--card)')}>
                <div style={{ width:42,height:42,borderRadius:10,flexShrink:0,background:'#222',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>🔍</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:15 }}>{c.name}</div>
                  <div style={{ color:'var(--muted)',fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.address}</div>
                </div>
                <span style={{ fontSize:11,color:'var(--muted)',background:'var(--surface)',padding:'4px 8px',borderRadius:99 }}>+ Agregar</span>
              </div>
            ))}
          </div>}
          {!results.local.length&&!results.google.length&&!searching&&(
            <div style={{ textAlign:'center',padding:'60px 0',color:'var(--muted)' }}>No encontramos "{query}"</div>
          )}
        </div>
      ) : (
        <>
          {/* Nearby section based on selected city */}
          {showNearby && nearby.length>0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <SLabel>📍 Cerca de {location?.city}</SLabel>
                <button onClick={()=>setShowNearby(false)} style={{ background:'none',border:'none',color:'var(--muted)',fontSize:12,cursor:'pointer' }}>Ocultar</button>
              </div>
              {nearby.map((c,i)=><CompanyCard key={c.id} company={c} delay={i*25} onClick={()=>handleCompanyClick(c)}/>)}
              <div style={{ height:1,background:'var(--border)',margin:'16px 0' }}/>
            </div>
          )}

          {/* Stats */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20 }}>
            {[
              { label:'Empresas',    val:filtered.length,                                         color:'var(--text)' },
              { label:'Buenos Tips', val:filtered.reduce((s,c)=>s+Math.max(0,c.score_total),0),  color:'var(--green)' },
              { label:'Malos Tips',  val:filtered.reduce((s,c)=>s+Math.max(0,-c.score_total),0), color:'var(--bad)' },
            ].map(({label,val,color},i)=>(
              <div key={label} className="animate-fade-up" style={{ animationDelay:`${i*60}ms`,background:'var(--card)',borderRadius:14,padding:'14px 10px',border:'1px solid var(--border)',textAlign:'center' }}>
                <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:24,color }}>{val}</div>
                <div style={{ color:'var(--muted)',fontSize:11,marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>

          {!sortChrono && (best.length>0||worst.length>0) && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20 }}>
              <div>
                <SLabel color="var(--green)">▲ Mejores</SLabel>
                <div style={{ overflowY:'auto',maxHeight:360 }}>
                  {best.map((c,i)=><ScoreCol key={c.id} c={c} i={i} color="var(--green)" onClick={()=>handleCompanyClick(c)}/>)}
                </div>
              </div>
              <div>
                <SLabel color="var(--bad)">▼ Peores</SLabel>
                <div style={{ overflowY:'auto',maxHeight:360 }}>
                  {worst.map((c,i)=><ScoreCol key={c.id} c={c} i={i} color="var(--bad)" onClick={()=>handleCompanyClick(c)}/>)}
                </div>
              </div>
            </div>
          )}

          <SLabel>Todas las empresas</SLabel>
          {sorted.map((c,i)=><CompanyCard key={c.id} company={c} rank={i+1} delay={i*20} onClick={()=>handleCompanyClick(c)}/>)}
          {filtered.length===0 && (
            <div style={{ textAlign:'center',padding:'60px 0',color:'var(--muted)' }}>
              <div style={{ fontSize:40,marginBottom:12 }}>🏢</div>
              <div style={{ fontSize:16,marginBottom:8 }}>No hay empresas todavía.</div>
              <div style={{ fontSize:14 }}>¡Buscá una y sé el primero en tipear!</div>
            </div>
          )}
        </>
      )}
      {tipTarget && <AddTipModal company={tipTarget} onClose={()=>setTipTarget(null)} onSuccess={()=>setTipTarget(null)}/>}
    </div>
  )
}

function SLabel({ children, color }: { children:React.ReactNode; color?:string }) {
  return <div style={{ color:color||'var(--muted2)',fontWeight:700,fontSize:11,letterSpacing:1,marginBottom:10,textTransform:'uppercase' }}>{children}</div>
}
function ScoreCol({ c, i, color, onClick }: { c:Company; i:number; color:string; onClick:()=>void }) {
  const segs = [
    { key:'score_service',  icon:'⚙', label:'Serv'  },
    { key:'score_product',  icon:'◈', label:'Prod'  },
    { key:'score_employee', icon:'◎', label:'Emp'   },
  ]
  return (
    <div onClick={onClick} style={{ background:'var(--card)',borderRadius:13,padding:'12px',marginBottom:8,cursor:'pointer',border:'1px solid var(--border)',borderTop:`2px solid ${color}`,transition:'background .15s' }}
      onMouseEnter={e=>(e.currentTarget.style.background='var(--card2)')}
      onMouseLeave={e=>(e.currentTarget.style.background='var(--card)')}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <div style={{ color:'var(--text)',fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',flex:1,marginRight:8 }}>{i+1}. {c.name}</div>
        <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:18,color,flexShrink:0 }}>{c.score_total>0?'+':''}{c.score_total}</div>
      </div>
      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
        {segs.map(({ key, icon, label }) => {
          const v = (c as any)[key] as number || 0
          return (
            <div key={key} style={{
              display:'flex', alignItems:'center', gap:3,
              padding:'3px 7px', borderRadius:99, fontSize:10,
              background: v>0?'var(--green-dim)':v<0?'var(--bad-dim)':'rgba(255,255,255,0.04)',
              border:`1px solid ${v>0?'rgba(29,185,84,0.2)':v<0?'rgba(232,52,28,0.2)':'var(--border)'}`,
            }}>
              <span style={{ color:'var(--muted)' }}>{icon}</span>
              <span style={{ fontWeight:700, color:v>0?'var(--green)':v<0?'var(--bad)':'var(--muted2)' }}>{v>0?'+':''}{v}</span>
              <span style={{ color:'var(--muted)' }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
