import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import { SITE, SITE_INDEXAVEL } from '@/lib/site'
import './globals.css'

/*
 * Direção visual (mockup aprovado, sites/070 - Nobre Estofados/Recursos Site):
 * showroom de estofados em madeira e creme. Seções claras e marrons
 * alternadas, Montserrat em tudo, foto do sofá como protagonista e botão cor
 * de madeira. Uma frase só em serifada itálica, no banner, como no mockup.
 * Público com muita gente de idade: letra grande, contraste alto e o
 * WhatsApp sempre à vista.
 */

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
})

// Só a frase do banner ("Seu lar, mais completo com Nobre."): um peso, itálico, sem preload
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: '500',
  style: 'italic',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Nobre Estofados em Ubá-MG | Sofás retráteis, de canto e sofás-cama',
    template: '%s | Nobre Estofados',
  },
  description:
    'Sofás retráteis, de canto, sofás-cama, conjuntos e poltronas da Nobre Estofados, em Ubá (MG). Veja as medidas de cada modelo e compre pelo WhatsApp.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE.nome,
  },
  // Fora do domínio de verdade (endereço provisório, localhost), fica fora do Google
  ...(SITE_INDEXAVEL ? {} : { robots: { index: false, follow: false } }),
}

export const viewport: Viewport = {
  themeColor: '#faf8f4',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
