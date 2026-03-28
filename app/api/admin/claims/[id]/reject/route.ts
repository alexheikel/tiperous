import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'



export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  const { data: ap } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!ap?.is_admin) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  await supabase.from('business_claims').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
