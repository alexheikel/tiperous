import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/')
  return (
    <div style={{ minHeight:'100dvh', background:'#0a0a0c', color:'#f0f0f2', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#e8341c', padding:'10px 24px', display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontWeight:900, fontSize:18 }}>★ Tiperous Admin</span>
        <a href="/" style={{ marginLeft:'auto', color:'rgba(255,255,255,0.7)', fontSize:13, textDecoration:'none' }}>← Volver al sitio</a>
      </div>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 18px' }}>{children}</div>
    </div>
  )
}
