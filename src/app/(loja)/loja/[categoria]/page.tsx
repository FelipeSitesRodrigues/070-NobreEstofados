import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Vitrine } from '@/components/loja/Vitrine'
import { buscarCategoria, listarCategorias, listarProdutos } from '@/lib/catalogo/consultas'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'

export async function generateStaticParams() {
  return (await listarCategorias()).map((c) => ({ categoria: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/loja/[categoria]'>): Promise<Metadata> {
  const categoria = await buscarCategoria((await params).categoria)
  if (!categoria) notFound()
  return {
    title: categoria.nome,
    description: categoria.descricao ?? `${categoria.nome} da Nobre Estofados. Veja as medidas e compre pelo WhatsApp.`,
    alternates: { canonical: `/loja/${categoria.slug}` },
  }
}

export default async function PaginaCategoria({ params }: PageProps<'/loja/[categoria]'>) {
  const { categoria: slug } = await params
  const [config, categorias, categoria, produtos] = await Promise.all([
    lerConfiguracoes(),
    listarCategorias(),
    buscarCategoria(slug),
    listarProdutos({ categoria: slug }),
  ])
  if (!categoria) notFound()

  return (
    <Vitrine
      titulo={categoria.nome}
      descricao={categoria.descricao}
      produtos={produtos}
      categorias={categorias}
      ativa={categoria.slug}
      busca=""
      whatsapp={config.whatsapp}
      parcelas={config.parcelas}
    />
  )
}
