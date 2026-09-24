import type { LinhaTecido } from './tecidos'

/*
 * Modelo do catálogo, igual ao banco (supabase/migrations).
 *
 * Preço sempre em centavos inteiros e sempre dentro da variação: todo produto
 * tem ao menos uma. Produto de um tamanho só tem uma variação sem nome; o
 * Conjunto Roma, por exemplo, pode ter "2 lugares", "3 lugares" e "2 + 3".
 */

/** Foto já pronta pro <img>: vários tamanhos no srcset e o borrão de espera. */
export type Foto = {
  src: string
  srcset: string
  largura: number
  altura: number
  /** Imagem de 20 px, em data URL, que aparece enquanto a foto carrega. */
  blur: string | null
  alt: string
  /** Ponto que precisa aparecer quando o card recorta a foto ("50% 60%"). */
  foco: string
}

export type Video = {
  src: string
  /** Capa do vídeo: uma foto tirada do próprio vídeo no painel. */
  capa: Foto
  duracaoSegundos: number | null
}

/** Centímetros. Cada tipo de sofá usa só os campos que fazem sentido pra ele. */
export type Medidas = {
  altura?: number
  comprimento?: number
  /** Segundo lado do sofá de canto ("2,80 x 2,80"). */
  comprimentoLado?: number
  profundidade?: number
  /** Retrátil ou sofá-cama aberto. */
  profundidadeAberto?: number
  profundidadeChaise?: number
  /** Conjuntos: cada sofá com o próprio comprimento. */
  pecas?: { nome: string; comprimento: number }[]
}

export type Variacao = {
  id: string
  /** null no produto de uma opção só. */
  nome: string | null
  /** Preço no Veludo, o mais barato: é o "a partir de". */
  precoCentavos: number | null
  /** Preço cheio, só quando a Edna põe uma promoção ("de R$ 3.990 por R$ 3.490"). */
  precoCheioCentavos: number | null
  /** Um preço por linha de tecido. null: o produto não tem tabela por tecido. */
  precosTecido: Partial<Record<LinhaTecido, number>> | null
}

/**
 * Preço de um tamanho numa linha de tecido. Sem tabela por tecido, vale o
 * preço único do tamanho; sem linha escolhida, o do Veludo.
 */
export function precoNaLinha(variacao: Pick<Variacao, 'precoCentavos' | 'precosTecido'>, linha: LinhaTecido | null) {
  if (!variacao.precosTecido) return variacao.precoCentavos
  return variacao.precosTecido[linha ?? 'veludo'] ?? variacao.precoCentavos
}

/** Tem preço por tecido: a página mostra as bolinhas do mostruário. */
export const temTecidos = (produto: Pick<Produto, 'variacoes'>) => produto.variacoes.some((v) => v.precosTecido !== null)

/**
 * "disponivel" é o padrão: vende normalmente e o prazo sai na conversa do
 * WhatsApp. Os outros três aparecem no card e na página quando a Edna marca.
 */
export type Disponibilidade =
  | { tipo: 'disponivel' }
  | { tipo: 'pronta-entrega' }
  | { tipo: 'sob-encomenda'; prazoDias: number | null }
  | { tipo: 'indisponivel' }

export type CategoriaResumo = { slug: string; nome: string }

export type Produto = {
  id: string
  slug: string
  nome: string
  /** Linha abaixo do nome: "Retrátil e reclinável". */
  subtitulo: string
  descricao: string
  categoria: CategoriaResumo
  medidas: Medidas
  disponibilidade: Disponibilidade
  variacoes: Variacao[]
  /** Na ordem escolhida no painel. A primeira é a capa. */
  fotos: Foto[]
  video: Video | null
  /** Posição fixa nos Sofás mais procurados. null entra pela procura no WhatsApp. */
  fixado: number | null
  ordem: number
  seo: { titulo: string | null; descricao: string | null }
}

export type Categoria = CategoriaResumo & {
  /** Texto curto do topo da página da categoria. */
  descricao: string | null
  ordem: number
  quantidade: number
  /** Capa do primeiro produto da categoria, na ordem do painel. */
  capa: Foto | null
}

/** Menor preço entre as variações com preço. null quando nenhuma tem. */
export function precoMinimo(produto: Pick<Produto, 'variacoes'>) {
  const precos = produto.variacoes.map((v) => v.precoCentavos).filter((p): p is number => p !== null)
  return precos.length ? Math.min(...precos) : null
}

/** O preço muda com a escolha, de tamanho ou de tecido: o card diz "a partir de". */
export const precoVaria = (produto: Pick<Produto, 'variacoes'>) => produto.variacoes.length > 1 || temTecidos(produto)

export const disponivel = (produto: Pick<Produto, 'disponibilidade'>) => produto.disponibilidade.tipo !== 'indisponivel'
