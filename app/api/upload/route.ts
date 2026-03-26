import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error:'Unauthorized' }, { status:401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error:'No file' }, { status:400 })

  const ext      = file.name.split('.').pop()
  const filename = `${user.id}/${Date.now()}.${ext}`
  const buffer   = Buffer.from(await file.arrayBuffer())

  const admin = createAdminClient()
  const { error } = await admin.storage
    .from('tip-images')
    .upload(filename, buffer, { contentType: file.type, upsert:false })

  if (error) return NextResponse.json({ error: error.message }, { status:500 })

  const { data: { publicUrl } } = admin.storage.from('tip-images').getPublicUrl(filename)
  return NextResponse.json({ url: publicUrl })
}
