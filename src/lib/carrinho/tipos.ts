import { largura, resumoMedidas } from '@/lib/catalogo/medidas'
import { NOME_LINHA, buscarTecido, type LinhaTecido } from '@/lib/catalogo/tecidos'
import { precoNaLinha, type Produto, type Variacao } from '@/lib/catalogo/tipos'
import type { ItemMensagem } from '@/lib/whatsapp'

/*
 * Item do carrinho como fica guardado no navegador.
 *
 * Nome, preço e foto vão junto só pra desenhar o carrinho na hora. Não valem
 * pra mensagem: antes de enviar, o servidor confere tudo pelo produto, pela
 * variação e pelo tecido (lib/carrinho/acoes.ts) e a mensagem sai do que
 * voltou de lá.
 */

export const MAX_QUANTIDADE = 10
export const MAX_ITENS = 20
/** Ids do banco (uuid) e, até ele entrar, os slugs do catálogo provisório. */
export const ID_VALIDO = /^[a-z0-9-]{1,80}$/

export type ItemCarrinho = {
  produtoId: string
  variacaoId: string
  slug: string
  nome: string
  opcao: string | null
  tamanho: string | null
  /** Cor do mostruário ("veludo-102"). null: ainda não escolheu. */
  tecido: string | null
  /** Linha que define o preço. null: o produto não tem preço por tecido. */
  linha: LinhaTecido | null
  precoCentavos: number | null
  imagem: { src: string; largura: number; altura: number } | null
  quantidade: number
}

/** O mesmo sofá pode entrar mais de uma vez: outro tamanho ou outro tecido. */
export const chaveItem = (item: Pick<ItemCarrinho, 'produtoId' | 'variacaoId' | 'tecido'>) =>
  `${item.produtoId}:${item.variacaoId}:${item.tecido ?? ''}`

/**
 * O que o botão de adicionar entrega pro carrinho, e o que o servidor monta ao
 * conferir. O preço sai sempre daqui: tamanho + linha do tecido.
 */
export function paraItem(produto: Produto, variacao: Variacao, quantidade = 1, codigoTecido: string | null = null): ItemCarrinho {
  const capa = produto.fotos[0]
  const comTecido = variacao.precosTecido !== null
  const tecido = comTecido ? buscarTecido(codigoTecido) : null
  // Sem cor escolhida, o preço é o do Veludo (o mesmo que a página mostrou)
  const linha = comTecido ? (tecido?.linha ?? 'veludo') : null
  return {
    produtoId: produto.id,
    variacaoId: variacao.id,
    slug: produto.slug,
    nome: produto.nome,
    opcao: variacao.nome,
    tamanho: variacao.nome ? null : (largura(produto.medidas) ?? resumoMedidas(produto.medidas)),
    tecido: tecido?.codigo ?? null,
    linha,
    precoCentavos: precoNaLinha(variacao, linha),
    imagem: capa ? { src: capa.src, largura: capa.largura, altura: capa.altura } : null,
    quantidade,
  }
}

/** "Linho 304", ou "Veludo, cor a escolher" quando só a linha está definida. */
export function textoTecido(item: Pick<ItemCarrinho, 'tecido' | 'linha'>) {
  const tecido = buscarTecido(item.tecido)
  if (tecido) return tecido.nome
  return item.linha ? `${NOME_LINHA[item.linha]}, cor a escolher` : null
}

export const quantidadeTotal = (itens: ItemCarrinho[]) => itens.reduce((soma, i) => soma + i.quantidade, 0)

export const totalCentavos = (itens: ItemCarrinho[]) => itens.reduce((soma, i) => soma + (i.precoCentavos ?? 0) * i.quantidade, 0)

export const paraMensagem = (item: ItemCarrinho): ItemMensagem => ({
  nome: item.nome,
  opcao: item.opcao,
  tamanho: item.tamanho,
  tecido: textoTecido(item),
  quantidade: item.quantidade,
  precoCentavos: item.precoCentavos,
  caminho: `/produto/${item.slug}`,
})
