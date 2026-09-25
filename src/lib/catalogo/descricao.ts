/*
 * A descrição do sofá é escrita como legenda de Instagram (pedido da Edna,
 * 2026-09-24): nome do sofá, uma frase, a lista de qualidades com ✨ e uma
 * frase de fecho.
 *
 *   🛋️ Sofá Porto Príncipe
 *
 *   Um sofá feito para quem procura conforto, resistência e qualidade.
 *
 *   ✨ Estrutura resistente
 *   ✨ Espuma de qualidade
 *
 *   Conforto e qualidade em cada detalhe.
 *
 * Assim ela cola no painel o mesmo texto que posta. Aqui ele vira blocos pra
 * página: linha que começa com emoji ou marcador é item de lista, o resto é
 * parágrafo, e a linha do nome some (o título da página já diz).
 */

export type ItemDescricao = { marcador: string; texto: string }

export type BlocoDescricao = { tipo: 'paragrafo'; texto: string } | { tipo: 'lista'; itens: ItemDescricao[] }

const EMOJI = /[\p{Extended_Pictographic}️‍]/gu
const MARCADOR = /^((?:\p{Extended_Pictographic}️?)+|[•✓✔-])\s*/u

const comparavel = (texto: string) =>
  texto
    .replace(EMOJI, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export function blocosDescricao(texto: string, nome: string): BlocoDescricao[] {
  const linhas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (linhas.length && comparavel(linhas[0]) === comparavel(nome)) linhas.shift()

  const blocos: BlocoDescricao[] = []
  for (const linha of linhas) {
    const marcador = linha.match(MARCADOR)
    if (!marcador) {
      blocos.push({ tipo: 'paragrafo', texto: linha })
      continue
    }
    const item = { marcador: marcador[1], texto: linha.slice(marcador[0].length) }
    const ultimo = blocos.at(-1)
    if (ultimo?.tipo === 'lista') ultimo.itens.push(item)
    else blocos.push({ tipo: 'lista', itens: [item] })
  }
  return blocos
}

/**
 * A descrição em texto corrido, sem emoji: pro Google (meta description e
 * dados estruturados). A lista vira uma frase só, separada por vírgula.
 */
export function descricaoCorrida(texto: string, nome: string) {
  return blocosDescricao(texto, nome)
    .map((b) => {
      if (b.tipo === 'paragrafo') return b.texto.replace(EMOJI, '').trim()
      const itens = b.itens.map((i, n) => (n === 0 ? i.texto : i.texto.charAt(0).toLowerCase() + i.texto.slice(1)))
      return `${itens.join(', ')}.`
    })
    .join(' ')
}
