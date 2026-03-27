import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ExploreClient from '@/components/company/ExploreClient'

export const metadata: Metadata = {
  title: 'Explorar empresas — Tiperous',
  description: 'Descubrí qué opina la comunidad sobre empresas, productos y empleados en tu ciudad. Tips honestos de gente real.',
  openGraph: {
    title: 'Tiperous — La voz de tu comunidad',
    description: 'Descubrí qué opina la comunidad sobre empresas en tu ciudad.',
    url: 'https://tipero.us',
    images: [{ url: '/og-default.png', width:1200, height:630 }],
  },
  alternates: { canonical: 'https://tipero.us' },
}

export default async function HomePage() {
  const supabase = createClient()
  const { data: companies } = await supabase
    .from('companies').select('*')
    .order('score_total', { ascending:false }).limit(50)
  return <ExploreClient initialCompanies={companies || []} />
}
