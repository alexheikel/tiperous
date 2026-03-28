import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'



export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: ap } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!user || !ap?.is_admin) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  await supabase.from('tips').update({ flagged:false, reports_count:0 }).eq('id', params.id)
  await supabase.from('reports').delete().eq('tip_id', params.id)
  return NextResponse.json({ ok: true })
}
