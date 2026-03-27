import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TipCard from '@/components/tips/TipCard'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: tip } = await supabase.from('tips').select('*, company:companies(name,slug)').eq('id', params.id).single()
  if (!tip) return { title: 'Tip no encontrado' }
  const company = (tip.company as any)
  const good    = tip.type === 'good'
  return {
    title: `${good?'▲':'▼'} Tip sobre ${company?.name} — Tiperous`,
    description: `"${tip.text}" — tip ${good?'positivo':'negativo'} sobre ${company?.name} en Tiperous.`,
    openGraph: {
      title: `${good?'▲':'▼'} Tip sobre ${company?.name}`,
      description: `"${tip.text}"`,
      url: `https://tipero.us/t/${tip.id}`,
      images: [{ url: `https://tipero.us/api/og/tip?id=${tip.id}`, width:1200, height:630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${good?'▲':'▼'} Tip sobre ${company?.name} | Tiperous`,
      description: `"${tip.text}"`,
      images: [`https://tipero.us/api/og/tip?id=${tip.id}`],
    },
    alternates: { canonical: `https://tipero.us/t/${tip.id}` },
  }
}

export default async function TipPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: tip } = await supabase.from('tips').select('*, company:companies(name,slug)').eq('id', params.id).single()
  if (!tip) notFound()
  const { data: profile } = await supabase.from('profiles').select('id,username,full_name,avatar_url').eq('id', tip.user_id).single()
  const company = tip.company as any
  return (
    <div>
      <Link href={`/c/${company?.slug}`} style={{
        display:'inline-flex', alignItems:'center', gap:6,
        color:'var(--red)', fontWeight:700, fontSize:14, textDecoration:'none', marginBottom:20,
      }}>← {company?.name}</Link>
      <TipCard tip={{ ...tip, profile }} />
    </div>
  )
}
