'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  companyName: string
  companyScore: number
  tipType: 'good' | 'bad'
  tipSegment: 'service' | 'product' | 'employee'
  tipText: string
  userName: string
  onClose: () => void
}

const SEG_LABEL = { service:'el servicio', product:'el producto', employee:'los empleados' }

export default function ShareCard({ companyName, companyScore, tipType, tipSegment, tipText, userName, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgUrl,  setImgUrl]  = useState('')
  const [copied,  setCopied]  = useState(false)
  const good = tipType === 'good'

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r)
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const test = line + w + ' '
      if (ctx.measureText(test).width > maxW && line) { lines.push(line.trim()); line = w + ' ' }
      else line = test
    }
    if (line) lines.push(line.trim())
    return lines
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // Use 4:5 ratio (Instagram portrait) — 1080x1350
    const W = 1080, H = 1350
    canvas.width = W; canvas.height = H

    // Background
    ctx.fillStyle = '#0c0c0e'
    ctx.fillRect(0, 0, W, H)

    // Top bar
    ctx.fillStyle = '#e8341c'
    ctx.fillRect(0, 0, W, 7)

    // ── Logo section ─────────────────────────────
    ctx.fillStyle = '#e8341c'
    ctx.font      = 'bold 56px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('★', 540, 110)

    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font      = '400 26px -apple-system, sans-serif'
    ctx.fillText('tipero.us', 540, 155)

    // ── Divider ───────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth   = 1
    ctx.beginPath(); ctx.moveTo(120, 190); ctx.lineTo(960, 190); ctx.stroke()

    // ── Company name ──────────────────────────────
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'alphabetic'
    let fontSize = 64
    ctx.font = `bold ${fontSize}px Georgia, serif`
    while (ctx.measureText(companyName).width > 880 && fontSize > 36) {
      fontSize -= 4
      ctx.font = `bold ${fontSize}px Georgia, serif`
    }
    ctx.textAlign = 'center'
    ctx.fillText(companyName, 540, 310)

    // ── Score ─────────────────────────────────────
    if (companyScore !== 0) {
      const sc = companyScore > 0 ? '#1db954' : '#e8341c'
      const st = (companyScore > 0 ? '+' : '') + companyScore
      ctx.fillStyle = sc + '20'
      roundRect(ctx, 400, 335, 280, 54, 27); ctx.fill()
      ctx.strokeStyle = sc + '50'; ctx.lineWidth = 1.5
      roundRect(ctx, 400, 335, 280, 54, 27); ctx.stroke()
      ctx.fillStyle = sc
      ctx.font = '600 26px -apple-system, sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`${companyScore > 0 ? '▲' : '▼'} ${st} puntos`, 540, 362)
    }

    // ── Divider ───────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth   = 1
    ctx.beginPath(); ctx.moveTo(120, 420); ctx.lineTo(960, 420); ctx.stroke()

    // ── Action label ──────────────────────────────
    const labelColor = good ? '#1db954' : '#e8341c'
    const labelText  = good
      ? `✓ Recomendó ${SEG_LABEL[tipSegment]}`
      : `✗ No recomendó ${SEG_LABEL[tipSegment]}`
    ctx.fillStyle = labelColor
    ctx.font      = '600 30px -apple-system, sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
    ctx.fillText(labelText, 540, 490)

    // ── Tip text ──────────────────────────────────
    ctx.fillStyle = '#d8d8e4'
    ctx.font      = '400 36px Georgia, serif'
    const lines   = wrapText(ctx, `"${tipText}"`, 840)
    const lineH   = 52
    const totalH  = lines.length * lineH
    let ty        = 570

    for (const l of lines) { ctx.fillText(l, 540, ty); ty += lineH }

    // ── Attribution ───────────────────────────────
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font      = '400 24px -apple-system, sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
    ctx.fillText(`— ${userName}`, 540, 1260)

    // Bottom bar
    ctx.fillStyle = '#e8341c'
    ctx.fillRect(0, H - 7, W, 7)

    setImgUrl(canvas.toDataURL('image/png'))
  }, [])

  const copyText = good
    ? `Recomendé ${SEG_LABEL[tipSegment]} de ${companyName} en @tiperous 🟢 tipero.us`
    : `No recomendé ${SEG_LABEL[tipSegment]} de ${companyName} en @tiperous 🔴 tipero.us`

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(copyText)}`, '_blank')
  }

  function shareInstagram() {
    downloadImage()
    navigator.clipboard.writeText(copyText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 3000) })
  }

  function downloadImage() {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.href = imgUrl; a.download = `tiperous-${companyName.toLowerCase().replace(/\s+/g,'-')}.png`; a.click()
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(8px)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      zIndex:1000, padding:'12px', overflowY:'auto',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:400 }}>
        <canvas ref={canvasRef} style={{ display:'none' }}/>

        <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:20, textAlign:'center', marginBottom:14, color:'#f0f0f2' }}>
          ¡Compartí tu tip!
        </h2>

        {/* Preview — show at smaller size */}
        {imgUrl && (
          <div style={{ borderRadius:12, overflow:'hidden', marginBottom:10, border:'1px solid rgba(255,255,255,0.1)' }}>
            <img src={imgUrl} alt="Share card" style={{ width:'100%', display:'block', maxHeight:'35vh', objectFit:'contain' }}/>
          </div>
        )}

        {/* Copy text */}
        <div style={{
          background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'10px 12px', marginBottom:10,
          border:'1px solid rgba(255,255,255,0.08)', fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.5,
        }}>
          {copyText}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button onClick={shareTwitter} style={{
            padding:'11px', borderRadius:13, border:'none', cursor:'pointer',
            background:'#000', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:13,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.734l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Compartir en X
          </button>
          <button onClick={shareInstagram} style={{
            padding:'11px', borderRadius:13, border:'none', cursor:'pointer',
            background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
            color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:13,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            {copied ? '✓ Imagen descargada!' : 'Compartir en Instagram'}
          </button>
          <button onClick={downloadImage} style={{
            padding:'11px', borderRadius:13, cursor:'pointer',
            background:'transparent', border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(255,255,255,0.4)', fontFamily:'inherit', fontWeight:600, fontSize:13,
          }}>↓ Descargar imagen</button>
          <button onClick={onClose} style={{
            padding:'8px', background:'none', border:'none',
            color:'rgba(255,255,255,0.25)', fontFamily:'inherit', fontSize:12, cursor:'pointer',
          }}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
