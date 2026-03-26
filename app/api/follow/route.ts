import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { target_id } = await req.json()
  if (!target_id || target_id === user.id) return NextResponse.json({ error:'Invalid' }, { status:400 })
  const { error } = await supabase.from('follows').insert({ follower_id:user.id, following_id:target_id })
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ following: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { target_id } = await req.json()
  const { error } = await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', target_id)
  if (error) return NextResponse.json({ error:error.message }, { status:500 })
  return NextResponse.json({ following: false })
}
