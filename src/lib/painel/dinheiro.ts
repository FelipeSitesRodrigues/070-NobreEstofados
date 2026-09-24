/*
 * Preço no painel. No banco é centavo inteiro; na tela é o que a Edna digita.
 *
 * Ela vai digitar de tudo: "3490", "3.490", "3490,00", "R$ 3.490". A regra é a
 * mais previsível possível: tira tudo que não é número, vírgula ou ponto; se
 * sobrar vírgula (ou um ponto com 2 casas no fim), aquilo são os centavos; se
 * não, o número é em reais redondos. "3.490" vira R$ 3.490,00, não R$ 3,49.
 */

/** Teto do banco: R$ 1.000.000,00 em centavos. */
export const LIMITE_CENTAVOS = 100000000

export function centavosDeTexto(texto: string): number | null {
  const limpo = texto.trim().replace(/[^\d.,]/g, '')
  if (!limpo) return null

  const separador = /[.,](\d{1,2})$/.exec(limpo)
  const inteiros = (separador ? limpo.slice(0, separador.index) : limpo).replace(/\D/g, '')
  if (!inteiros && !separador) return null

  const centavos = separador ? separador[1].padEnd(2, '0') : '00'
  const valor = Number(`${inteiros || '0'}${centavos}`)
  // Valor grande demais volta como número, não como null: quem chama avisa que
  // passou do teto, em vez de dizer "não entendi" pra um número legítimo
  return Number.isSafeInteger(valor) && valor >= 0 ? valor : null
}

/** 349000 vira "3.490,00" (sem o "R$": o campo já mostra o símbolo do lado). */
export const textoDeCentavos = (centavos: number | null) =>
  centavos === null ? '' : (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
