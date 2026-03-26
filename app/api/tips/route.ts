import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const company_id = searchParams.get('company_id')
  const limit      = parseInt(searchParams.get('limit')||'20')
  const supabase   = createClient()
  let query = supabase.from('tips').select('*, profile:profiles(id, username, full_name, avatar_url)').order('created_at',{ascending:false}).limit(limit)
  if (company_id) query = query.eq('company_id', company_id)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status:500 })
  return NextResponse.json({ data })
}
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status:401 })
  const body = await req.json()
  const { company_id, type, segment, text } = body
  if (!company_id) return NextResponse.json({ error: 'company_id required' }, { status:400 })
  if (!['good','bad'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status:400 })
  if (!['service','product','employee'].includes(segment)) return NextResponse.json({ error: 'Invalid segment' }, { status:400 })
  if (!text||text.trim().length<3) return NextResponse.json({ error: 'Text too short' }, { status:400 })
  if (text.trim().length>500) return NextResponse.json({ error: 'Text too long' }, { status:400 })
  const { data, error } = await supabase.from('tips')
    .insert({ company_id, user_id:user.id, type, segment, text:text.trim() })
    .select('*, profile:profiles(id, username, full_name, avatar_url)').single()
  if (error) {
    if (error.code==='23505') return NextResponse.json({ error:'Ya dejaste un tip similar hoy.' }, { status:409 })
    return NextResponse.json({ error: error.message }, { status:500 })
  }
  return NextResponse.json({ data }, { status:201 })
}
