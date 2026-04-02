import type { Metadata } from 'next'
import { Inter, Cinzel } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '700', '900'],
})

export const metadata: Metadata = {
  title: 'Isek.AI — Transforme seus estudos em uma aventura épica',
  description:
    'Plataforma gamificada que converte textos e PDFs escolares em histórias de anime Isekai com IA.',
  keywords: ['estudos', 'anime', 'isekai', 'gamificado', 'IA', 'educação'],
  openGraph: {
    title: 'Isek.AI',
    description: 'Seus estudos viram uma aventura épica.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="min-h-screen bg-void-gradient antialiased">
        {/* Ambient background particles — purely decorative */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-mana-900/20 blur-3xl" />
          <div className="absolute top-1/2 -left-20 h-72 w-72 rounded-full bg-mana-800/10 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-56 w-56 rounded-full bg-neon-blue/5 blur-3xl" />
        </div>

        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
