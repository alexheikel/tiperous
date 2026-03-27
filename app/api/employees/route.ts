import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const company_id = req.nextUrl.searchParams.get('company_id')
  if (!company_id) return NextResponse.json({ error:'company_id required' }, { status:400 })
  const supabase = createClient()
  const { data } = await supabase.from('employees').select('*').eq('company_id', company_id).order('name')
  return NextResponse.json({ data: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { company_id, name, role } = await req.json()
  if (!company_id || !name?.trim()) return NextResponse.json({ error:'company_id and name required' }, { status:400 })
  const { data, error } = await supabase.from('employees')
    .upsert({ company_id, name:name.trim(), role:role?.trim()||null }, { onConflict:'company_id,name' })
    .select().single()
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ data })
}
