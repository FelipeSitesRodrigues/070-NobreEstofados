import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { CaretRight } from '@phosphor-icons/react/dist/ssr'
import { Galeria } from '@/components/produto/Galeria'
import { GradeProdutos } from '@/components/produto/GradeProdutos'
import { Medidas } from '@/components/produto/Medidas'
import { PainelCompra } from '@/components/produto/PainelCompra'
import sec from '@/components/ui/secao.module.css'
import { buscarProduto, listarRelacionados, listarSlugs } from '@/lib/catalogo/consultas'
import { largura } from '@/lib/catalogo/medidas'
import { ID_VALIDO } from '@/lib/carrinho/tipos'
import { blocosDescricao, descricaoCorrida } from '@/lib/catalogo/descricao'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'
import { dadosProduto, resumirDescricao, serializarJsonLd } from '@/lib/seo'
import { SITE } from '@/lib/site'
import s from './produto.module.css'

/** Metadata e página leem o mesmo produto: uma consulta só por request. Slug estranho nem consulta. */
const produtoDaRota = cache(async (slug: string) => (ID_VALIDO.test(slug) ? buscarProduto(slug) : null))

export async function generateStaticParams() {
  return (await listarSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/produto/[slug]'>): Promise<Metadata> {
  const produto = await produtoDaRota((await params).slug)
  if (!produto) notFound()

  const descricao = produto.seo.descricao ?? resumirDescricao(descricaoCorrida(produto.descricao, produto.nome))
  const caminho = `/produto/${produto.slug}`

  return {
    title: produto.seo.titulo ?? `${produto.nome}, ${produto.subtitulo.toLowerCase()}`,
    description: descricao,
    alternates: { canonical: caminho },
    // O openGraph da página substitui o do layout inteiro, então repete tipo, idioma e nome
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: SITE.nome,
      title: `${produto.nome} | ${SITE.nome}`,
      description: descricao,
      url: caminho,
      // A imagem sai de opengraph-image.tsx (JPEG 1200 x 630, que o WhatsApp mostra)
    },
  }
}

export default async function PaginaProduto({ params }: PageProps<'/produto/[slug]'>) {
  const produto = await produtoDaRota((await params).slug)
  if (!produto) notFound()

  const [config, relacionados] = await Promise.all([lerConfiguracoes(), listarRelacionados(produto, 3)])
  const tamanho = largura(produto.medidas)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(dadosProduto(produto)) }} />

      <nav aria-label="Você está em" className={`conteiner ${s.trilha}`}>
        <ol>
          <li>
            <Link href="/">Início</Link>
            <CaretRight aria-hidden />
          </li>
          <li>
            <Link href={`/loja/${produto.categoria.slug}`}>{produto.categoria.nome}</Link>
            <CaretRight aria-hidden />
          </li>
          <li aria-current="page">{produto.nome}</li>
        </ol>
      </nav>

      <article aria-labelledby="nome-produto">
        <div className={`conteiner ${s.principal}`}>
          <div className={s.galeria}>
            <Galeria fotos={produto.fotos} videos={produto.videos} nome={produto.nome} />
          </div>

          <div className={s.info}>
            <h1 id="nome-produto" className={s.nome}>
              {produto.nome}
            </h1>
            <p className={s.subtitulo}>
              {produto.subtitulo}
              {tamanho && ` · ${tamanho}`}
            </p>
            <PainelCompra produto={produto} whatsapp={config.whatsapp} parcelas={config.parcelas} />
          </div>
        </div>

        <div className={`conteiner ${s.detalhes}`}>
          <Medidas medidas={produto.medidas} />
          <section aria-labelledby="titulo-descricao">
            <h2 id="titulo-descricao" className={s.tituloDescricao}>
              Sobre este modelo
            </h2>
            <div className={s.descricao}>
              {blocosDescricao(produto.descricao, produto.nome).map((bloco, i) =>
                bloco.tipo === 'paragrafo' ? (
                  <p key={i}>{bloco.texto}</p>
                ) : (
                  <ul key={i} className={s.qualidades}>
                    {bloco.itens.map((item) => (
                      <li key={item.texto}>
                        <span aria-hidden>{item.marcador}</span>
                        {item.texto}
                      </li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className={`secao ${s.relacionados}`} aria-labelledby="titulo-relacionados">
          <div className="conteiner">
            <div className={sec.cabecalho}>
              <h2 id="titulo-relacionados" className={sec.titulo}>
                Outros modelos para você
              </h2>
            </div>
            <GradeProdutos produtos={relacionados} whatsapp={config.whatsapp} parcelas={config.parcelas} />
          </div>
        </section>
      )}
    </>
  )
}
