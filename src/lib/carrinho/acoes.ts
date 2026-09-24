'use server'

import { buscarProdutosPorIds } from '@/lib/catalogo/consultas'
import { buscarTecido } from '@/lib/catalogo/tecidos'
import { disponivel } from '@/lib/catalogo/tipos'
import { ID_VALIDO, MAX_ITENS, MAX_QUANTIDADE, chaveItem, paraItem, type ItemCarrinho } from './tipos'

export type AjusteCarrinho = { chave: string; nome: string; motivo: 'indisponivel' | 'preco' }

export type CarrinhoConferido = { itens: ItemCarrinho[]; ajustes: AjusteCarrinho[] }

/**
 * Confere o carrinho do navegador contra o catálogo.
 *
 * Server Action é endpoint público: a entrada é desconhecida, validada campo a
 * campo e limitada. Do navegador só se aproveitam produto, variação, tecido,
 * quantidade e o preço que a pessoa viu (pra avisar se mudou). Nome, preço e
 * foto voltam do catálogo; o preço sai do tamanho e da linha do tecido.
 */
export async function conferirCarrinho(entrada: unknown): Promise<CarrinhoConferido> {
  const pedidos = new Map<
    string,
    { produtoId: string; variacaoId: string; tecido: string | null; nome: string; quantidade: number; precoVisto: number | null }
  >()

  if (Array.isArray(entrada)) {
    for (const bruto of entrada.slice(0, MAX_ITENS)) {
      if (typeof bruto !== 'object' || bruto === null) continue
      const { produtoId, variacaoId, tecido, nome, quantidade, precoCentavos } = bruto as Record<string, unknown>
      if (typeof produtoId !== 'string' || !ID_VALIDO.test(produtoId)) continue
      if (typeof variacaoId !== 'string' || !ID_VALIDO.test(variacaoId)) continue
      if (typeof quantidade !== 'number' || !Number.isInteger(quantidade) || quantidade < 1) continue
      // Cor que não existe no mostruário vira "a escolher", não derruba o item
      const codigoTecido = buscarTecido(typeof tecido === 'string' ? tecido : null)?.codigo ?? null
      pedidos.set(chaveItem({ produtoId, variacaoId, tecido: codigoTecido }), {
        produtoId,
        variacaoId,
        tecido: codigoTecido,
        nome: typeof nome === 'string' ? nome.slice(0, 120) : 'Um produto',
        quantidade: Math.min(quantidade, MAX_QUANTIDADE),
        precoVisto: typeof precoCentavos === 'number' && Number.isInteger(precoCentavos) ? precoCentavos : null,
      })
    }
  }

  const produtos = await buscarProdutosPorIds([...new Set([...pedidos.values()].map((p) => p.produtoId))])
  const porId = new Map(produtos.map((p) => [p.id, p]))
  const itens: ItemCarrinho[] = []
  const ajustes: AjusteCarrinho[] = []

  for (const [chave, pedido] of pedidos) {
    const produto = porId.get(pedido.produtoId)
    const variacao = produto?.variacoes.find((v) => v.id === pedido.variacaoId)
    if (!produto || !variacao || !disponivel(produto)) {
      ajustes.push({ chave, nome: produto?.nome ?? pedido.nome, motivo: 'indisponivel' })
      continue
    }
    const item = paraItem(produto, variacao, pedido.quantidade, pedido.tecido)
    if (pedido.precoVisto !== item.precoCentavos) ajustes.push({ chave, nome: item.nome, motivo: 'preco' })
    itens.push(item)
  }

  return { itens, ajustes }
}
