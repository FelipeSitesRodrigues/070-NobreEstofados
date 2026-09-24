import type { Metadata } from 'next'
import { Vitrine } from '@/components/loja/Vitrine'
import { listarCategorias, listarProdutos } from '@/lib/catalogo/consultas'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'

const DESCRICAO = 'Sofás retráteis, de canto, sofás-cama, conjuntos e poltronas. Toque no modelo pra ver as medidas e comprar pelo WhatsApp.'

const lerBusca = async (searchParams: PageProps<'/loja'>['searchParams']) => {
  const { busca } = await searchParams
  return (typeof busca === 'string' ? busca : '').trim().slice(0, 80)
}

export async function generateMetadata({ searchParams }: PageProps<'/loja'>): Promise<Metadata> {
  const busca = await lerBusca(searchParams)
  return {
    title: busca ? `Busca: ${busca}` : 'Todos os modelos',
    description: DESCRICAO,
    alternates: { canonical: '/loja' },
    // Página de busca não entra no Google: só a loja inteira e as categorias
    ...(busca ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function Loja({ searchParams }: PageProps<'/loja'>) {
  const busca = await lerBusca(searchParams)
  const [config, categorias, produtos] = await Promise.all([lerConfiguracoes(), listarCategorias(), listarProdutos({ busca })])

  return (
    <Vitrine
      titulo={busca ? 'Resultado da busca' : 'Todos os modelos'}
      descricao={busca ? null : DESCRICAO}
      produtos={produtos}
      categorias={categorias}
      ativa={null}
      busca={busca}
      whatsapp={config.whatsapp}
      parcelas={config.parcelas}
    />
  )
}
