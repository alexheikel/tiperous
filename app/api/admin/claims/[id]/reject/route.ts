import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_IDS = ['d9f0b65f-d7ce-4739-b214-61264bee95ed']

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_IDS.includes(user.id)) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  await supabase.from('business_claims').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
