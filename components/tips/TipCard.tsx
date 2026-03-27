'use client'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Tip } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const SEG_ICON  = { service:'⚙', product:'◈', employee:'◎' }
const SEG_LABEL = { service:'Servicio', product:'Producto', employee:'Empleado' }

const REPORT_REASONS = [
  { id:'offensive',  label:'Contenido ofensivo' },
  { id:'spam',       label:'Spam' },
  { id:'fake',       label:'Información falsa' },
  { id:'harassment', label:'Acoso' },
  { id:'other',      label:'Otro' },
]

interface Comment {
  id:string; tip_id:string; text:string; created_at:string
  is_business_reply?: boolean
  profile: { full_name:string|null; username:string|null; is_business?:boolean; business_name?:string|null } | null
}

export default function TipCard({ tip, delay=0 }: { tip:Tip; delay?:number }) {
  const good    = tip.type === 'good'
  const profile = tip.profile
  const name    = profile?.full_name || profile?.username || 'Anónimo'
  const ago     = formatDistanceToNow(new Date(tip.created_at), { addSuffix:true, locale:es })
  const { user } = useAuth()
  const router   = useRouter()

  const [showComments, setShowComments] = useState(false)
  const [comments,     setComments]     = useState<Comment[]>([])
  const [loaded,       setLoaded]       = useState(false)
  const [newComment,   setNewComment]   = useState('')
  const [posting,      setPosting]      = useState(false)
  const [count,        setCount]        = useState((tip as any).comments_count || 0)
  const [showReport,   setShowReport]   = useState(false)
  const [linkCopied,   setLinkCopied]   = useState(false)
  const [reported,     setReported]     = useState(false)
  const [reportError,  setReportError]  = useState('')
  const [flagged,      setFlagged]      = useState((tip as any).flagged || false)

  async function toggleComments() {
    if (showComments) { setShowComments(false); return }
    if (!loaded) {
      const res  = await fetch(`/api/comments?tip_id=${tip.id}`)
      const data = await res.json()
      setComments(data.data || [])
      setCount(data.data?.length || 0)
      setLoaded(true)
    }
    setShowComments(true)
  }

  async function postComment() {
    if (!user) { router.push('/login'); return }
    if (!newComment.trim()) return
    setPosting(true)
    const res  = await fetch('/api/comments', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ tip_id:tip.id, text:newComment.trim() }),
    })
    const data = await res.json()
    if (data.data) {
      setComments(prev => [...prev, data.data])
      setCount((prev: number) => prev + 1)
      setNewComment('')
    }
    setPosting(false)
  }

  async function submitReport(reason: string) {
    if (!user) { router.push('/login'); return }
    const res  = await fetch('/api/report', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ tip_id:tip.id, reason }),
    })
    const data = await res.json()
    if (res.ok) { setReported(true); setShowReport(false) }
    else setReportError(data.error || 'Error al denunciar.')
  }

  if (flagged) return (
    <div style={{
      background:'var(--card)', borderRadius:14, padding:'12px 14px', marginBottom:10,
      border:'1px solid var(--border)', borderLeft:'3px solid var(--muted)',
      color:'var(--muted)', fontSize:13, fontStyle:'italic',
    }}>
      Este tip fue marcado como inapropiado y está siendo revisado.
    </div>
  )

  return (
    <div className="animate-fade-up" style={{
      animationDelay:`${delay}ms`,
      background:'var(--card)', borderRadius:14, padding:'13px 14px', marginBottom:10,
      border:'1px solid var(--border)',
      borderLeft:`3px solid ${good?'var(--green)':'var(--bad)'}`,
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
        <div style={{
          width:30, height:30, borderRadius:'50%', flexShrink:0,
          background:'linear-gradient(135deg,#c0392b,#8e0000)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontWeight:700, fontSize:12,
        }}>{name[0].toUpperCase()}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <a href={profile?.username ? `/u/${profile.username}` : '#'} onClick={e=>e.stopPropagation()} style={{
            color:'var(--gold)', fontWeight:700, fontSize:12,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            textDecoration:'none', display:'block',
          }}>{name}</a>
          <div style={{ color:'var(--muted)', fontSize:10 }}>{ago}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:99,
            background:good?'var(--green-dim)':'var(--bad-dim)',
            border:`1px solid ${good?'rgba(29,185,84,0.2)':'rgba(232,52,28,0.2)'}`,
          }}>
            <span style={{ fontSize:10 }}>{SEG_ICON[tip.segment]}</span>
            <span style={{ fontSize:10, fontWeight:700, color:good?'var(--green)':'var(--bad)' }}>
              {SEG_LABEL[tip.segment]}
            </span>
          </div>
          {!reported ? (
            <button onClick={()=>setShowReport(!showReport)} title="Denunciar" style={{
              background:'none', border:'none', cursor:'pointer',
              color:'var(--muted)', padding:'2px', borderRadius:4, transition:'color .15s', lineHeight:1,
            }}
              onMouseEnter={e=>(e.currentTarget.style.color='var(--bad)')}
              onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            </button>
          ) : (
            <span style={{ fontSize:10, color:'var(--muted)', fontStyle:'italic' }}>Denunciado</span>
          )}
        </div>
      </div>

      {/* Report dropdown */}
      {showReport && (
        <div style={{ background:'var(--card2)', borderRadius:12, padding:'10px', marginBottom:10, border:'1px solid var(--border2)' }}>
          <div style={{ color:'var(--muted2)', fontSize:11, fontWeight:700, marginBottom:8 }}>¿Por qué denunciás este tip?</div>
          {REPORT_REASONS.map(r => (
            <button key={r.id} onClick={()=>submitReport(r.id)} style={{
              display:'block', width:'100%', padding:'8px 12px', borderRadius:8,
              background:'transparent', border:'none', color:'var(--text)',
              fontFamily:'inherit', fontSize:13, cursor:'pointer', textAlign:'left', transition:'background .12s',
            }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--card)')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
            >{r.label}</button>
          ))}
          {reportError && <div style={{ color:'var(--bad)', fontSize:12, marginTop:6 }}>{reportError}</div>}
          <button onClick={()=>setShowReport(false)} style={{ marginTop:6, background:'none', border:'none', color:'var(--muted)', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
        </div>
      )}

      {/* Product image */}
      {(tip as any).product_image && (
        <img src={(tip as any).product_image} alt={(tip as any).product_title||'Producto'}
          style={{ width:'100%', borderRadius:10, marginBottom:8, maxHeight:160, objectFit:'cover' }}/>
      )}

      {/* Meta */}
      {(tip as any).product_title   && <div style={{ fontSize:12,color:'var(--muted2)',fontWeight:600,marginBottom:4 }}>◈ {(tip as any).product_title}</div>}
      {(tip as any).employee_name   && <div style={{ fontSize:12,color:'var(--muted2)',fontWeight:600,marginBottom:4 }}>◎ {(tip as any).employee_name}</div>}
      {(tip as any).service_location && <div style={{ fontSize:11,color:'var(--muted)',marginBottom:4 }}>📍 {(tip as any).service_location}</div>}

      <p style={{ color:'var(--text)', fontSize:13, lineHeight:1.65, margin:'0 0 10px' }}>{tip.text}</p>

      {/* Actions */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={toggleComments} style={{
          display:'inline-flex', alignItems:'center', gap:5,
          padding:'5px 10px', borderRadius:99,
          background:showComments?'rgba(232,52,28,0.12)':'var(--card2)',
          border:`1px solid ${showComments?'rgba(232,52,28,0.25)':'var(--border)'}`,
          color:showComments?'var(--red)':'var(--muted)',
          fontFamily:'inherit', fontWeight:600, fontSize:12, cursor:'pointer', transition:'all .15s',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={showComments?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {count > 0 ? count : ''}
        </button>
        <button onClick={()=>{
          navigator.clipboard.writeText(`https://tipero.us/t/${tip.id}`)
          setLinkCopied(true)
          setTimeout(()=>setLinkCopied(false), 2000)
        }} style={{
          display:'inline-flex', alignItems:'center', gap:4,
          padding:'5px 10px', borderRadius:99,
          background: linkCopied ? 'rgba(29,185,84,0.12)' : 'transparent',
          border: linkCopied ? '1px solid rgba(29,185,84,0.25)' : 'none',
          color: linkCopied ? 'var(--green)' : 'var(--muted)',
          fontFamily:'inherit', fontSize:11, cursor:'pointer', transition:'all .2s',
        }}>
          {linkCopied ? '✓ copiado' : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          )}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ marginTop:12 }}>
          {comments.length===0 && <div style={{ color:'var(--muted)',fontSize:12,marginBottom:10 }}>Sé el primero en comentar.</div>}
          {comments.map(c => {
            const isBiz = c.is_business_reply || c.profile?.is_business
            const cname = c.profile?.full_name || c.profile?.username || 'Anónimo'
            return (
              <div key={c.id} style={{ display:'flex', gap:8, marginBottom:8 }}>
                <div style={{
                  width:26, height:26, borderRadius:'50%', flexShrink:0,
                  background: isBiz ? 'linear-gradient(135deg,#e8341c,#a82010)' : 'var(--card2)',
                  border:`1px solid ${isBiz?'rgba(232,52,28,0.4)':'var(--border)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: isBiz ? '#fff' : 'var(--muted2)', fontSize:11, fontWeight:700,
                }}>
                  {cname[0].toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{
                    background: isBiz ? 'rgba(232,52,28,0.06)' : 'var(--card2)',
                    borderRadius:10, padding:'7px 10px',
                    border:`1px solid ${isBiz?'rgba(232,52,28,0.2)':'var(--border)'}`,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                      <span style={{ color: isBiz?'var(--red)':'var(--gold)', fontSize:11, fontWeight:700 }}>{cname}</span>
                      {isBiz && (
                        <span style={{
                          fontSize:9, fontWeight:800, letterSpacing:.5,
                          background:'var(--red)', color:'#fff',
                          padding:'2px 6px', borderRadius:99,
                        }}>EMPRESA ✓</span>
                      )}
                    </div>
                    <div style={{ color:'var(--text)', fontSize:12, lineHeight:1.5 }}>{c.text}</div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Input */}
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input value={newComment} onChange={e=>setNewComment(e.target.value.slice(0,280))}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); postComment() } }}
              placeholder={user?'Escribí un comentario…':'Ingresá para comentar'}
              style={{ flex:1,padding:'8px 12px',borderRadius:99,background:'var(--card2)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:12,outline:'none',fontFamily:'inherit' }}
            />
            <button onClick={postComment} disabled={posting||!newComment.trim()} style={{
              width:34, height:34, borderRadius:'50%',
              background:newComment.trim()?'var(--red)':'var(--card2)',
              color:newComment.trim()?'#fff':'var(--muted)',
              border:'none', cursor:newComment.trim()?'pointer':'default',
              fontWeight:700, fontSize:14, transition:'all .15s', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {posting?'…':'↑'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
