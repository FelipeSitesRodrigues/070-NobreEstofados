import type { MetadataRoute } from 'next'
import { listarCategorias, listarSlugs } from '@/lib/catalogo/consultas'
import { urlAbsoluta } from '@/lib/site'

/** Refaz a lista de hora em hora: produto novo no painel entra sozinho. */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categorias, slugs] = await Promise.all([listarCategorias(), listarSlugs()])

  return [
    { url: urlAbsoluta('/'), changeFrequency: 'weekly', priority: 1 },
    { url: urlAbsoluta('/loja'), changeFrequency: 'weekly', priority: 0.9 },
    ...categorias.map((c) => ({ url: urlAbsoluta(`/loja/${c.slug}`), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...slugs.map((slug) => ({ url: urlAbsoluta(`/produto/${slug}`), changeFrequency: 'weekly' as const, priority: 0.7 })),
    { url: urlAbsoluta('/politica-de-privacidade'), changeFrequency: 'yearly', priority: 0.2 },
  ]
}
