'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router   = useRouter()
  const { user, profile, signOut, loading } = useAuth()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [bio,      setBio]      = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    if (profile) { setFullName(profile.full_name||''); setBio(profile.bio||'') }
  }, [profile])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="animate-spin" style={{ width:32,height:32,border:'2px solid var(--border2)',borderTopColor:'var(--red)',borderRadius:'50%' }}/>
    </div>
  )
  if (!user) { router.push('/login'); return null }

  const initials = (profile?.full_name||profile?.username||user.email||'U')[0].toUpperCase()

  async function handleSave() {
    setSaving(true)
    await supabase.from('profiles').update({ full_name:fullName.trim(), bio:bio.trim() }).eq('id', user!.id)
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false), 2000)
  }

  return (
    <div style={{ maxWidth:480, margin:'0 auto' }}>
      {/* Avatar + public link */}
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{
          width:76, height:76, borderRadius:'50%', margin:'0 auto 14px',
          background:'linear-gradient(135deg,#c0392b,#8e0000)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontFamily:'Playfair Display,serif', fontWeight:900, fontSize:30,
          boxShadow:'0 8px 28px rgba(192,57,43,0.35)',
        }}>{initials}</div>
        <div style={{ fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:20, marginBottom:4 }}>
          {profile?.full_name || profile?.username || 'Tu perfil'}
        </div>
        <div style={{ color:'var(--muted)', fontSize:13, marginBottom:8 }}>{user.email}</div>
        {profile?.username && (
          <Link href={`/u/${profile.username}`} style={{
            color:'var(--red)', fontSize:13, fontWeight:600, textDecoration:'none',
            padding:'5px 14px', borderRadius:99, border:'1px solid rgba(232,52,28,0.3)',
          }}>
            Ver perfil público →
          </Link>
        )}
      </div>

      {/* Form */}
      <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
        <div>
          <label style={{ color:'var(--muted2)', fontSize:11, fontWeight:700, letterSpacing:1, display:'block', marginBottom:6 }}>NOMBRE</label>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Tu nombre completo"
            style={{ width:'100%',padding:'12px 14px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:15,outline:'none' }}/>
        </div>
        <div>
          <label style={{ color:'var(--muted2)', fontSize:11, fontWeight:700, letterSpacing:1, display:'block', marginBottom:6 }}>BIO</label>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Contá algo sobre vos..." rows={3}
            style={{ width:'100%',padding:'12px 14px',borderRadius:12,background:'var(--card)',border:'1px solid var(--border2)',color:'var(--text)',fontSize:14,resize:'none',outline:'none',lineHeight:1.6,fontFamily:'inherit' }}/>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          padding:13,borderRadius:14,background:'linear-gradient(135deg,#e8341c,#a82010)',
          color:'#fff',fontWeight:700,fontSize:15,border:'none',cursor:'pointer',
          opacity:saving?.7:1, boxShadow:'0 4px 20px rgba(232,52,28,0.3)',
        }}>
          {saving?'Guardando…':saved?'✓ Guardado':'Guardar cambios'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ background:'var(--card)',borderRadius:16,padding:18,border:'1px solid var(--border)',marginBottom:20 }}>
        <div style={{ color:'var(--muted2)',fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:14 }}>TU ACTIVIDAD</div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,textAlign:'center' }}>
          {[{ label:'Seguidores', val:profile?.followers_count||0 },
            { label:'Siguiendo',  val:profile?.following_count||0 },
            { label:'Tips',       val:profile?.tips_count||0 }].map(({label,val})=>(
            <div key={label}>
              <div style={{ fontFamily:'Playfair Display,serif',fontWeight:900,fontSize:22 }}>{val}</div>
              <div style={{ color:'var(--muted)',fontSize:12,marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={async()=>{ await signOut(); router.push('/') }} style={{
        width:'100%',padding:13,borderRadius:14,background:'transparent',
        border:'1px solid var(--border2)',color:'var(--muted2)',fontFamily:'inherit',
        fontWeight:600,fontSize:14,cursor:'pointer',
      }}>Cerrar sesión</button>
    </div>
  )
}
