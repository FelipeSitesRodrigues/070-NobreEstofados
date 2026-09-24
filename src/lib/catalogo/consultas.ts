import 'server-only'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { clientePublico } from '@/lib/supabase/publico'
import { urlFoto, urlVideo } from '@/lib/supabase/config'
import { LINHAS, type LinhaTecido } from './tecidos'
import { type Categoria, type Foto, type Medidas, type Produto, type Variacao, type Video, disponivel } from './tipos'

/*
 * Leitura do catálogo. Tudo que a loja mostra passa por aqui.
 *
 * Lê do Supabase com a chave pública: o banco só entrega produto ativo e as
 * mídias dele (RLS). O catálogo inteiro vem numa consulta e fica em cache por
 * 5 minutos com a tag "catalogo"; o painel limpa a tag ao salvar, então o que
 * a Edna muda aparece na hora.
 *
 * Ordem, busca e "mais procurados" continuam calculados aqui, em JavaScript: a
 * Nobre tem dezenas de modelos, não milhares, e uma consulta só traz tudo.
 *
 * Só roda no servidor: o preço que vale é sempre o daqui, nunca o que chega do
 * navegador. A conferência do carrinho usa buscarProdutosPorIds, que vai
 * direto ao banco, sem cache.
 */

export const TAG_CATALOGO = 'catalogo'

const COLUNAS = [
  'id, slug, nome, subtitulo, descricao, medidas, disponibilidade, prazo_dias, fixado, ordem',
  'meta_titulo, meta_descricao',
  'categorias!inner(slug, nome, ordem)',
  'variacoes(id, nome, preco_centavos, preco_cheio_centavos, precos_tecido, ordem)',
  'midias(id, tipo, larguras, largura, altura, blur, alt, foco_x, foco_y, duracao_segundos, ordem)',
].join(', ')

type LinhaMidia = {
  id: string
  tipo: 'foto' | 'video'
  larguras: number[]
  largura: number
  altura: number
  blur: string | null
  alt: string
  foco_x: number
  foco_y: number
  duracao_segundos: number | null
  ordem: number
}

type LinhaProduto = {
  id: string
  slug: string
  nome: string
  subtitulo: string
  descricao: string
  medidas: Medidas
  disponibilidade: 'disponivel' | 'pronta-entrega' | 'sob-encomenda' | 'indisponivel'
  prazo_dias: number | null
  fixado: number | null
  ordem: number
  meta_titulo: string | null
  meta_descricao: string | null
  categorias: { slug: string; nome: string; ordem: number }
  variacoes: {
    id: string
    nome: string | null
    preco_centavos: number | null
    preco_cheio_centavos: number | null
    precos_tecido: Record<string, unknown> | null
    ordem: number
  }[]
  midias: LinhaMidia[]
}

type LinhaCategoria = { slug: string; nome: string; descricao: string; ordem: number }

/** Foto pronta pro <img>: a maior versão no src e todas no srcset. */
function paraFoto(produtoId: string, m: LinhaMidia): Foto {
  const larguras = [...m.larguras].sort((a, b) => a - b)
  // 960 é a largura que o card e a página usam; acima disso só no srcset
  const principal = larguras.includes(960) ? 960 : (larguras.at(-1) ?? m.largura)
  return {
    src: urlFoto(produtoId, m.id, principal),
    srcset: larguras.map((l) => `${urlFoto(produtoId, m.id, l)} ${l}w`).join(', '),
    largura: m.largura,
    altura: m.altura,
    blur: m.blur,
    alt: m.alt,
    foco: `${m.foco_x}% ${m.foco_y}%`,
  }
}

function paraVideo(produtoId: string, m: LinhaMidia): Video {
  return {
    src: urlVideo(produtoId, m.id),
    capa: paraFoto(produtoId, m),
    duracaoSegundos: m.duracao_segundos,
  }
}

/**
 * Os preços por tecido, só com linha conhecida e valor inteiro. O banco já
 * confere isso (precos_tecido_validos), mas a loja não confia às cegas: um
 * valor torto viraria preço errado no WhatsApp.
 */
function lerPrecosTecido(bruto: Record<string, unknown> | null): Variacao['precosTecido'] {
  if (!bruto || typeof bruto !== 'object') return null
  const precos: Partial<Record<LinhaTecido, number>> = {}
  for (const linha of LINHAS) {
    const valor = bruto[linha]
    if (typeof valor === 'number' && Number.isInteger(valor) && valor >= 0) precos[linha] = valor
  }
  return Object.keys(precos).length ? precos : null
}

/*
 * Sofá vendido em vários tamanhos ("2,00 m", "2,50 m", "3,00 m"): a largura
 * mora no nome de cada tamanho. Uma largura só no card, no título e na ficha
 * contradiria o que o cliente escolhe logo abaixo, então ela sai daqui — um
 * lugar só, e card, página, ficha e carrinho seguem juntos. Altura e
 * profundidade continuam, porque não mudam de um tamanho pro outro.
 */
function medidasDoProduto(linha: LinhaProduto): Medidas {
  const medidas = { ...(linha.medidas ?? {}) }
  if (linha.variacoes.length > 1) {
    delete medidas.comprimento
    delete medidas.comprimentoLado
  }
  return medidas
}

function paraProduto(linha: LinhaProduto): Produto {
  const midias = [...linha.midias].sort((a, b) => a.ordem - b.ordem)
  const video = midias.find((m) => m.tipo === 'video')
  return {
    id: linha.id,
    slug: linha.slug,
    nome: linha.nome,
    subtitulo: linha.subtitulo,
    descricao: linha.descricao,
    categoria: { slug: linha.categorias.slug, nome: linha.categorias.nome },
    medidas: medidasDoProduto(linha),
    disponibilidade:
      linha.disponibilidade === 'sob-encomenda'
        ? { tipo: 'sob-encomenda', prazoDias: linha.prazo_dias }
        : { tipo: linha.disponibilidade },
    variacoes: [...linha.variacoes]
      .sort((a, b) => a.ordem - b.ordem)
      .map((v) => ({
        id: v.id,
        nome: v.nome,
        precoCentavos: v.preco_centavos,
        precoCheioCentavos: v.preco_cheio_centavos,
        precosTecido: lerPrecosTecido(v.precos_tecido),
      })),
    fotos: midias.filter((m) => m.tipo === 'foto').map((m) => paraFoto(linha.id, m)),
    video: video ? paraVideo(linha.id, video) : null,
    fixado: linha.fixado,
    ordem: linha.ordem,
    seo: { titulo: linha.meta_titulo, descricao: linha.meta_descricao },
  }
}

/** Categoria primeiro, depois a ordem do painel: a ordem da loja inteira. */
function ordenar(produtos: Produto[], ordemCategoria: Map<string, number>) {
  return produtos.sort(
    (a, b) =>
      (ordemCategoria.get(a.categoria.slug) ?? 99) - (ordemCategoria.get(b.categoria.slug) ?? 99) ||
      a.ordem - b.ordem ||
      a.nome.localeCompare(b.nome, 'pt-BR'),
  )
}

async function consultarCategorias(): Promise<LinhaCategoria[]> {
  const { data, error } = await clientePublico().from('categorias').select('slug, nome, descricao, ordem').order('ordem')
  if (error) throw new Error(`Categorias indisponíveis: ${error.message}`)
  return (data ?? []) as LinhaCategoria[]
}

async function consultarAtivos(): Promise<Produto[]> {
  const { data, error } = await clientePublico().from('produtos').select(COLUNAS).eq('status', 'ativo').order('ordem')
  if (error) throw new Error(`Catálogo indisponível: ${error.message}`)

  const linhas = (data ?? []) as unknown as LinhaProduto[]
  const ordemCategoria = new Map(linhas.map((l) => [l.categorias.slug, l.categorias.ordem]))
  return ordenar(linhas.map(paraProduto), ordemCategoria)
}

const catalogoEmCache = unstable_cache(
  async () => ({ produtos: await consultarAtivos(), categorias: await consultarCategorias() }),
  ['catalogo-nobre'],
  { tags: [TAG_CATALOGO], revalidate: 300 },
)

/** O catálogo ativo, uma consulta só por request. */
const catalogo = cache(() => catalogoEmCache())
const ativos = async () => (await catalogo()).produtos

/** Procura sem acento e sem maiúscula: "sofa cama" acha "Sofá-cama". */
export const normalizarTexto = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9,]+/g, ' ')
    .trim()

const textoBusca = (p: Produto) => normalizarTexto([p.nome, p.subtitulo, p.categoria.nome, p.descricao].join(' '))

export async function listarProdutos({ categoria, busca }: { categoria?: string; busca?: string } = {}) {
  const termos = normalizarTexto(busca ?? '').split(' ').filter(Boolean)
  return (await ativos()).filter((p) => {
    if (categoria && p.categoria.slug !== categoria) return false
    if (termos.length) {
      const texto = textoBusca(p)
      return termos.every((t) => texto.includes(t))
    }
    return true
  })
}

export async function listarCategorias(): Promise<Categoria[]> {
  const { produtos, categorias } = await catalogo()
  return categorias
    .map((c) => {
      const daCategoria = produtos.filter((p) => p.categoria.slug === c.slug)
      return {
        slug: c.slug,
        nome: c.nome,
        descricao: c.descricao || null,
        ordem: c.ordem,
        quantidade: daCategoria.length,
        capa: daCategoria[0]?.fotos[0] ?? null,
      }
    })
    .filter((c) => c.quantidade > 0)
}

export async function buscarCategoria(slug: string) {
  return (await listarCategorias()).find((c) => c.slug === slug) ?? null
}

export async function buscarProduto(slug: string) {
  return (await ativos()).find((p) => p.slug === slug) ?? null
}

export async function listarSlugs() {
  return (await ativos()).map((p) => p.slug)
}

export async function totalProdutos() {
  return (await ativos()).length
}

/** Quantos pedidos cada sofá teve no WhatsApp nos últimos 30 dias. */
const procuraEmCache = unstable_cache(
  async () => {
    const { data, error } = await clientePublico().rpc('ranking_procura', { p_dias: 30 })
    // Ranking é enfeite: se falhar, a home mostra a ordem da loja em vez de quebrar
    if (error) return []
    return (data ?? []) as { produto_id: string; pedidos: number }[]
  },
  ['procura-nobre'],
  { tags: [TAG_CATALOGO], revalidate: 3600 },
)

/**
 * Sofás mais procurados: primeiro os que a Edna fixou, na ordem dela; o resto
 * das vagas vai pros mais pedidos no WhatsApp nos últimos 30 dias. Sem procura
 * registrada ainda, completa pela ordem da loja.
 */
export async function listarMaisProcurados(limite = 6) {
  const produtos = (await ativos()).filter(disponivel)
  const fixados = produtos.filter((p) => p.fixado !== null).sort((a, b) => (a.fixado ?? 0) - (b.fixado ?? 0))

  const pedidos = new Map((await procuraEmCache()).map((r) => [r.produto_id, Number(r.pedidos)]))
  const resto = produtos
    .filter((p) => p.fixado === null)
    .sort((a, b) => (pedidos.get(b.id) ?? 0) - (pedidos.get(a.id) ?? 0))

  return [...fixados, ...resto].slice(0, limite)
}

/** Produtos com vídeo, pra seção "Veja os sofás em vídeo". */
export async function listarComVideo(limite = 4) {
  return (await ativos()).filter((p) => p.video !== null).slice(0, limite)
}

/** Outros modelos da mesma categoria primeiro, depois o resto da loja. */
export async function listarRelacionados(produto: Produto, limite = 3) {
  const outros = (await ativos()).filter((p) => p.slug !== produto.slug && disponivel(p))
  const mesmaCategoria = outros.filter((p) => p.categoria.slug === produto.categoria.slug)
  const demais = outros.filter((p) => p.categoria.slug !== produto.categoria.slug)
  return [...mesmaCategoria, ...demais].slice(0, limite)
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Produtos pelos ids, pra conferência do carrinho (nunca confia no navegador).
 * Vai direto ao banco, sem cache: preço de carrinho é sempre o de agora. Id
 * sem cara de uuid nem chega a virar consulta — carrinho velho, de quando o
 * catálogo era arquivo, tinha slug no lugar do id.
 */
export async function buscarProdutosPorIds(ids: string[]) {
  const pedidos = [...new Set(ids.slice(0, 60))].filter((id) => UUID.test(id))
  if (!pedidos.length) return []

  const { data, error } = await clientePublico()
    .from('produtos')
    .select(COLUNAS)
    .eq('status', 'ativo')
    .in('id', pedidos)
  if (error) throw new Error(`Catálogo indisponível: ${error.message}`)

  const linhas = (data ?? []) as unknown as LinhaProduto[]
  return ordenar(
    linhas.map(paraProduto),
    new Map(linhas.map((l) => [l.categorias.slug, l.categorias.ordem])),
  )
}
