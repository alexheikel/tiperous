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
const SEG_ES    = { service:'Servicio', product:'Producto', employee:'Empleado' }

export default function ShareCard({ companyName, companyScore, tipType, tipSegment, tipText, userName, onClose }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const [imgUrl,   setImgUrl]   = useState('')
  const [copied,   setCopied]   = useState(false)
  const good = tipType === 'good'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx    = canvas.getContext('2d')!
    const W = 1080, H = 1080
    canvas.width  = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#0c0c0e'
    ctx.fillRect(0, 0, W, H)

    // Red accent top bar
    ctx.fillStyle = '#e8341c'
    ctx.fillRect(0, 0, W, 8)

    // Subtle grid pattern
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Company initial circle
    const cx = 540, cy = 280, cr = 90
    const grad = ctx.createRadialGradient(cx-20, cy-20, 10, cx, cy, cr)
    grad.addColorStop(0, '#c0392b')
    grad.addColorStop(1, '#8e0000')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, cr, 0, Math.PI * 2)
    ctx.fill()

    // Company initial letter
    ctx.fillStyle = '#fff'
    ctx.font      = 'bold 80px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(companyName[0].toUpperCase(), cx, cy)

    // Company name
    ctx.fillStyle = '#f0f0f2'
    ctx.font      = 'bold 52px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(companyName, 540, 430)

    // Score badge
    const scoreColor = companyScore >= 0 ? '#1db954' : '#e8341c'
    const scoreText  = (companyScore > 0 ? '+' : '') + companyScore
    const arrow      = companyScore >= 0 ? '▲' : '▼'
    ctx.fillStyle = scoreColor + '22'
    roundRect(ctx, 390, 450, 300, 70, 35)
    ctx.fill()
    ctx.strokeStyle = scoreColor + '55'
    ctx.lineWidth   = 2
    roundRect(ctx, 390, 450, 300, 70, 35)
    ctx.stroke()
    ctx.fillStyle    = scoreColor
    ctx.font         = 'bold 36px Georgia, serif'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${arrow} ${scoreText} overall`, 540, 485)

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth   = 1
    ctx.beginPath(); ctx.moveTo(100, 555); ctx.lineTo(980, 555); ctx.stroke()

    // Tip action text
    const action = good
      ? `✓ Recomendó ${SEG_LABEL[tipSegment]}`
      : `✗ No recomendó ${SEG_LABEL[tipSegment]}`
    ctx.fillStyle = good ? '#1db954' : '#e8341c'
    ctx.font      = '500 32px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(action, 540, 610)

    // Tip text (wrapped)
    ctx.fillStyle = '#c0c0cc'
    ctx.font      = '400 30px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    const words   = `"${tipText}"`.split(' ')
    let line = '', y = 670, lineH = 44
    for (const word of words) {
      const test = line + word + ' '
      if (ctx.measureText(test).width > 800 && line !== '') {
        ctx.fillText(line.trim(), 540, y)
        line = word + ' '; y += lineH
      } else { line = test }
    }
    if (line) ctx.fillText(line.trim(), 540, y)

    // User
    ctx.fillStyle = '#6e6e7a'
    ctx.font      = '400 24px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`— ${userName} en Tiperous`, 540, 900)

    // Logo / branding
    ctx.fillStyle = '#e8341c'
    ctx.font      = 'bold 28px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('★ tipero.us', 540, 960)

    // Red accent bottom bar
    ctx.fillStyle = '#e8341c'
    ctx.fillRect(0, H - 8, W, 8)

    setImgUrl(canvas.toDataURL('image/png'))
  }, [])

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const copyText = good
    ? `Recomendé ${SEG_LABEL[tipSegment]} de ${companyName} en @tiperous 🟢 tipero.us`
    : `No recomendé ${SEG_LABEL[tipSegment]} de ${companyName} en @tiperous 🔴 tipero.us`

  function shareTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(copyText)}`, '_blank')
  }

  function shareInstagram() {
    // Download image for Instagram (no direct API)
    downloadImage()
    navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  function downloadImage() {
    if (!imgUrl) return
    const a    = document.createElement('a')
    a.href     = imgUrl
    a.download = `tiperous-${companyName.toLowerCase().replace(/\s+/g,'-')}.png`
    a.click()
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(8px)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      zIndex:600, padding:20,
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:460 }}>
        <canvas ref={canvasRef} style={{ display:'none' }}/>

        <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:22, textAlign:'center', marginBottom:16 }}>
          ¡Compartí tu tip!
        </h2>

        {/* Preview */}
        {imgUrl && (
          <div style={{ borderRadius:16, overflow:'hidden', marginBottom:16, border:'1px solid var(--border2)' }}>
            <img src={imgUrl} alt="Share card" style={{ width:'100%', display:'block' }}/>
          </div>
        )}

        {/* Copy text preview */}
        <div style={{
          background:'var(--card)', borderRadius:12, padding:'12px 14px', marginBottom:16,
          border:'1px solid var(--border2)', fontSize:13, color:'var(--muted2)', lineHeight:1.5,
        }}>
          {copyText}
        </div>

        {/* Share buttons */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={shareTwitter} style={{
            padding:'13px', borderRadius:14, border:'none', cursor:'pointer',
            background:'#000', color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:15,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.734l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Compartir en X (Twitter)
          </button>

          <button onClick={shareInstagram} style={{
            padding:'13px', borderRadius:14, border:'none', cursor:'pointer',
            background:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)',
            color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:15,
            display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            {copied ? '✓ Imagen descargada + texto copiado!' : 'Compartir en Instagram'}
          </button>

          <button onClick={downloadImage} style={{
            padding:'12px', borderRadius:14, cursor:'pointer',
            background:'transparent', border:'1px solid var(--border2)',
            color:'var(--muted2)', fontFamily:'inherit', fontWeight:600, fontSize:14,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}>
            ↓ Descargar imagen
          </button>
        </div>

        <button onClick={onClose} style={{
          width:'100%', marginTop:10, padding:'10px', background:'none', border:'none',
          color:'var(--muted)', fontFamily:'inherit', fontSize:13, cursor:'pointer',
        }}>Cerrar</button>
      </div>
    </div>
  )
}
