import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CompanyDetailClient from '@/components/company/CompanyDetailClient'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('companies').select('name,category').eq('id', params.id).single()
  if (!data) return { title: 'Empresa no encontrada' }
  return { title: `${data.name} — Tiperous` }
}

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: company } = await supabase.from('companies').select('*').eq('id', params.id).single()
  if (!company) notFound()
  const { data: tips } = await supabase
    .from('tips')
    .select('*, profile:profiles(id, username, full_name, avatar_url)')
    .eq('company_id', params.id)
    .order('created_at', { ascending: false })
    .limit(40)
  return <CompanyDetailClient company={company} initialTips={tips || []} />
}
