'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function BusinessSuccessPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    setTimeout(() => router.push('/'), 4000)
  }, [])

  return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:64, marginBottom:20 }}>🎉</div>
      <h1 style={{ fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:30, marginBottom:12 }}>
        ¡Bienvenido a Tiperous Business!
      </h1>
      <p style={{ color:'var(--muted2)', fontSize:15, lineHeight:1.7, marginBottom:8 }}>
        Tu cuenta fue verificada. Ya podés responder a los tips de tu empresa.
      </p>
      <p style={{ color:'var(--muted)', fontSize:13 }}>
        Redirigiendo al inicio en unos segundos…
      </p>
    </div>
  )
}
