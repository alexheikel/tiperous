import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import CompanyDetailClient from '@/components/company/CompanyDetailClient'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: c } = await supabase
    .from('companies')
    .select('name,category,city,country,score_total,tips_count,score_service,score_product,score_employee')
    .eq('slug', params.slug).single()
  if (!c) return { title: 'Empresa no encontrada — Tiperous' }

  const score    = c.score_total || 0
  const scoreStr = score > 0 ? `+${score}` : String(score)
  const city     = c.city ? ` en ${c.city}` : ''
  const tips     = c.tips_count || 0
  const desc     = `${c.name}${city} tiene un score de ${scoreStr} con ${tips} tip${tips!==1?'s':''}. ${score>=0?'La comunidad la recomienda.':'La comunidad no la recomienda.'} Leé opiniones honestas sobre servicio, productos y empleados.`

  return {
    title: `${c.name} — ${scoreStr} puntos | Tiperous`,
    description: desc,
    openGraph: {
      title: `${c.name} ${score>=0?'▲':'▼'} ${scoreStr} | Tiperous`,
      description: desc,
      url: `https://tipero.us/c/${params.slug}`,
      type: 'website',
      images: [{
        url: `https://tipero.us/api/og/company?slug=${params.slug}`,
        width: 1200, height: 630,
        alt: `${c.name} en Tiperous`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${c.name} ${score>=0?'▲':'▼'} ${scoreStr} | Tiperous`,
      description: desc,
      images: [`https://tipero.us/api/og/company?slug=${params.slug}`],
    },
    alternates: { canonical: `https://tipero.us/c/${params.slug}` },
  }
}

export default async function CompanySlugPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: company } = await supabase
    .from('companies').select('*').eq('slug', params.slug).single()
  if (!company) notFound()
  const { data: tips } = await supabase
    .from('tips').select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending:false }).limit(40)
  const tipIds   = (tips||[]).map(t => t.user_id)
  const { data: profiles } = tipIds.length
    ? await supabase.from('profiles').select('id,username,full_name,avatar_url').in('id',[...new Set(tipIds)])
    : { data: [] }
  const profileMap = Object.fromEntries((profiles||[]).map(p=>[p.id,p]))
  const tipsWithProfiles = (tips||[]).map(t=>({...t, profile:profileMap[t.user_id]||null}))
  return <CompanyDetailClient company={company} initialTips={tipsWithProfiles} />
}
