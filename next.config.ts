import type { NextConfig } from 'next'

const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exemplo.supabase.co')

// Só com o site em https: no localhost o navegador tentaria https://localhost e a página travaria
const siteHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https://')

/**
 * Content Security Policy da loja.
 *
 * 'unsafe-inline' em script-src é a mesma concessão da 057 e da 065: o Next
 * entrega a hidratação em scripts inline, e nonce por request tiraria o cache
 * das páginas. O painel recebe a política com nonce do proxy.ts.
 *
 * Fotos e vídeos dos produtos vêm do Storage do Supabase (img-src e
 * media-src). O WhatsApp abre por link comum, que a CSP não bloqueia.
 */
const cspLoja = [
  "default-src 'self'",
  process.env.NODE_ENV === 'development'
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabase.origin}`,
  `media-src 'self' blob: ${supabase.origin}`,
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(siteHttps ? ['upgrade-insecure-requests'] : []),
].join('; ')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // O selo do modo dev aparecia nos prints de revisão
  devIndicators: false,

  experimental: {
    // Só os ícones usados entram no pacote de cada página
    optimizePackageImports: ['@phosphor-icons/react'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        ],
      },
      {
        // Tudo menos o painel, que recebe a CSP com nonce do proxy
        source: '/((?!painel(?:/|$)).*)',
        headers: [{ key: 'Content-Security-Policy', value: cspLoja }],
      },
      {
        // Imagens fixas do site (hero, banner, logo). O nome não muda quando a
        // imagem é refeita, então o cache é de uma semana, não "para sempre".
        source: '/imagens/:arquivo*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
