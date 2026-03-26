'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const router   = useRouter()
  const { user, profile, signOut, loading } = useAuth()
  const supabase = createClient()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio,      setBio]      = useState(profile?.bio || '')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="animate-spin" style={{ width:32, height:32, border:'2px solid var(--border2)', borderTopColor:'var(--red)', borderRadius:'50%' }}/>
    </div>
  )

  if (!user) {
    router.push('/login')
    return null
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: fullName.trim(),
      bio:       bio.trim(),
    }).eq('id', user!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  const initials = (profile?.full_name || profile?.username || user.email || 'U')
    .split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ maxWidth:480, margin:'0 auto' }}>
      {/* Avatar */}
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{
          width:80, height:80, borderRadius:'50%', margin:'0 auto 16px',
          background:'linear-gradient(135deg,#c0392b,#8e0000)',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontFamily:'var(--font-display)', fontWeight:900, fontSize:32,
          boxShadow:'0 8px 32px rgba(192,57,43,0.35)',
        }}>{initials}</div>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:22 }}>
          {profile?.full_name || profile?.username || 'Tu perfil'}
        </div>
        <div style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>{user.email}</div>
      </div>

      {/* Form */}
      <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
        <div>
          <label style={{ color:'var(--muted2)', fontSize:12, fontWeight:600, letterSpacing:1, display:'block', marginBottom:6 }}>
            NOMBRE
          </label>
          <input value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Tu nombre completo"
            style={{
              width:'100%', padding:'12px 14px', borderRadius:12,
              background:'var(--card)', border:'1px solid var(--border2)',
              color:'var(--text)', fontFamily:'inherit', fontSize:15, outline:'none',
            }}
          />
        </div>
        <div>
          <label style={{ color:'var(--muted2)', fontSize:12, fontWeight:600, letterSpacing:1, display:'block', marginBottom:6 }}>
            BIO
          </label>
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            placeholder="Contá algo sobre vos..."
            rows={3}
            style={{
              width:'100%', padding:'12px 14px', borderRadius:12,
              background:'var(--card)', border:'1px solid var(--border2)',
              color:'var(--text)', fontFamily:'inherit', fontSize:15,
              resize:'none', outline:'none', lineHeight:1.6,
            }}
          />
        </div>

        <button onClick={handleSave} disabled={saving} style={{
          padding:'13px', borderRadius:14,
          background:'linear-gradient(135deg,#e8341c,#a82010)',
          color:'#fff', fontFamily:'inherit', fontWeight:700, fontSize:15,
          border:'none', cursor:'pointer',
          boxShadow:'0 4px 20px rgba(232,52,28,0.3)',
          opacity: saving ? 0.7 : 1,
          transition:'opacity 0.15s',
        }}>
          {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {/* Stats */}
      <div style={{
        background:'var(--card)', borderRadius:16, padding:20,
        border:'1px solid var(--border)', marginBottom:24,
      }}>
        <div style={{ color:'var(--muted2)', fontSize:12, fontWeight:700, letterSpacing:1, marginBottom:16 }}>
          TU ACTIVIDAD
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, textAlign:'center' }}>
          {[
            { label:'Tips dados', val: '—' },
            { label:'Empresas',   val: '—' },
            { label:'Likes',      val: '—' },
          ].map(({ label, val }) => (
            <div key={label}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:900, fontSize:24, color:'var(--text)' }}>{val}</div>
              <div style={{ color:'var(--muted)', fontSize:12, marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button onClick={handleSignOut} style={{
        width:'100%', padding:'13px', borderRadius:14,
        background:'transparent', border:'1px solid var(--border2)',
        color:'var(--muted2)', fontFamily:'inherit', fontWeight:600,
        fontSize:14, cursor:'pointer', transition:'all 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--bad)'; e.currentTarget.style.color = 'var(--bad)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--muted2)' }}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
