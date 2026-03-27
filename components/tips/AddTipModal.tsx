'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Company, TipType, TipSegment } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import ShareCard from '@/components/tips/ShareCard'

const SEGS: { id:TipSegment; label:string; icon:string }[] = [
  { id:'service',  label:'Servicio',  icon:'⚙' },
  { id:'product',  label:'Producto',  icon:'◈' },
  { id:'employee', label:'Empleados', icon:'◎' },
]
const MAX = 140

interface Entity { id:string; name:string; role?:string }
interface Props { company:Company; onClose:()=>void; onSuccess:()=>void }

export default function AddTipModal({ company, onClose, onSuccess }: Props) {
  const router   = useRouter()
  const { user } = useAuth()
  const [type,       setType]       = useState<TipType>('good')
  const [seg,        setSeg]        = useState<TipSegment>('service')
  const [text,       setText]       = useState('')
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [showShare,  setShowShare]  = useState(false)
  const [tipId, setTipId] = useState<string|null>(null)

  // Entity search
  const [entities,      setEntities]      = useState<Entity[]>([])
  const [entitySearch,  setEntitySearch]  = useState('')
  const [selectedEntity, setSelectedEntity] = useState<Entity|null>(null)
  const [showDropdown,  setShowDropdown]  = useState(false)
  const [prodTitle,     setProdTitle]     = useState('')
  const [prodImg,       setProdImg]       = useState<File|null>(null)
  const [prodImgPreview, setProdImgPreview] = useState('')
  const [location,      setLocation]      = useState('')
  const [uploading,     setUploading]     = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Load existing entities when segment changes
  useEffect(() => {
    if (seg === 'service') return
    const endpoint = seg === 'employee' ? 'employees' : 'products'
    fetch(`/api/${endpoint}?company_id=${company.id}`)
      .then(r=>r.json())
      .then(d => setEntities(d.data || []))
    setEntitySearch(''); setSelectedEntity(null)
  }, [seg, company.id])

  const filtered = entitySearch.trim()
    ? entities.filter(e => e.name.toLowerCase().includes(entitySearch.toLowerCase()))
    : entities

  const canCreate = entitySearch.trim().length > 1 &&
    !entities.find(e => e.name.toLowerCase() === entitySearch.toLowerCase())

  async function selectOrCreate(name: string) {
    const endpoint = seg === 'employee' ? 'employees' : 'products'
    const existing = entities.find(e => e.name.toLowerCase() === name.toLowerCase())
    if (existing) { setSelectedEntity(existing); setEntitySearch(existing.name); setShowDropdown(false); return }
    const res  = await fetch(`/api/${endpoint}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ company_id:company.id, name:name.trim() }) })
    const data = await res.json()
    if (data.data) {
      setSelectedEntity(data.data)
      setEntities(prev => [...prev, data.data])
      setEntitySearch(data.data.name)
      setShowDropdown(false)
    }
  }

  async function uploadImage(file: File): Promise<string|null> {
    const formData = new FormData(); formData.append('file', file)
    const res  = await fetch('/api/upload', { method:'POST', body:formData })
    const data = await res.json()
    return data.url || null
  }

  async function handleSubmit() {
    if (text.trim().length < 3) { setError('El tip debe tener al menos 3 caracteres.'); return }
    if (text.trim().length > MAX) { setError(`Máximo ${MAX} caracteres.`); return }
    setLoading(true); setError('')

    let prodImgUrl: string|null = null
    if (seg==='product' && prodImg) { setUploading(true); prodImgUrl = await uploadImage(prodImg); setUploading(false) }

    const res = await fetch('/api/tips', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        company_id: company.id, type, segment:seg, text:text.trim(),
        employee_name: seg==='employee' ? (selectedEntity?.name || entitySearch.trim() || null) : null,
        employee_id:   seg==='employee' ? selectedEntity?.id || null : null,
        product_title: seg==='product'  ? (selectedEntity?.name || entitySearch.trim() || prodTitle.trim() || null) : null,
        product_id:    seg==='product'  ? selectedEntity?.id || null : null,
        product_image: seg==='product'  ? prodImgUrl : null,
        service_location: seg==='service' ? location.trim()||null : null,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error||'Error al enviar.'); setLoading(false); return }
    setTipId(data?.data?.id || null); setSubmitted(true); setLoading(false); setShowShare(true)
  }

  if (!user) return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign:'center',padding:'8px 0' }}>
        <div style={{ fontSize:40,marginBottom:16 }}>🔒</div>
        <h3 style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:22,marginBottom:10 }}>Necesitás una cuenta</h3>
        <p style={{ color:'var(--muted2)',fontSize:14,marginBottom:24,lineHeight:1.6 }}>Para dejar tips tenés que estar registrado.</p>
        <button onClick={()=>router.push('/register')} style={redBtn}>Crear cuenta gratis</button>
        <button onClick={()=>router.push('/login')} style={{ ...ghostBtn,marginTop:10 }}>Ya tengo cuenta</button>
      </div>
    </Overlay>
  )

  if (submitted) return (
    <>
      <Overlay onClose={onSuccess}>
        <div style={{ textAlign:'center',padding:'8px 0' }}>
          <div style={{ fontSize:52,marginBottom:12 }}>{type==='good'?'🟢':'🔴'}</div>
          <h3 style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:22,marginBottom:8 }}>¡Tip enviado!</h3>
          <p style={{ color:'var(--muted2)',fontSize:14,lineHeight:1.6 }}>Tu experiencia en <strong style={{ color:'var(--text)' }}>{company.name}</strong> ya es visible.</p>
          <button onClick={()=>setShowShare(true)} style={{ ...redBtn,marginTop:20 }}>📲 Compartir en redes</button>
          <button onClick={onSuccess} style={{ ...ghostBtn,marginTop:10 }}>Listo</button>
        </div>
      </Overlay>
      {showShare && <ShareCard companyName={company.name} companyScore={company.score_total} tipType={type} tipSegment={seg} tipText={text} userName={user?.email?.split('@')[0]||'Anónimo'} tipId={tipId||undefined} onClose={()=>setShowShare(false)}/>}
    </>
  )

  const charsLeft  = MAX - text.length
  const charsColor = charsLeft < 20 ? 'var(--bad)' : charsLeft < 40 ? 'var(--gold)' : 'var(--muted)'

  return (
    <Overlay onClose={onClose}>
      {/* Header */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <button onClick={onClose} style={{ background:'none',border:'none',color:'var(--muted2)',fontFamily:'inherit',fontSize:14,cursor:'pointer' }}>✕ Cerrar</button>
        <span style={{ fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:17 }}>{company.name}</span>
        <button onClick={handleSubmit} disabled={loading||text.trim().length<3} style={{ background:'none',border:'none',fontFamily:'inherit',color:text.trim().length>=3?'var(--green)':'var(--muted)',fontWeight:700,fontSize:14,cursor:text.trim().length>=3?'pointer':'default',transition:'color .15s' }}>
          {loading?(uploading?'Subiendo…':'Enviando…'):'Enviar ✓'}
        </button>
      </div>

      {/* Segment tabs */}
      <div style={{ display:'flex',background:'var(--bg)',borderRadius:12,padding:4,gap:4,marginBottom:16 }}>
        {SEGS.map(s=>(
          <button key={s.id} onClick={()=>setSeg(s.id)} style={{ flex:1,padding:'9px 0',borderRadius:9,border:'none',cursor:'pointer',background:seg===s.id?'var(--card2)':'transparent',color:seg===s.id?'var(--text)':'var(--muted)',fontFamily:'inherit',fontWeight:600,fontSize:12,transition:'all .15s',display:'flex',alignItems:'center',justifyContent:'center',gap:5 }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Employee search/select */}
      {seg==='employee' && (
        <div style={{ marginBottom:12, position:'relative' }}>
          <label style={{ color:'var(--muted2)',fontSize:11,fontWeight:700,letterSpacing:1,display:'block',marginBottom:6 }}>EMPLEADO</label>
          <input
            value={entitySearch}
            onChange={e=>{ setEntitySearch(e.target.value); setSelectedEntity(null); setShowDropdown(true) }}
            onFocus={()=>setShowDropdown(true)}
            placeholder={entities.length>0 ? `Buscar entre ${entities.length} empleados o agregar nuevo…` : 'Nombre del empleado (opcional)'}
            style={{ ...inputStyle, borderColor: selectedEntity?'rgba(29,185,84,0.4)':'var(--border2)' }}
          />
          {showDropdown && (filtered.length>0 || canCreate) && (
            <div style={{ position:'absolute',top:'100%',left:0,right:0,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:12,zIndex:10,overflow:'hidden',marginTop:4,boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
              {filtered.map(e=>(
                <button key={e.id} onClick={()=>selectOrCreate(e.name)} style={{ display:'block',width:'100%',padding:'10px 14px',background:'transparent',border:'none',color:'var(--text)',fontFamily:'inherit',fontSize:14,cursor:'pointer',textAlign:'left',transition:'background .12s' }}
                  onMouseEnter={el=>(el.currentTarget.style.background='var(--card)')}
                  onMouseLeave={el=>(el.currentTarget.style.background='transparent')}
                >
                  <span style={{ marginRight:8 }}>◎</span>{e.name}
                </button>
              ))}
              {canCreate && (
                <button onClick={()=>selectOrCreate(entitySearch)} style={{ display:'block',width:'100%',padding:'10px 14px',background:'rgba(232,52,28,0.08)',border:'none',borderTop:'1px solid var(--border)',color:'var(--red)',fontFamily:'inherit',fontSize:14,cursor:'pointer',textAlign:'left',fontWeight:700 }}>
                  + Agregar "{entitySearch}"
                </button>
              )}
            </div>
          )}
          {selectedEntity && <div style={{ marginTop:4,fontSize:11,color:'var(--green)' }}>✓ {selectedEntity.name} seleccionado</div>}
        </div>
      )}

      {/* Product search/select */}
      {seg==='product' && (
        <div style={{ marginBottom:12, position:'relative' }}>
          <label style={{ color:'var(--muted2)',fontSize:11,fontWeight:700,letterSpacing:1,display:'block',marginBottom:6 }}>PRODUCTO</label>
          <input
            value={entitySearch}
            onChange={e=>{ setEntitySearch(e.target.value); setSelectedEntity(null); setShowDropdown(true) }}
            onFocus={()=>setShowDropdown(true)}
            placeholder={entities.length>0 ? `Buscar entre ${entities.length} productos o agregar nuevo…` : 'Nombre del producto (opcional)'}
            style={{ ...inputStyle, borderColor: selectedEntity?'rgba(29,185,84,0.4)':'var(--border2)' }}
          />
          {showDropdown && (filtered.length>0 || canCreate) && (
            <div style={{ position:'absolute',top:'100%',left:0,right:0,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:12,zIndex:10,overflow:'hidden',marginTop:4,boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
              {filtered.map(e=>(
                <button key={e.id} onClick={()=>selectOrCreate(e.name)} style={{ display:'block',width:'100%',padding:'10px 14px',background:'transparent',border:'none',color:'var(--text)',fontFamily:'inherit',fontSize:14,cursor:'pointer',textAlign:'left',transition:'background .12s' }}
                  onMouseEnter={el=>(el.currentTarget.style.background='var(--card)')}
                  onMouseLeave={el=>(el.currentTarget.style.background='transparent')}
                >
                  <span style={{ marginRight:8 }}>◈</span>{e.name}
                </button>
              ))}
              {canCreate && (
                <button onClick={()=>selectOrCreate(entitySearch)} style={{ display:'block',width:'100%',padding:'10px 14px',background:'rgba(232,52,28,0.08)',border:'none',borderTop:'1px solid var(--border)',color:'var(--red)',fontFamily:'inherit',fontSize:14,cursor:'pointer',textAlign:'left',fontWeight:700 }}>
                  + Agregar "{entitySearch}"
                </button>
              )}
            </div>
          )}
          {selectedEntity && <div style={{ marginTop:4,fontSize:11,color:'var(--green)' }}>✓ {selectedEntity.name} seleccionado</div>}

          {/* Image upload */}
          <label style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border2)',cursor:'pointer',color:'var(--muted)',fontSize:13,marginTop:8 }}>
            {prodImgPreview
              ? <img src={prodImgPreview} alt="" style={{ width:44,height:44,borderRadius:8,objectFit:'cover' }}/>
              : <div style={{ width:44,height:44,borderRadius:8,background:'var(--card2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20 }}>📷</div>
            }
            <span>{prodImgPreview?'Cambiar imagen':'Agregar imagen (opcional)'}</span>
            <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f){setProdImg(f);setProdImgPreview(URL.createObjectURL(f))} }} style={{ display:'none' }}/>
          </label>
        </div>
      )}

      {/* Service location */}
      {seg==='service' && (
        <input value={location} onChange={e=>setLocation(e.target.value)}
          placeholder="Ubicación o URL del servicio (opcional)"
          style={{ ...inputStyle,marginBottom:12 }}/>
      )}

      {/* Text */}
      <div style={{ position:'relative' }}>
        <textarea value={text} onChange={e=>setText(e.target.value.slice(0,MAX))}
          placeholder={`Contá tu experiencia${selectedEntity?` con ${selectedEntity.name}`:''}…`}
          rows={3} maxLength={MAX}
          style={{ width:'100%',padding:'12px 14px',borderRadius:12,background:'var(--card)',border:`1px solid ${charsLeft<10?'var(--bad)':'var(--border2)'}`,color:'var(--text)',fontSize:16,resize:'none',marginBottom:4,lineHeight:1.6,fontFamily:'inherit',outline:'none' }}
          onClick={()=>setShowDropdown(false)}
        />
        <div style={{ textAlign:'right',marginBottom:14 }}>
          <span style={{ fontSize:12,color:charsColor,fontWeight:600 }}>{charsLeft}</span>
        </div>
      </div>

      {/* Good / Bad */}
      <div style={{ display:'flex',gap:10 }}>
        {(['good','bad'] as TipType[]).map(v=>(
          <button key={v} onClick={()=>setType(v)} style={{
            flex:1,padding:13,borderRadius:14,fontFamily:'inherit',fontWeight:800,fontSize:15,cursor:'pointer',transition:'all .18s',
            border:`2px solid ${type===v?(v==='good'?'rgba(29,185,84,0.3)':'rgba(232,52,28,0.3)'):'var(--border)'}`,
            background:type===v?(v==='good'?'var(--green-dim)':'var(--bad-dim)'):'transparent',
            color:type===v?(v==='good'?'var(--green)':'var(--bad)'):'var(--muted)',
          }}>{v==='good'?'▲ BUENO':'▼ MALO'}</button>
        ))}
      </div>

      {error && <div style={{ marginTop:12,color:'var(--bad)',fontSize:13,padding:'10px 14px',background:'var(--bad-dim)',borderRadius:10 }}>{error}</div>}
    </Overlay>
  )
}

function Overlay({ children, onClose }: { children:React.ReactNode; onClose:()=>void }) {
  return (
    <div className="animate-fade-in" style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(4px)',display:'flex',alignItems:'flex-end',zIndex:500 }} onClick={onClose}>
      <div className="animate-slide-up" onClick={e=>e.stopPropagation()} style={{ background:'var(--surface)',borderRadius:'24px 24px 0 0',padding:'20px 20px 40px',width:'100%',maxWidth:520,margin:'0 auto',border:'1px solid var(--border2)',borderBottom:'none',maxHeight:'90dvh',overflowY:'auto' }}>
        <div style={{ width:40,height:4,background:'var(--border2)',borderRadius:99,margin:'0 auto 20px' }}/>
        {children}
      </div>
    </div>
  )
}

const redBtn:    React.CSSProperties = { display:'block',width:'100%',padding:13,borderRadius:14,background:'linear-gradient(135deg,#e8341c,#a82010)',color:'#fff',fontWeight:700,fontSize:15,border:'none',cursor:'pointer' }
const ghostBtn:  React.CSSProperties = { display:'block',width:'100%',padding:13,borderRadius:14,background:'transparent',border:'1px solid var(--border2)',color:'var(--muted2)',fontWeight:600,fontSize:14,cursor:'pointer' }
const inputStyle: React.CSSProperties = { width:'100%',padding:'11px 14px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:16,outline:'none',fontFamily:'inherit' }
