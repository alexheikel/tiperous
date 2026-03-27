'use client'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    })
  }

  async function signInWithTwitter() {
    await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: { redirectTo: `${window.location.origin}/` }
    })
  }

  return (
    <div style={{ minHeight:'100dvh', background:'#0c0c0e', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:380 }}>
        <a href="/landing" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:14, marginBottom:32, fontWeight:500 }}>
          ← Volver
        </a>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <img src="/logo-text-v2.png" alt="Tiperous" style={{ height:36, width:"auto", marginBottom:20, display:"block", margin:"0 auto 20px" }}/>
          <h1 style={{ fontFamily:'Georgia,serif', fontWeight:900, fontSize:26, margin:'0 0 8px', color:'#f0f0f2' }}>Bienvenido de vuelta</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15, margin:0 }}>Ingresá a tu cuenta</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <button onClick={signInWithGoogle} style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:12,
            padding:'14px', borderRadius:14,
            background:'#fff', color:'#1a1a1a',
            border:'none', cursor:'pointer', fontFamily:'inherit',
            fontWeight:700, fontSize:16,
            boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
            transition:'transform .15s',
          }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar con Google
          </button>

          <button onClick={signInWithTwitter} style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:12,
            padding:'14px', borderRadius:14,
            background:'#000', color:'#fff',
            border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontFamily:'inherit',
            fontWeight:700, fontSize:16,
            transition:'transform .15s',
          }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.734l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Continuar con X (Twitter)
          </button>
        </div>

        <p style={{ textAlign:'center', marginTop:24, color:'rgba(255,255,255,0.3)', fontSize:13 }}>
          ¿No tenés cuenta? <Link href="/register" style={{ color:'#e8341c', fontWeight:600, textDecoration:'none' }}>Registrarse gratis</Link>
        </p>
      </div>
    </div>
  )
}
