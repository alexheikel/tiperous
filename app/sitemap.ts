import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const { data: companies } = await supabase
    .from('companies').select('slug,updated_at').not('slug', 'is', null)

  const companyUrls = (companies||[]).map(c => ({
    url: `https://tipero.us/c/${c.slug}`,
    lastModified: c.updated_at || new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    { url:'https://tipero.us', lastModified:new Date(), changeFrequency:'daily', priority:1.0 },
    { url:'https://tipero.us/timeline', lastModified:new Date(), changeFrequency:'hourly', priority:0.9 },
    ...companyUrls,
  ]
}
