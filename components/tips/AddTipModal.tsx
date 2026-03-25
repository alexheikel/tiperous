'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Company, TipType, TipSegment } from '@/types'
import { useAuth } from '@/hooks/useAuth'

const SEGS: { id: TipSegment; label: string; icon: string }[] = [
  { id:'service',  label:'Servicio',   icon:'⚙' },
  { id:'product',  label:'Producto',   icon:'◈' },
  { id:'employee', label:'Empleados',  icon:'◎' },
]

interface Props {
  company:   Company
  onClose:   () => void
  onSuccess: () => void
}

export default function AddTipModal({ company, onClose, onSuccess }: Props) {
  const router      = useRouter()
  const { user }    = useAuth()
  const [type,      setType]    = useState<TipType>('good')
  const [seg,       setSeg]     = useState<TipSegment>('service')
  const [text,      setText]    = useState('')
  const [error,     setError]   = useState('')
  const [loading,   setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!user) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ textAlign:'center', padding:'8px 0' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:22, marginBottom:10 }}>
            Necesitás una cuenta
          </h3>
          <p style={{ color:'var(--muted2)', fontSize:14, marginBottom:24, lineHeight:1.6 }}>
            Para dejar tips tenés que estar registrado. Es gratis y tarda 30 segundos.
          </p>
          <button onClick={() => router.push('/register')} style={redBtn}>
            Crear cuenta gratis
          </button>
          <button onClick={() => router.push('/login')} style={{ ...ghostBtn, marginTop:10 }}>
            Ya tengo cuenta — Ingresar
          </button>
        </div>
      </Overlay>
    )
  }

  if (submitted) {
    return (
      <Overlay onClose={onSuccess}>
        <div style={{ textAlign:'center', padding:'8px 0' }}>
          <div style={{ fontSize:52, marginBottom:12 }}>{type === 'good' ? '🟢' : '🔴'}</div>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:22, marginBottom:8 }}>
            ¡Tip enviado!
          </h3>
          <p style={{ color:'var(--muted2)', fontSize:14, lineHeight:1.6 }}>
            Tu experiencia en <strong style={{ color:'var(--text)' }}>{company.name}</strong> ya está visible para todos.
          </p>
          <button onClick={onSuccess} style={{ ...redBtn, marginTop:24 }}>Listo</button>
        </div>
      </Overlay>
    )
  }

  async function handleSubmit() {
    if (text.trim().length < 3) { setError('El tip debe tener al menos 3 caracteres.'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/tips', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ company_id: company.id, type, segment: seg, text: text.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Error al enviar.'); setLoading(false); return }
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <button onClick={onClose} style={ghostSmall}>✕ Cerrar</button>
        <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:17 }}>{company.name}</span>
        <button onClick={handleSubmit} disabled={loading || text.trim().length < 3} style={{
          background:'none', border:'none', fontFamily:'inherit',
          color: text.trim().length >= 3 ? 'var(--green)' : 'var(--muted)',
          fontWeight:700, fontSize:14, cursor: text.trim().length >= 3 ? 'pointer' : 'default',
          transition:'color 0.15s',
        }}>
          {loading ? '…' : 'Enviar ✓'}
        </button>
      </div>

      {/* Segment tabs */}
      <div style={{ display:'flex', background:'var(--bg)', borderRadius:12, padding:4, gap:4, marginBottom:16 }}>
        {SEGS.map(s => (
          <button key={s.id} onClick={() => setSeg(s.id)} style={{
            flex:1, padding:'9px 0', borderRadius:9, border:'none', cursor:'pointer',
            background: seg === s.id ? 'var(--card2)' : 'transparent',
            color:      seg === s.id ? 'var(--text)'  : 'var(--muted)',
            fontFamily:'inherit', fontWeight:600, fontSize:12,
            transition:'all 0.15s',
            display:'flex', alignItems:'center', justifyContent:'center', gap:5,
          }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={text} onChange={e => setText(e.target.value)}
        placeholder={`Contá tu experiencia con el ${SEGS.find(s=>s.id===seg)?.label.toLowerCase()} de ${company.name}…`}
        rows={4}
        maxLength={500}
        style={{
          width:'100%', padding:'12px 14px', borderRadius:12,
          background:'var(--card)', border:'1px solid var(--border2)',
          color:'var(--text)', fontSize:14, resize:'none', marginBottom:6,
          lineHeight:1.6, fontFamily:'inherit', outline:'none',
        }}
      />
      <div style={{ textAlign:'right', color:'var(--muted)', fontSize:11, marginBottom:14 }}>
        {text.length}/500
      </div>

      {/* Good / Bad */}
      <div style={{ display:'flex', gap:10, marginBottom: error ? 12 : 0 }}>
        {([['good','▲ BUENO','var(--green)','var(--green-dim)','rgba(29,185,84,0.3)'],
           ['bad', '▼ MALO', 'var(--bad)',  'var(--bad-dim)',  'rgba(232,52,28,0.3)']] as const).map(
          ([v, l, col, bg, bdr]) => (
            <button key={v} onClick={() => setType(v as TipType)} style={{
              flex:1, padding:13, borderRadius:14,
              border:`2px solid ${type === v ? bdr : 'var(--border)'}`,
              background: type === v ? bg : 'transparent',
              color: type === v ? col : 'var(--muted)',
              fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer',
              transition:'all 0.18s',
              boxShadow: type === v ? `0 0 20px ${bg}` : 'none',
            }}>
              {l}
            </button>
          )
        )}
      </div>

      {error && (
        <div style={{ marginTop:12, color:'var(--bad)', fontSize:13, padding:'10px 14px',
          background:'var(--bad-dim)', borderRadius:10 }}>
          {error}
        </div>
      )}
    </Overlay>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="animate-fade-in" style={{
      position:'fixed', inset:0,
      background:'rgba(0,0,0,0.8)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'flex-end', zIndex:500,
    }} onClick={onClose}>
      <div className="animate-slide-up" onClick={e => e.stopPropagation()} style={{
        background:'var(--surface)', borderRadius:'24px 24px 0 0',
        padding:'20px 20px 40px', width:'100%', maxWidth:520, margin:'0 auto',
        border:'1px solid var(--border2)', borderBottom:'none',
      }}>
        {/* Handle */}
        <div style={{ width:40, height:4, background:'var(--border2)', borderRadius:99, margin:'0 auto 20px' }}/>
        {children}
      </div>
    </div>
  )
}

const redBtn: React.CSSProperties = {
  display:'block', width:'100%', padding:13, borderRadius:14,
  background:'linear-gradient(135deg,#e8341c,#a82010)',
  color:'#fff', fontWeight:700, fontSize:15, border:'none', cursor:'pointer',
  boxShadow:'0 4px 20px rgba(232,52,28,0.3)',
}
const ghostBtn: React.CSSProperties = {
  display:'block', width:'100%', padding:13, borderRadius:14,
  background:'transparent', border:'1px solid var(--border2)',
  color:'var(--muted2)', fontWeight:600, fontSize:14, cursor:'pointer',
}
const ghostSmall: React.CSSProperties = {
  background:'none', border:'none', color:'var(--muted2)',
  fontFamily:'inherit', fontSize:14, cursor:'pointer',
}
