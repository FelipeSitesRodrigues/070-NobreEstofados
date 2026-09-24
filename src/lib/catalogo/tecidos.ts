import lista from './tecidos.json'

/*
 * Tecidos do Mostruário 26/27 (scripts/preparar-tecidos.mjs gera o JSON e as
 * bolinhas em public/tecidos/).
 *
 * O preço do sofá depende da LINHA do tecido, não da cor: qualquer cor de
 * Veludo custa o mesmo, e assim por diante. São as três colunas da tabela da
 * fábrica: Veludo (linha 100), Linho (300) e Premium (500, que tem veludo e
 * linho e na tabela aparece como "Linho 500").
 *
 * Roda no servidor e no navegador: o carrinho confere aqui se a cor guardada
 * ainda existe.
 */

export const LINHAS = ['veludo', 'linho', 'premium'] as const
export type LinhaTecido = (typeof LINHAS)[number]

export const NOME_LINHA: Record<LinhaTecido, string> = {
  veludo: 'Veludo',
  linho: 'Linho',
  premium: 'Premium',
}

export type Tecido = {
  /** "veludo-102": nome do arquivo da bolinha e o que vai pro carrinho. */
  codigo: string
  /** "Veludo 102": como está no mostruário e na mensagem do WhatsApp. */
  nome: string
  linha: LinhaTecido
  /** Cor média, no lugar da foto enquanto ela carrega. */
  fundo: string
}

export const TECIDOS = lista as Tecido[]

const POR_CODIGO = new Map(TECIDOS.map((t) => [t.codigo, t]))

export const buscarTecido = (codigo: string | null | undefined) => (codigo ? (POR_CODIGO.get(codigo) ?? null) : null)

export const tecidosDaLinha = (linha: LinhaTecido) => TECIDOS.filter((t) => t.linha === linha)

export const bolinha = (t: Pick<Tecido, 'codigo'>) => `/tecidos/${t.codigo}-96.webp`
export const amostra = (t: Pick<Tecido, 'codigo'>) => `/tecidos/${t.codigo}-480.webp`

export const ehLinha = (valor: unknown): valor is LinhaTecido => LINHAS.includes(valor as LinhaTecido)
