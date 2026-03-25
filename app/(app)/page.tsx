// app/(app)/page.tsx — Explore (SSR + client search)
import { createClient } from '@/lib/supabase/server'
import ExploreClient from '@/components/company/ExploreClient'

export const revalidate = 60 // ISR every 60s

export default async function ExplorePage() {
  const supabase  = createClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .order('score_total', { ascending: false })
    .limit(50)

  return <ExploreClient initialCompanies={companies || []} />
}
