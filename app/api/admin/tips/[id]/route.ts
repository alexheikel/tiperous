import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'



async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: ap } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return ap?.is_admin ? user : null
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  if (!await checkAdmin(supabase)) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  await supabase.from('tips').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
