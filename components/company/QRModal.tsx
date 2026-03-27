'use client'
import { useEffect, useRef } from 'react'

interface Props {
  companyName: string
  companySlug: string
  onClose: () => void
}

export default function QRModal({ companyName, companySlug, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = `https://tipero.us/c/${companySlug}`

  useEffect(() => {
    import('qrcode').then(QRCode => {
      if (!canvasRef.current) return
      QRCode.toCanvas(canvasRef.current, url, {
        width: 260,
        margin: 2,
        color: { dark: '#1a0a08', light: '#fff8f6' },
        errorCorrectionLevel: 'H',
      })
    })
  }, [url])

  function handlePrint() {
    const canvas = canvasRef.current
    if (!canvas) return
    const qrDataUrl = canvas.toDataURL('image/png')
    const printCanvas = document.createElement('canvas')
    const W = 800, H = 1050
    printCanvas.width = W; printCanvas.height = H
    const ctx = printCanvas.getContext('2d')!
    ctx.fillStyle = '#0c0c0e'; ctx.fillRect(0,0,W,H)
    ctx.fillStyle = '#e8341c'; ctx.fillRect(0,0,W,10); ctx.fillRect(0,H-10,W,10)
    ctx.fillStyle = '#e8341c'; ctx.font = 'bold 60px Georgia,serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('★', W/2, 80)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '400 26px sans-serif'
    ctx.fillText('tipero.us', W/2, 135)
    ctx.strokeStyle = 'rgba(232,52,28,0.3)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(80,165); ctx.lineTo(720,165); ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '300 34px Georgia,serif'
    ctx.fillText('Dejanos tu', W/2, 225)
    ctx.fillStyle = '#e8341c'; ctx.font = 'bold 100px Georgia,serif'
    ctx.fillText('Tip.', W/2, 320)
    ctx.fillStyle = '#fff'
    let fs = 50; ctx.font = `bold ${fs}px Georgia,serif`
    while (ctx.measureText(companyName).width > 680 && fs > 26) { fs-=3; ctx.font = `bold ${fs}px Georgia,serif` }
    ctx.fillText(companyName, W/2, 410)
    const qrSize = 300, qrX = (W-qrSize)/2, qrY = 460
    ctx.fillStyle = '#fff'; ctx.beginPath()
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 20); ctx.fill()
    const qrImg = new Image()
    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrX+10, qrY+10, qrSize-20, qrSize-20)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '400 20px sans-serif'
      ctx.fillText(url, W/2, qrY+qrSize+35)
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '500 26px Georgia,serif'
      ctx.fillText('Escaneá y contanos tu experiencia', W/2, qrY+qrSize+80)
      ctx.fillStyle = 'rgba(232,52,28,0.5)'; ctx.font = '26px Georgia,serif'
      ctx.fillText('★ ★ ★ ★ ★', W/2, qrY+qrSize+125)
      const printUrl = printCanvas.toDataURL('image/png')
      const win = window.open('','_blank')!
      win.document.write(`<html><head><title>QR ${companyName}</title><style>*{margin:0;padding:0}body{background:#000;display:flex;flex-direction:column;align-items:center;padding:20px;font-family:sans-serif}img{max-width:380px;width:100%;border-radius:16px}button{margin:10px;padding:12px 28px;border:none;border-radius:12px;font-size:15px;cursor:pointer}@media print{button{display:none}}</style></head><body><img src="${printUrl}"/><br><button style="background:#e8341c;color:#fff" onclick="window.print()">🖨️ Imprimir</button><button style="background:#333;color:#fff" onclick="const a=document.createElement('a');a.href='${printUrl}';a.download='qr-${companySlug}.png';a.click()">⬇️ Descargar</button></body></html>`)
      win.document.close()
    }
    qrImg.src = qrDataUrl
  }

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:800,padding:20 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#0f0f11',borderRadius:24,padding:28,border:'1px solid rgba(255,255,255,0.1)',width:'100%',maxWidth:340,textAlign:'center' }}>
        <div style={{ fontSize:28,marginBottom:4 }}>★</div>
        <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:18,marginBottom:2 }}>{companyName}</div>
        <div style={{ color:'var(--muted)',fontSize:12,marginBottom:16 }}>Escaneá para dejar un tip</div>
        <div style={{ background:'#fff8f6',borderRadius:14,padding:12,display:'inline-flex',marginBottom:12,boxShadow:'0 4px 20px rgba(232,52,28,0.2)' }}>
          <canvas ref={canvasRef} style={{ display:'block',borderRadius:8 }}/>
        </div>
        <div style={{ color:'var(--muted)',fontSize:11,marginBottom:16,fontFamily:'monospace' }}>{url}</div>
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          <button onClick={handlePrint} style={{ padding:'12px',borderRadius:12,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#e8341c,#a82010)',color:'#fff',fontWeight:700,fontSize:14,fontFamily:'inherit' }}>🖨️ Imprimir cartel</button>
          <button onClick={onClose} style={{ padding:'10px',borderRadius:12,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'var(--muted)',cursor:'pointer',fontFamily:'inherit',fontSize:13 }}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
