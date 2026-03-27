'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Company } from '@/types'
import AddTipModal from '@/components/tips/AddTipModal'
import { useAuth } from '@/hooks/useAuth'
import { useGeolocation } from '@/hooks/useGeolocation'

export default function TipPage() {
  const router   = useRouter()
  const { user } = useAuth()
  const { coords, fetch: fetchGeo } = useGeolocation()
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState<{ local: Company[]; google: any[] }>({ local:[], google:[] })
  const [searching, setSearching] = useState(false)
  const [selected,  setSelected]  = useState<Company|null>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!query.trim()) { setResults({ local:[], google:[] }); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const url = new URL('/api/companies/search', window.location.origin)
      url.searchParams.set('q', query)
      const savedLoc = localStorage.getItem('tiperous_location')
      const locData = savedLoc ? JSON.parse(savedLoc) : null
      if (locData?.lat) {
        url.searchParams.set('lat', String(locData.lat))
        url.searchParams.set('lng', String(locData.lng))
      } else if (coords) {
        url.searchParams.set('lat', String(coords.lat))
        url.searchParams.set('lng', String(coords.lng))
      }
      const res  = await fetch(url)
      const data = await res.json()
      setResults(data.data || { local:[], google:[] })
      setSearching(false)
    }, 300)
  }, [query, coords])

  async function handleSelect(company: any) {
    if (company._source === 'google') {
      const res  = await fetch('/api/companies', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ google_place_id: company.google_place_id }) })
      const data = await res.json()
      if (data?.data) setSelected(data.data)
      return
    }
    setSelected(company)
  }

  const allResults = [...results.local, ...results.google]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:26, marginBottom:6 }}>
          Dejar un Tip
        </h1>
        <p style={{ color:'var(--muted2)', fontSize:14 }}>
          Buscá la empresa y compartí tu experiencia
        </p>
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:20 }}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="¿En qué empresa estuviste?"
          style={{
            width:'100%', padding:'14px 48px 14px 18px', borderRadius:16,
            background:'var(--card)', border:'1px solid var(--border2)',
            color:'var(--text)', fontSize:16, outline:'none', fontFamily:'inherit',
          }}
        />
        <button onClick={fetchGeo} style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--muted)',fontSize:20 }}>📍</button>
        {searching && (
          <div style={{ position:'absolute',right:46,top:'50%',transform:'translateY(-50%)' }}>
            <div className="animate-spin" style={{ width:18,height:18,border:'2px solid var(--border2)',borderTopColor:'var(--red)',borderRadius:'50%' }}/>
          </div>
        )}
      </div>

      {/* Results */}
      {query.trim() && allResults.length === 0 && !searching && (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
          <div style={{ marginBottom:16 }}>No encontramos "{query}"</div>
        </div>
      )}

      {allResults.map((c: any) => (
        <div key={c.id} onClick={() => handleSelect(c)}
          style={{
            background:'var(--card)', borderRadius:16, padding:'14px 16px',
            marginBottom:10, cursor:'pointer', border:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:14,
            transition:'background .15s, transform .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--card2)'; e.currentTarget.style.transform='translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--card)';  e.currentTarget.style.transform='none' }}
        >
          <div style={{
            width:46, height:46, borderRadius:12, flexShrink:0,
            background: c._source==='google' ? '#222' : 'linear-gradient(135deg,#c0392b,#8e0000)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:20,
          }}>
            {c._source==='google' ? '🔍' : c.name[0]}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:16, marginBottom:2 }}>
              {c.name}
            </div>
            <div style={{ color:'var(--muted)', fontSize:12, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {c._source==='google' ? c.address : `${c.tips_count} tips · ${c.category}${c.city?` · ${c.city}`:''}`}
            </div>
          </div>
          {c._source !== 'google' && (
            <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
              <span style={{ fontSize:14, color:c.score_total>=0?'var(--green)':'var(--bad)' }}>
                {c.score_total>=0?'▲':'▼'}
              </span>
              <span style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:18,
                color:c.score_total>=0?'var(--green)':'var(--bad)' }}>
                {c.score_total>0?'+':''}{c.score_total}
              </span>
            </div>
          )}
          {c._source === 'google' && (
            <span style={{ fontSize:11, color:'var(--muted)', background:'var(--surface)', padding:'4px 8px', borderRadius:99, flexShrink:0 }}>
              + Agregar
            </span>
          )}
        </div>
      ))}

      {/* Empty state — no search */}
      {!query.trim() && (
        <div style={{ textAlign:'center', padding:'48px 0', color:'var(--muted)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>★</div>
          <div style={{ fontSize:16, fontFamily:'Playfair Display,serif', fontWeight:700, marginBottom:8, color:'var(--text)' }}>
            Compartí tu experiencia
          </div>
          <div style={{ fontSize:14, lineHeight:1.6 }}>
            Escribí el nombre de la empresa arriba<br/>para encontrarla y dejar tu tip
          </div>
        </div>
      )}

      {/* Tip modal */}
      {selected && (
        <AddTipModal
          company={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); router.push('/') }}
        />
      )}
    </div>
  )
}
