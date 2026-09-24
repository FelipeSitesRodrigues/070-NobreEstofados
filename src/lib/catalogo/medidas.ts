import type { Medidas } from './tipos'

/*
 * Medidas em texto. O banco guarda centímetros; a tela e a mensagem do
 * WhatsApp mostram metros com vírgula, do jeito que o catálogo da Nobre
 * escreve ("2,30 m").
 */

const numero = (cm: number) =>
  (cm / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** 230 vira "2,30 m". */
export const metros = (cm: number) => `${numero(cm)} m`

/** Largura do sofá, com os dois lados no de canto: "2,80 x 2,80 m". */
export function largura(m: Medidas): string | null {
  if (!m.comprimento) return null
  return m.comprimentoLado ? `${numero(m.comprimento)} x ${metros(m.comprimentoLado)}` : metros(m.comprimento)
}

/** Linha curta do card: o que decide se o sofá cabe na sala. */
export function resumoMedidas(m: Medidas): string | null {
  if (m.pecas?.length) return m.pecas.map((p) => `${p.nome.replace(/^Sofá de /, '')}: ${metros(p.comprimento)}`).join(' · ')
  const tamanho = largura(m)
  if (!tamanho) return null
  if (m.profundidadeChaise) return `${tamanho} · chaise de ${metros(m.profundidadeChaise)}`
  if (m.profundidadeAberto) return `${tamanho} · abre até ${metros(m.profundidadeAberto)}`
  return tamanho
}

export type LinhaMedida = { rotulo: string; valor: string; detalhe?: string }

/** Ficha da página do produto, só com as medidas que o modelo tem. */
export function fichaMedidas(m: Medidas): LinhaMedida[] {
  const linhas: LinhaMedida[] = []
  const tamanho = largura(m)
  if (tamanho) linhas.push({ rotulo: 'Largura', valor: tamanho, detalhe: m.comprimentoLado ? 'Os dois lados do canto' : 'De um braço ao outro' })
  for (const peca of m.pecas ?? []) linhas.push({ rotulo: peca.nome, valor: metros(peca.comprimento), detalhe: 'Largura' })
  if (m.altura) linhas.push({ rotulo: 'Altura', valor: metros(m.altura), detalhe: 'Do chão ao alto do encosto' })
  if (m.profundidade) linhas.push({ rotulo: 'Profundidade', valor: metros(m.profundidade), detalhe: 'Fechado, da frente à parede' })
  if (m.profundidadeAberto) linhas.push({ rotulo: 'Aberto', valor: metros(m.profundidadeAberto), detalhe: 'Com os assentos puxados' })
  if (m.profundidadeChaise) linhas.push({ rotulo: 'Chaise', valor: metros(m.profundidadeChaise), detalhe: 'Profundidade da chaise' })
  return linhas
}
