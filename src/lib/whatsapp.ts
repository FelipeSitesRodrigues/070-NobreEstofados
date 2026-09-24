import { formatarPreco, urlAbsoluta } from '@/lib/site'

/*
 * A mensagem do WhatsApp. Uma função só monta todas: o "Comprar pelo
 * WhatsApp" da página do produto, o pedido do carrinho, o "Perguntar no
 * WhatsApp" dos cards e o "Chamar no WhatsApp" geral. Nome, preço e endereço
 * vêm sempre dos dados do catálogo, nunca de texto escrito na tela.
 */

export type ItemMensagem = {
  nome: string
  /** Variação escolhida ("Conjunto 2 + 3 lugares"), ou null. */
  opcao: string | null
  /** Largura, quando o produto não tem variação com nome ("2,30 m"). */
  tamanho: string | null
  /** "Linho 304", "Veludo, cor a escolher", ou null quando não há tecido. */
  tecido: string | null
  quantidade: number
  precoCentavos: number | null
  /** Caminho da página do produto ("/produto/sofa-dubai"). */
  caminho: string
}

export type Mensagem =
  | { tipo: 'compra'; itens: ItemMensagem[] }
  | { tipo: 'pergunta'; nome: string; caminho: string }
  | { tipo: 'tamanho'; nome: string; caminho: string }
  | { tipo: 'ajuda' }

const ABERTURA = 'Olá! Vim pelo site da Nobre'

/** O WhatsApp transforma "nobreestofados.com.br/..." em link sem precisar do https. */
const endereco = (caminho: string) => urlAbsoluta(caminho).replace(/^https?:\/\//, '')

function valor(item: ItemMensagem) {
  if (item.precoCentavos === null) return 'a consultar'
  if (item.quantidade === 1) return formatarPreco(item.precoCentavos)
  return `${item.quantidade} x ${formatarPreco(item.precoCentavos)} = ${formatarPreco(item.precoCentavos * item.quantidade)}`
}

function blocoItem(item: ItemMensagem, numero: number | null) {
  const linhas = [`${numero === null ? '' : `${numero}. `}*${item.nome}*`]
  // "2,30 m" e "2 lugares" são tamanho; o resto é opção
  if (item.opcao) linhas.push(`${/\d/.test(item.opcao) ? 'Tamanho' : 'Opção'}: ${item.opcao}`)
  else if (item.tamanho) linhas.push(`Tamanho: ${item.tamanho}`)
  if (item.tecido) linhas.push(`Tecido: ${item.tecido}`)
  if (item.quantidade > 1) linhas.push(`Quantidade: ${item.quantidade}`)
  linhas.push(`Valor: ${valor(item)}`)
  linhas.push(endereco(item.caminho))
  return linhas.join('\n')
}

function mensagemCompra(itens: ItemMensagem[]) {
  const varios = itens.length > 1
  const blocos = itens.map((item, i) => blocoItem(item, varios ? i + 1 : null))
  const semPreco = itens.some((i) => i.precoCentavos === null)
  const partes = [`${ABERTURA} e quero ${varios ? 'fazer este pedido' : 'comprar'}:`, ...blocos]

  if (varios) {
    const total = itens.reduce((soma, i) => soma + (i.precoCentavos ?? 0) * i.quantidade, 0)
    if (total > 0) partes.push(`${semPreco ? 'Total dos itens com preço' : 'Total'}: ${formatarPreco(total)}`)
  }

  partes.push(semPreco ? 'Pode me passar o valor e o prazo de entrega?' : 'Pode me passar o prazo de entrega?')
  return partes.join('\n\n')
}

export function montarMensagem(mensagem: Mensagem) {
  switch (mensagem.tipo) {
    case 'compra':
      return mensagemCompra(mensagem.itens)
    case 'pergunta':
      // "o modelo" serve pra sofá, conjunto e poltrona sem errar o artigo
      return `${ABERTURA} e quero saber mais sobre o modelo *${mensagem.nome}*.\n\n${endereco(mensagem.caminho)}`
    case 'tamanho':
      // A Edna já sabe do que se trata antes de responder: é dúvida de medida
      return `${ABERTURA} e quero ajuda para escolher o tamanho do *${mensagem.nome}*.\n\n${endereco(mensagem.caminho)}`
    case 'ajuda':
      return `${ABERTURA} e quero ajuda para escolher um sofá.`
  }
}

/** Link que abre a conversa com a mensagem já escrita. */
export function linkWhatsApp(numero: string, mensagem: Mensagem) {
  return `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(montarMensagem(mensagem))}`
}
