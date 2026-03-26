import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import CompanyDetailClient from '@/components/company/CompanyDetailClient'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('companies').select('name,category,city').eq('slug', params.slug).single()
  if (!data) return { title: 'Empresa no encontrada' }
  return {
    title: `${data.name} — Tiperous`,
    description: `Tips y reseñas de ${data.name}${data.city ? ` en ${data.city}` : ''}`,
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
