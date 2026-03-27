import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean) || []
  if (!ids.length) return NextResponse.json({ data: [] })
  const supabase = createClient()
  const { data } = await supabase.from('profiles')
    .select('id, username, full_name, tips_count, good_tips_count, bad_tips_count, followers_count, reports_received')
    .in('id', ids)
  return NextResponse.json({ data: data || [] })
}
