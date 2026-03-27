import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ADMIN_IDS = ['d9f0b65f-d7ce-4739-b214-61264bee95ed']

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  return user && ADMIN_IDS.includes(user.id) ? user : null
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  if (!await checkAdmin(supabase)) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  await supabase.from('tips').delete().eq('id', params.id)
  return NextResponse.json({ ok: true })
}
