import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-display', weight:['700','900'] })
const dmSans   = DM_Sans({ subsets:['latin'], variable:'--font-body', weight:['300','400','500','600','700'] })

export const metadata: Metadata = {
  title: 'Tiperous — Rate companies, share real experiences',
  description: 'Simple way to rate service, products and employees at any company.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Tiperous',
    description: 'Rate companies. Share real experiences.',
    type: 'website',
    url: 'https://tipero.us',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Tiperous"/>
        <link rel="apple-touch-icon" href="/icon-512.png"/>
        <meta name="theme-color" content="#e8341c"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
