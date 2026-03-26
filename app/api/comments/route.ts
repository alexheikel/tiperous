import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const tip_id = req.nextUrl.searchParams.get('tip_id')
  if (!tip_id) return NextResponse.json({ error:'tip_id required' }, { status:400 })
  const supabase = createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*, profile:profiles!comments_user_id_fkey(id, username, full_name, avatar_url)')
    .eq('tip_id', tip_id)
    .order('created_at', { ascending:true })
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { tip_id, text } = await req.json()
  if (!tip_id || !text?.trim()) return NextResponse.json({ error:'tip_id and text required' }, { status:400 })
  if (text.trim().length > 280) return NextResponse.json({ error:'Máximo 280 caracteres' }, { status:400 })
  const { data, error } = await supabase
    .from('comments')
    .insert({ tip_id, user_id:user.id, text:text.trim() })
    .select('*, profile:profiles!comments_user_id_fkey(id, username, full_name, avatar_url)')
    .single()
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ data }, { status:201 })
}
