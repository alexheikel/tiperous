import { createClient } from '@/lib/supabase/server'
import LandingClient from './LandingClient'

export const metadata = {
  title: 'Tiperous — La voz de tu comunidad',
  description: 'Dejá tu tip sobre empresas, productos y empleados. Descubrí qué opina la comunidad antes de decidir.',
}

export default async function LandingPage() {
  const supabase = createClient()

  const [
    { count: tipCount },
    { count: companyCount },
    { count: userCount },
    { data: topCompanies },
    { data: recentTips },
  ] = await Promise.all([
    supabase.from('tips').select('*', { count:'exact', head:true }),
    supabase.from('companies').select('*', { count:'exact', head:true }),
    supabase.from('profiles').select('*', { count:'exact', head:true }),
    supabase.from('companies').select('name,slug,score_total,score_service,score_product,score_employee,category,city').order('score_total',{ascending:false}).limit(6),
    supabase.from('tips').select('text,type,segment,company:companies(name,slug)').order('created_at',{ascending:false}).limit(8),
  ])

  return <LandingClient
    stats={{ tips:tipCount||0, companies:companyCount||0, users:userCount||0 }}
    topCompanies={topCompanies||[]}
    recentTips={recentTips||[]}
  />
}
