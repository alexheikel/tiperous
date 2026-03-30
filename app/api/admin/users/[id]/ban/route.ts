import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: ap } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return ap?.is_admin ? user : null
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  if (!await checkAdmin(supabase)) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  const admin = createAdminClient()
  await admin.from('profiles').update({ is_banned: true }).eq('id', params.id)
  await admin.auth.admin.deleteUser(params.id)
  return NextResponse.json({ ok: true })
}
