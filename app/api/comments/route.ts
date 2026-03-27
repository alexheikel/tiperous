import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const tip_id = req.nextUrl.searchParams.get('tip_id')
  if (!tip_id) return NextResponse.json({ error:'tip_id required' }, { status:400 })
  const supabase = createClient()
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('tip_id', tip_id)
    .order('created_at', { ascending:true })
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  if (!comments?.length) return NextResponse.json({ data:[] })

  // Fetch profiles with business status
  const userIds = [...new Set(comments.map(c => c.user_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, is_business, business_name')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles||[]).map(p=>[p.id,p]))
  const data = comments.map(c => ({ ...c, profile: profileMap[c.user_id] || null }))
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { tip_id, text } = await req.json()
  if (!tip_id || !text?.trim()) return NextResponse.json({ error:'tip_id and text required' }, { status:400 })
  if (text.trim().length > 280) return NextResponse.json({ error:'Máximo 280 caracteres' }, { status:400 })

  // Check if business user
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_business, business_name, full_name, username, avatar_url')
    .eq('id', user.id).single()

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      tip_id,
      user_id: user.id,
      text: text.trim(),
      is_business_reply: profile?.is_business || false,
    })
    .select('*').single()

  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ data: { ...comment, profile } }, { status:201 })
}
