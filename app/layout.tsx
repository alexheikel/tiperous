import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ subsets:['latin'], variable:'--font-display', weight:['700','900'] })
const dmSans   = DM_Sans({ subsets:['latin'], variable:'--font-body', weight:['300','400','500','600','700'] })

export const metadata: Metadata = {
  title: 'Tiperous — Rate companies, share real experiences',
  description: 'Simple way to rate service, products and employees at any company.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
