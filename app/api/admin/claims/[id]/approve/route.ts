import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

const ADMIN_IDS = ['d9f0b65f-d7ce-4739-b214-61264bee95ed']

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_IDS.includes(user.id)) return NextResponse.json({ error:'Forbidden' }, { status:403 })
  const admin = createAdminClient()
  const { data: claim } = await admin.from('business_claims').select('profile_id,company_id').eq('id', params.id).single()
  if (claim) {
    await admin.from('business_claims').update({ verified:true }).eq('id', params.id)
    await admin.from('profiles').update({ is_business:true, business_verified:true }).eq('id', claim.profile_id)
  }
  return NextResponse.json({ ok: true })
}
