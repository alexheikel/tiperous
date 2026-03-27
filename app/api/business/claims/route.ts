import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: [] })
  const { data } = await supabase
    .from('business_claims')
    .select('company_id, company:companies(id, name, slug)')
    .eq('profile_id', user.id)
    .eq('verified', true)
  return NextResponse.json({ data: data || [] })
}
