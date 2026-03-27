'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function BusinessRegisterClient() {
  const router  = useRouter()
  const params  = useSearchParams()
  const { user, profile } = useAuth()
  const [loading,  setLoading]  = useState(false)
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      const res  = await fetch(`/api/companies/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.data?.local || [])
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  async function handleCheckout() {
    if (!user) { router.push('/login'); return }
    setLoading(true)
    const res  = await fetch('/api/stripe/checkout', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ company_id: selected?.id || null }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  if (profile?.is_business) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
      <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:28, marginBottom:10 }}>Ya tenés cuenta Business</h1>
      <p style={{ color:'var(--muted2)', fontSize:15, marginBottom:24 }}>Tu cuenta está verificada y podés responder a tips de tu empresa.</p>
      <button onClick={()=>router.push('/')} style={redBtn}>Ir al inicio</button>
    </div>
  )

  return (
    <div style={{ maxWidth:460, margin:'0 auto' }}>
      <div style={{ background:'linear-gradient(135deg,#180a08,#200e0a)', borderRadius:20, padding:'28px 24px', marginBottom:24, border:'1px solid rgba(232,52,28,0.2)', textAlign:'center' }}>
        <div style={{ fontSize:44, marginBottom:12 }}>🏢</div>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:26, marginBottom:8 }}>Cuenta Business</h1>
        <p style={{ color:'var(--muted2)', fontSize:14, lineHeight:1.7, marginBottom:20 }}>Respondé a los tips de tu empresa, construí tu reputación y mostrá tu lado de la historia.</p>
        <div style={{ display:'inline-flex', alignItems:'baseline', gap:6, fontFamily:'Playfair Display,serif', marginBottom:4 }}>
          <span style={{ fontSize:44, fontWeight:900, color:'var(--red)' }}>$99</span>
          <span style={{ fontSize:16, color:'var(--muted2)' }}>USD de por vida</span>
        </div>
        <div style={{ color:'var(--muted)', fontSize:12 }}>Pago único, sin suscripción</div>
      </div>

      <div style={{ marginBottom:24 }}>
        {[['💬','Respondé a cualquier tip sobre tu empresa'],['🏆','Badge verificado en tu perfil'],['📊','Estadísticas de tu empresa'],['🚫','No podés borrar ni editar tips de usuarios']].map(([icon,text])=>(
          <div key={text as string} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
            <span style={{ color:'var(--muted2)', fontSize:14 }}>{text}</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={{ color:'var(--muted2)', fontSize:11, fontWeight:700, letterSpacing:1, display:'block', marginBottom:8 }}>TU EMPRESA (OPCIONAL)</label>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscá tu empresa..."
          style={{ width:'100%',padding:'12px 14px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:14,outline:'none',fontFamily:'inherit',marginBottom:8 }}/>
        {results.map(c=>(
          <div key={c.id} onClick={()=>{ setSelected(c); setQuery(c.name); setResults([]) }} style={{
            padding:'10px 14px', borderRadius:10, cursor:'pointer',
            background:selected?.id===c.id?'rgba(232,52,28,0.1)':'var(--card)',
            border:`1px solid ${selected?.id===c.id?'rgba(232,52,28,0.3)':'var(--border)'}`,
            marginBottom:6, fontSize:14, color:'var(--text)', transition:'all .15s',
          }}>
            {c.name} <span style={{ color:'var(--muted)', fontSize:12 }}>· {c.category}</span>
          </div>
        ))}
      </div>

      <button onClick={handleCheckout} disabled={loading||!user} style={{ ...redBtn, opacity:(loading||!user)?.7:1, fontSize:16, padding:'15px' }}>
        {loading?'Redirigiendo a Stripe…':!user?'Ingresá para continuar':'Pagar $99 y activar →'}
      </button>
      {!user && (
        <p style={{ textAlign:'center', marginTop:14, color:'var(--muted)', fontSize:13 }}>
          <a href="/login" style={{ color:'var(--red)', fontWeight:600 }}>Ingresá</a> o <a href="/register" style={{ color:'var(--red)', fontWeight:600 }}>creá una cuenta</a>
        </p>
      )}
    </div>
  )
}

const redBtn: React.CSSProperties = { display:'block', width:'100%', padding:14, borderRadius:14, background:'linear-gradient(135deg,#e8341c,#a82010)', color:'#fff', fontWeight:700, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 4px 24px rgba(232,52,28,0.35)' }
