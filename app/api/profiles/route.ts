import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all')
  if (all === '1') {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('id,username,full_name,tips_count,followers_count,is_banned').order('created_at', { ascending:false }).limit(500)
    return NextResponse.json({ data: data||[] })
  }
  const ids = req.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean) || []
  if (!ids.length) return NextResponse.json({ data: [] })
  const supabase = createClient()
  const { data } = await supabase.from('profiles')
    .select('id, username, full_name, tips_count, good_tips_count, bad_tips_count, followers_count, reports_received')
    .in('id', ids)
  return NextResponse.json({ data: data || [] })
}
