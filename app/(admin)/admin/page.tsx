import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createClient()

  const [
    { data: flagged },
    { data: claims },
    { data: reports },
    { data: levelProfiles },
    { data: categories },
    { data: paidCompanies },
    { data: recentUsers },
    { data: recentCompanies },
    { data: recentComments },
  ] = await Promise.all([
    supabase.from('tips').select('*, company:companies(name,slug), profile:profiles!tips_user_id_fkey(username,full_name)').eq('flagged', true).order('created_at', { ascending:false }),
    supabase.from('business_claims').select('*, profile:profiles(username,full_name,is_business), company:companies(name,slug)').eq('verified', false).order('created_at', { ascending:false }),
    supabase.from('reports').select('*, tip:tips(text,company_id), reporter:profiles!reports_user_id_fkey(username)').order('created_at', { ascending:false }).limit(50),
    supabase.from('profiles').select('tips_count, good_tips_count, bad_tips_count, followers_count, reports_received'),
    supabase.from('companies').select('category').not('category', 'is', null),
    supabase.from('profiles').select('id, username, full_name, business_name').eq('is_business', true).eq('business_verified', true),
    supabase.from('profiles').select('id, username, created_at').order('created_at', { ascending:false }).limit(10),
    supabase.from('companies').select('id, name, category, created_at').order('created_at', { ascending:false }).limit(10),
    supabase.from('comments').select('id, created_at').order('created_at', { ascending:false }),
  ])

  const { count: tipCount }     = await supabase.from('tips').select('*', { count:'exact', head:true })
  const { count: companyCount } = await supabase.from('companies').select('*', { count:'exact', head:true })
  const { count: userCount }    = await supabase.from('profiles').select('*', { count:'exact', head:true })
  const { count: commentCount } = await supabase.from('comments').select('*', { count:'exact', head:true })
  
  // User growth by day (last 30 days)
  const { data: userGrowth } = await supabase
    .from('profiles')
    .select('created_at')
    .neq('id', 'd9f0b65f-d7ce-4739-b214-61264bee95ed')
    .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString())
    .order('created_at', { ascending: true })

  // Category breakdown
  const categoryMap: Record<string, number> = {}
  ;(categories||[]).forEach((c:any) => { categoryMap[c.category] = (categoryMap[c.category]||0) + 1 })

  // Level breakdown using same formula
  const levelCounts = [0,0,0,0,0,0,0]
  ;(levelProfiles||[]).forEach((p:any) => {
    const total = p.tips_count||0
    const good  = p.good_tips_count||0
    const bad   = p.bad_tips_count||0
    const followers = p.followers_count||0
    const reports = p.reports_received||0
    const badRatio = total > 5 && bad/total > 0.7 ? -10 : 0
    const score = Math.max(0, Math.round((total*2) + (good*1) + (bad*0.5) + (followers*1) - (reports*5) + badRatio))
    const thresholds = [0,8,20,45,90,150,300]
    let level = 0
    for (let i = thresholds.length-1; i >= 0; i--) { if (score >= thresholds[i]) { level = i; break } }
    levelCounts[level]++
  })

  return <AdminClient
    flaggedTips={flagged||[]}
    pendingClaims={claims||[]}
    recentReports={reports||[]}
    stats={{ tips:tipCount||0, companies:companyCount||0, users:userCount||0, comments:commentCount||0 }}
    userGrowth={userGrowth||[]}
    categoryMap={categoryMap}
    levelCounts={levelCounts}
    paidCompanies={paidCompanies||[]}
    recentUsers={recentUsers||[]}
    recentCompanies={recentCompanies||[]}
  />
}
