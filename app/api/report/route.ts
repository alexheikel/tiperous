import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const REASONS: Record<string, string> = {
  offensive:   'Contenido ofensivo',
  spam:        'Spam',
  fake:        'Información falsa',
  harassment:  'Acoso',
  other:       'Otro',
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })
  const { tip_id, reason } = await req.json()
  if (!tip_id || !REASONS[reason]) return NextResponse.json({ error:'Invalid' }, { status:400 })
  const { error } = await supabase.from('reports').insert({ tip_id, user_id:user.id, reason })
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error:'Ya denunciaste este tip.' }, { status:409 })
    return NextResponse.json({ error:error.message }, { status:500 })
  }
  return NextResponse.json({ ok:true })
}
