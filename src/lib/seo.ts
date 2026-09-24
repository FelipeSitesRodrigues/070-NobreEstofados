import { precoMinimo, type Produto } from '@/lib/catalogo/tipos'
import { SITE, urlAbsoluta } from '@/lib/site'

/*
 * SEO: description curta e dados estruturados (schema.org) do produto.
 */

const LIMITE_DESCRICAO = 155

/**
 * As primeiras frases inteiras que cabem em ~155 caracteres. Se nem a
 * primeira cabe, corta na última palavra e fecha com reticências.
 */
export function resumirDescricao(texto: string, limite = LIMITE_DESCRICAO) {
  const limpo = texto.replace(/\s+/g, ' ').trim()
  if (limpo.length <= limite) return limpo

  let resumo = ''
  for (const frase of limpo.match(/[^.!?]+[.!?]+/g) ?? []) {
    const proximo = `${resumo} ${frase.trim()}`.trim()
    if (proximo.length > limite) break
    resumo = proximo
  }
  if (resumo) return resumo

  const corte = limpo.slice(0, limite - 1)
  return `${corte.slice(0, corte.lastIndexOf(' ')).replace(/[\s,;:]+$/, '')}…`
}

/** JSON dentro de <script>: o "<" escapado impede fechar a tag por dentro do texto. */
export const serializarJsonLd = (dados: unknown) => JSON.stringify(dados).replace(/</g, '\\u003c')

const DISPONIBILIDADE: Record<Produto['disponibilidade']['tipo'], string> = {
  disponivel: 'https://schema.org/InStock',
  'pronta-entrega': 'https://schema.org/InStock',
  'sob-encomenda': 'https://schema.org/PreOrder',
  indisponivel: 'https://schema.org/OutOfStock',
}

/** Product + BreadcrumbList. Sem preço cadastrado, o Google recebe o produto sem oferta. */
export function dadosProduto(produto: Produto) {
  const caminho = `/produto/${produto.slug}`
  const url = urlAbsoluta(caminho)
  const preco = precoMinimo(produto)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${url}#produto`,
        name: produto.nome,
        description: produto.descricao,
        image: produto.fotos.map((f) => urlAbsoluta(f.src)),
        category: produto.categoria.nome,
        brand: { '@type': 'Brand', name: SITE.nome },
        url,
        ...(preco !== null
          ? {
              offers: {
                '@type': 'Offer',
                url,
                price: (preco / 100).toFixed(2),
                priceCurrency: 'BRL',
                availability: DISPONIBILIDADE[produto.disponibilidade.tipo],
                seller: { '@type': 'Organization', name: SITE.nome },
              },
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: urlAbsoluta('/') },
          { '@type': 'ListItem', position: 2, name: produto.categoria.nome, item: urlAbsoluta(`/loja/${produto.categoria.slug}`) },
          { '@type': 'ListItem', position: 3, name: produto.nome, item: url },
        ],
      },
    ],
  }
}
