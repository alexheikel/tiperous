import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createClient()

  const [
    { data: flagged },
    { data: claims },
    { data: reports },
    { data: stats },
  ] = await Promise.all([
    supabase.from('tips').select('*, company:companies(name,slug), profile:profiles!tips_user_id_fkey(username,full_name)').eq('flagged', true).order('created_at', { ascending:false }),
    supabase.from('business_claims').select('*, profile:profiles(username,full_name,is_business), company:companies(name,slug)').eq('verified', false).order('created_at', { ascending:false }),
    supabase.from('reports').select('*, tip:tips(text,company_id), reporter:profiles!reports_user_id_fkey(username)').order('created_at', { ascending:false }).limit(50),
    supabase.from('profiles').select('count').single(),
  ])

  const { count: tipCount } = await supabase.from('tips').select('*', { count:'exact', head:true })
  const { count: companyCount } = await supabase.from('companies').select('*', { count:'exact', head:true })
  const { count: userCount } = await supabase.from('profiles').select('*', { count:'exact', head:true })

  return <AdminClient 
    flaggedTips={flagged||[]} 
    pendingClaims={claims||[]} 
    recentReports={reports||[]}
    stats={{ tips: tipCount||0, companies: companyCount||0, users: userCount||0 }}
  />
}
