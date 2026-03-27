import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent:'*', allow:'/', disallow:['/api/','/profile','/tip'] }],
    sitemap: 'https://tipero.us/sitemap.xml',
  }
}
