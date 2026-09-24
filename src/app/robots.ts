import type { MetadataRoute } from 'next'
import { SITE, SITE_INDEXAVEL, urlAbsoluta } from '@/lib/site'

/**
 * robots.txt. Painel e carrinho ficam fora do Google. Antes do domínio de
 * verdade (SITE_INDEXAVEL), bloqueia o site inteiro.
 */
export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXAVEL) return { rules: { userAgent: '*', disallow: '/' } }

  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/painel', '/carrinho', '/api/'] },
    sitemap: urlAbsoluta('/sitemap.xml'),
    host: SITE.url,
  }
}
