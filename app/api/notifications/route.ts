import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: [] })
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)
  return NextResponse.json({ data: data || [] })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { id } = await req.json()
  if (id) {
    await supabase.from('notifications').update({ read:true }).eq('id', id).eq('user_id', user.id)
  } else {
    await supabase.from('notifications').update({ read:true }).eq('user_id', user.id)
  }
  return NextResponse.json({ ok: true })
}
