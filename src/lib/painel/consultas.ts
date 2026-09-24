import 'server-only'
import type { LinhaTecido } from '@/lib/catalogo/tecidos'
import { urlFoto, urlVideo } from '@/lib/supabase/config'
import { exigirAdmin } from './sessao'

/*
 * Leitura do painel. Diferente da loja em duas coisas: traz rascunho e
 * arquivado junto (a Edna precisa ver o que ainda não publicou) e nunca passa
 * por cache — ela acabou de salvar, tem que ver o que salvou.
 *
 * Tudo com a sessão dela: o banco (RLS) só entrega isto a quem tem perfil admin.
 */

export type MidiaPainel = {
  id: string
  tipo: 'foto' | 'video'
  src: string
  largura: number
  altura: number
  alt: string
  focoX: number
  focoY: number
  ordem: number
  /** Só no vídeo: a capa, tirada de um quadro dele. */
  capa: string | null
}

export type VariacaoPainel = {
  id: string
  nome: string | null
  precoCentavos: number | null
  precoCheioCentavos: number | null
  /** Veludo, Linho e Premium. null: preço único, sem tecido. */
  precosTecido: Partial<Record<LinhaTecido, number>> | null
}

export type ProdutoPainel = {
  id: string
  slug: string
  nome: string
  subtitulo: string
  descricao: string
  medidas: Record<string, unknown>
  disponibilidade: 'disponivel' | 'pronta-entrega' | 'sob-encomenda' | 'indisponivel'
  prazoDias: number | null
  fixado: number | null
  status: 'rascunho' | 'ativo' | 'arquivado'
  ordem: number
  metaTitulo: string | null
  metaDescricao: string | null
  categoria: { id: string; slug: string; nome: string }
  variacoes: VariacaoPainel[]
  midias: MidiaPainel[]
}

export type CategoriaPainel = { id: string; slug: string; nome: string; ordem: number }

const COLUNAS = [
  'id, slug, nome, subtitulo, descricao, medidas, disponibilidade, prazo_dias, fixado, status, ordem',
  'meta_titulo, meta_descricao',
  'categorias!inner(id, slug, nome, ordem)',
  'variacoes(id, nome, preco_centavos, preco_cheio_centavos, precos_tecido, ordem)',
  'midias(id, tipo, larguras, largura, altura, alt, foco_x, foco_y, ordem)',
].join(', ')

type LinhaMidia = {
  id: string
  tipo: 'foto' | 'video'
  larguras: number[]
  largura: number
  altura: number
  alt: string
  foco_x: number
  foco_y: number
  ordem: number
}

type Linha = {
  id: string
  slug: string
  nome: string
  subtitulo: string
  descricao: string
  medidas: Record<string, unknown> | null
  disponibilidade: ProdutoPainel['disponibilidade']
  prazo_dias: number | null
  fixado: number | null
  status: ProdutoPainel['status']
  ordem: number
  meta_titulo: string | null
  meta_descricao: string | null
  categorias: { id: string; slug: string; nome: string; ordem: number }
  variacoes: {
    id: string
    nome: string | null
    preco_centavos: number | null
    preco_cheio_centavos: number | null
    precos_tecido: Partial<Record<LinhaTecido, number>> | null
    ordem: number
  }[]
  midias: LinhaMidia[]
}

function paraMidia(produtoId: string, m: LinhaMidia): MidiaPainel {
  const larguras = [...m.larguras].sort((a, b) => a - b)
  const capa = urlFoto(produtoId, m.id, larguras.includes(960) ? 960 : (larguras.at(-1) ?? m.largura))
  return {
    id: m.id,
    tipo: m.tipo,
    src: m.tipo === 'video' ? urlVideo(produtoId, m.id) : capa,
    largura: m.largura,
    altura: m.altura,
    alt: m.alt,
    focoX: m.foco_x,
    focoY: m.foco_y,
    ordem: m.ordem,
    capa: m.tipo === 'video' ? capa : null,
  }
}

function paraProduto(l: Linha): ProdutoPainel {
  return {
    id: l.id,
    slug: l.slug,
    nome: l.nome,
    subtitulo: l.subtitulo,
    descricao: l.descricao,
    medidas: l.medidas ?? {},
    disponibilidade: l.disponibilidade,
    prazoDias: l.prazo_dias,
    fixado: l.fixado,
    status: l.status,
    ordem: l.ordem,
    metaTitulo: l.meta_titulo,
    metaDescricao: l.meta_descricao,
    categoria: { id: l.categorias.id, slug: l.categorias.slug, nome: l.categorias.nome },
    variacoes: [...l.variacoes]
      .sort((a, b) => a.ordem - b.ordem)
      .map((v) => ({
        id: v.id,
        nome: v.nome,
        precoCentavos: v.preco_centavos,
        precoCheioCentavos: v.preco_cheio_centavos,
        precosTecido: v.precos_tecido,
      })),
    midias: [...l.midias].sort((a, b) => a.ordem - b.ordem).map((m) => paraMidia(l.id, m)),
  }
}

/** Todos os sofás, na ordem da loja: categoria, depois a ordem do painel. */
export async function listarProdutosPainel(): Promise<ProdutoPainel[]> {
  const { supabase } = await exigirAdmin()
  const { data, error } = await supabase.from('produtos').select(COLUNAS).order('ordem')
  if (error) throw new Error(`Não consegui ler os sofás: ${error.message}`)

  return ((data ?? []) as unknown as Linha[])
    .map(paraProduto)
    .sort(
      (a, b) =>
        a.categoria.nome.localeCompare(b.categoria.nome, 'pt-BR') ||
        a.ordem - b.ordem ||
        a.nome.localeCompare(b.nome, 'pt-BR'),
    )
}

export async function buscarProdutoPainel(id: string): Promise<ProdutoPainel | null> {
  const { supabase } = await exigirAdmin()
  const { data, error } = await supabase.from('produtos').select(COLUNAS).eq('id', id).maybeSingle()
  if (error) throw new Error(`Não consegui ler o sofá: ${error.message}`)
  return data ? paraProduto(data as unknown as Linha) : null
}

export async function listarCategoriasPainel(): Promise<CategoriaPainel[]> {
  const { supabase } = await exigirAdmin()
  const { data, error } = await supabase.from('categorias').select('id, slug, nome, ordem').order('ordem')
  if (error) throw new Error(`Não consegui ler as categorias: ${error.message}`)
  return (data ?? []) as CategoriaPainel[]
}

export type ConfiguracoesPainel = {
  whatsapp: string
  instagram: string
  textoEntrega: string
  parcelas: number | null
  avisoTexto: string
  avisoAtivo: boolean
}

export async function lerConfiguracoesPainel(): Promise<ConfiguracoesPainel> {
  const { supabase } = await exigirAdmin()
  const { data, error } = await supabase
    .from('configuracoes')
    .select('whatsapp, instagram, texto_entrega, parcelas, aviso_texto, aviso_ativo')
    .maybeSingle()
  if (error) throw new Error(`Não consegui ler as configurações: ${error.message}`)

  return {
    whatsapp: data?.whatsapp ?? '',
    instagram: data?.instagram ?? '',
    textoEntrega: data?.texto_entrega ?? '',
    parcelas: data?.parcelas ?? null,
    avisoTexto: data?.aviso_texto ?? '',
    avisoAtivo: data?.aviso_ativo ?? false,
  }
}

/** Quantos toques no WhatsApp cada sofá teve nos últimos 30 dias. */
export async function contarInteresses(): Promise<Map<string, number>> {
  const { supabase } = await exigirAdmin()
  const { data, error } = await supabase.rpc('ranking_procura', { p_dias: 30 })
  if (error) return new Map()
  return new Map(((data ?? []) as { produto_id: string; pedidos: number }[]).map((r) => [r.produto_id, Number(r.pedidos)]))
}
