'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const router = useRouter()
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signUpWithEmail(email, password, name)
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:20 }}>
      <div style={{ textAlign:'center', maxWidth:360 }}>
        <div style={{ fontSize:52, marginBottom:16 }}>📬</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:24, marginBottom:12 }}>
          ¡Revisá tu email!
        </h2>
        <p style={{ color:'var(--muted2)', lineHeight:1.6 }}>
          Te enviamos un link de confirmación a <strong style={{ color:'var(--text)' }}>{email}</strong>.
          Hacé click en el link y después podés ingresar.
        </p>
        <Link href="/login" style={{
          display:'inline-block', marginTop:24, color:'var(--red)', fontWeight:700, textDecoration:'none',
        }}>← Ir al login</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            width:56, height:56, borderRadius:16, margin:'0 auto 16px',
            background:'linear-gradient(135deg,#e8341c,#a82010)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
            boxShadow:'0 8px 32px rgba(232,52,28,0.35)',
          }}>★</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:28, marginBottom:6 }}>Crear cuenta</h1>
          <p style={{ color:'var(--muted2)', fontSize:14 }}>Empezá a tipear empresas</p>
        </div>

        <button onClick={()=>{setLoading(true);signInWithGoogle()}} style={{
          width:'100%', padding:13, borderRadius:14,
          background:'var(--card)', border:'1px solid var(--border2)',
          color:'var(--text)', fontFamily:'inherit', fontWeight:600, fontSize:15,
          cursor:'pointer', marginBottom:20,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:'var(--border2)' }}/>
          <span style={{ color:'var(--muted)', fontSize:12 }}>o con email</span>
          <div style={{ flex:1, height:1, background:'var(--border2)' }}/>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input type="text" value={name} onChange={e=>setName(e.target.value)}
            placeholder="Tu nombre" required style={inp}/>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="tu@email.com" required style={inp}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            placeholder="Contraseña (mín. 6 caracteres)" required minLength={6} style={inp}/>

          {error && (
            <div style={{ color:'var(--bad)', fontSize:13, padding:'10px 14px',
              background:'var(--bad-dim)', borderRadius:10 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding:13, borderRadius:14,
            background:'linear-gradient(135deg,#e8341c,#a82010)',
            color:'#fff', fontWeight:700, fontSize:15, border:'none', cursor:'pointer',
            boxShadow:'0 4px 20px rgba(232,52,28,0.3)',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:24, color:'var(--muted)', fontSize:14 }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color:'var(--red)', fontWeight:600, textDecoration:'none' }}>
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = {
  padding:'12px 14px', borderRadius:12,
  background:'var(--card)', border:'1px solid var(--border2)',
  color:'var(--text)', fontFamily:'inherit', fontSize:15, outline:'none',
}
