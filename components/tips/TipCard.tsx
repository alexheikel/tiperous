'use client'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Tip } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

const SEG_ICON  = { service:'⚙', product:'◈', employee:'◎' }
const SEG_LABEL = { service:'Servicio', product:'Producto', employee:'Empleado' }

interface Comment {
  id: string
  tip_id: string
  text: string
  created_at: string
  profile: { full_name:string|null; username:string|null } | null
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
  const [loadingCmts,  setLoadingCmts]  = useState(false)
  const [newComment,   setNewComment]   = useState('')
  const [posting,      setPosting]      = useState(false)

  async function loadComments() {
    if (showComments) { setShowComments(false); return }
    setLoadingCmts(true)
    const res  = await fetch(`/api/comments?tip_id=${tip.id}`)
    const data = await res.json()
    setComments(data.data || [])
    setLoadingCmts(false)
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
      setNewComment('')
    }
    setPosting(false)
  }

  const commentsCount = (tip as any).comments_count || 0

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
          <div style={{ color:'var(--gold)', fontWeight:700, fontSize:12,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
          <div style={{ color:'var(--muted)', fontSize:10 }}>{ago}</div>
        </div>
        <div style={{
          display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:99,
          background:good?'var(--green-dim)':'var(--bad-dim)',
          border:`1px solid ${good?'rgba(29,185,84,0.2)':'rgba(232,52,28,0.2)'}`,
          flexShrink:0,
        }}>
          <span style={{ fontSize:10 }}>{SEG_ICON[tip.segment]}</span>
          <span style={{ fontSize:10, fontWeight:700, color:good?'var(--green)':'var(--bad)' }}>
            {SEG_LABEL[tip.segment]}
          </span>
        </div>
      </div>

      {/* Product image */}
      {(tip as any).product_image && (
        <img src={(tip as any).product_image} alt={(tip as any).product_title||'Producto'}
          style={{ width:'100%', borderRadius:10, marginBottom:8, maxHeight:160, objectFit:'cover' }}/>
      )}

      {/* Meta */}
      {(tip as any).product_title && (
        <div style={{ fontSize:12, color:'var(--muted2)', fontWeight:600, marginBottom:4 }}>◈ {(tip as any).product_title}</div>
      )}
      {(tip as any).employee_name && (
        <div style={{ fontSize:12, color:'var(--muted2)', fontWeight:600, marginBottom:4 }}>◎ {(tip as any).employee_name}</div>
      )}
      {(tip as any).service_location && (
        <div style={{ fontSize:11, color:'var(--muted)', marginBottom:4 }}>📍 {(tip as any).service_location}</div>
      )}

      <p style={{ color:'var(--text)', fontSize:13, lineHeight:1.65, margin:'0 0 10px' }}>{tip.text}</p>

      {/* Comments toggle */}
      <button onClick={loadComments} style={{
        background:'none', border:'none', cursor:'pointer',
        color:'var(--muted)', fontSize:12, fontFamily:'inherit',
        display:'flex', alignItems:'center', gap:5, padding:0,
        transition:'color .15s',
      }}
        onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
        onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        {loadingCmts ? 'Cargando…' : showComments ? 'Ocultar' : `${commentsCount > 0 ? commentsCount : ''} Comentar`}
      </button>

      {/* Comments section */}
      {showComments && (
        <div style={{ marginTop:12 }}>
          {comments.length===0 && (
            <div style={{ color:'var(--muted)', fontSize:12, marginBottom:10 }}>Sé el primero en comentar.</div>
          )}
          {comments.map(c => (
            <div key={c.id} style={{ display:'flex', gap:8, marginBottom:10 }}>
              <div style={{
                width:26, height:26, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,#333,#222)',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'var(--muted2)', fontSize:11, fontWeight:700,
              }}>
                {(c.profile?.full_name||c.profile?.username||'?')[0].toUpperCase()}
              </div>
              <div style={{ flex:1, background:'var(--card2)', borderRadius:10, padding:'8px 10px' }}>
                <div style={{ color:'var(--gold)', fontSize:11, fontWeight:700, marginBottom:2 }}>
                  {c.profile?.full_name||c.profile?.username||'Anónimo'}
                </div>
                <div style={{ color:'var(--text)', fontSize:12, lineHeight:1.5 }}>{c.text}</div>
              </div>
            </div>
          ))}

          {/* New comment input */}
          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <input
              value={newComment}
              onChange={e=>setNewComment(e.target.value.slice(0,280))}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); postComment() } }}
              placeholder={user ? 'Escribí un comentario…' : 'Ingresá para comentar'}
              style={{
                flex:1, padding:'8px 12px', borderRadius:99,
                background:'var(--card2)', border:'1px solid var(--border2)',
                color:'var(--text)', fontSize:12, outline:'none', fontFamily:'inherit',
              }}
            />
            <button onClick={postComment} disabled={posting||!newComment.trim()} style={{
              padding:'8px 14px', borderRadius:99,
              background: newComment.trim() ? 'var(--red)' : 'var(--card2)',
              color: newComment.trim() ? '#fff' : 'var(--muted)',
              border:'none', cursor: newComment.trim() ? 'pointer' : 'default',
              fontFamily:'inherit', fontWeight:700, fontSize:12,
              transition:'all .15s', flexShrink:0,
            }}>
              {posting ? '…' : '↑'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
