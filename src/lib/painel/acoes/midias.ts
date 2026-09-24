'use server'

import { randomUUID } from 'node:crypto'
import { atualizarCatalogo } from '@/lib/painel/loja'
import { exigirAdmin } from '@/lib/painel/sessao'
import { clienteAdmin } from '@/lib/supabase/admin'

/*
 * Fotos e vídeo do sofá.
 *
 * O arquivo sobe do navegador direto pro Storage, por link assinado: a Vercel
 * recusa qualquer coisa acima de 4,5 MB passando pelo servidor, e vídeo de
 * sofá passa disso fácil. O servidor só assina o link (depois de conferir que
 * é a Edna) e, quando o arquivo já está lá, grava a linha na tabela.
 *
 * Nenhum caminho é inventado aqui: o arquivo mora em <produto>/<midia>-<largura>.webp
 * e o vídeo em <produto>/<midia>.mp4, como a migração documenta. Por isso o id
 * da mídia nasce aqui, antes do upload, e volta na hora de gravar.
 *
 * Se o navegador cair entre o upload e o gravar, sobra arquivo sem linha no
 * banco. Não aparece no site e não atrapalha; o espaço é ninharia perto do
 * limite do plano grátis.
 */

export type LinkUpload = { largura: number | null; caminho: string; url: string; token: string }
export type PreparoUpload = { midiaId: string; links: LinkUpload[] }

const BUCKET = 'midias'
const LARGURAS_OK = [480, 960, 1440]

/** Assina os links de upload de uma foto (uma largura por link) ou de um vídeo. */
export async function prepararUpload(
  produtoId: string,
  tipo: 'foto' | 'video',
  larguras: number[],
): Promise<PreparoUpload> {
  const { supabase } = await exigirAdmin()

  // O produto tem que existir e ser visível pra ela (RLS confere de novo)
  const { data: produto } = await supabase.from('produtos').select('id').eq('id', produtoId).maybeSingle()
  if (!produto) throw new Error('Sofá não encontrado.')

  const pedidas = larguras.filter((l) => LARGURAS_OK.includes(l))
  if (!pedidas.length) throw new Error('Tamanho de foto inválido.')

  const midiaId = randomUUID()
  const storage = clienteAdmin().storage.from(BUCKET)

  const caminhos =
    tipo === 'video'
      ? [{ largura: null, caminho: `${produtoId}/${midiaId}.mp4` }, ...pedidas.map((l) => ({ largura: l, caminho: `${produtoId}/${midiaId}-${l}.webp` }))]
      : pedidas.map((l) => ({ largura: l, caminho: `${produtoId}/${midiaId}-${l}.webp` }))

  const links: LinkUpload[] = []
  for (const { largura, caminho } of caminhos) {
    const { data, error } = await storage.createSignedUploadUrl(caminho)
    if (error || !data) throw new Error(`Não consegui preparar o envio: ${error?.message ?? 'sem resposta'}`)
    links.push({ largura, caminho, url: data.signedUrl, token: data.token })
  }

  return { midiaId, links }
}

type DadosMidia = {
  produtoId: string
  midiaId: string
  tipo: 'foto' | 'video'
  larguras: number[]
  largura: number
  altura: number
  blur: string | null
  alt: string
  duracaoSegundos?: number | null
}

/** Arquivo já no Storage: grava a linha e a foto passa a aparecer no site. */
export async function concluirMidia(dados: DadosMidia) {
  const { supabase } = await exigirAdmin()

  const larguras = dados.larguras.filter((l) => LARGURAS_OK.includes(l))
  if (!larguras.length) throw new Error('Tamanho de foto inválido.')
  if (!Number.isInteger(dados.largura) || !Number.isInteger(dados.altura)) throw new Error('Medida da foto inválida.')

  // A foto nova entra por último; a primeira da lista é a capa do sofá
  const { count } = await supabase
    .from('midias')
    .select('id', { count: 'exact', head: true })
    .eq('produto_id', dados.produtoId)

  const { error } = await supabase.from('midias').insert({
    id: dados.midiaId,
    produto_id: dados.produtoId,
    tipo: dados.tipo,
    larguras,
    largura: dados.largura,
    altura: dados.altura,
    blur: dados.blur && dados.blur.length <= 4000 ? dados.blur : null,
    alt: dados.alt.slice(0, 200),
    // O sofá costuma ficar um pouco abaixo do meio da foto
    foco_x: 50,
    foco_y: dados.tipo === 'foto' ? 58 : 50,
    duracao_segundos: dados.tipo === 'video' ? (dados.duracaoSegundos ?? null) : null,
    ordem: count ?? 0,
  })
  if (error) throw new Error(`Não consegui salvar a foto: ${error.message}`)

  atualizarCatalogo()
}

/** Apaga a linha e os arquivos dela no Storage. */
export async function excluirMidia(midiaId: string) {
  const { supabase } = await exigirAdmin()

  const { data: midia } = await supabase
    .from('midias')
    .select('id, produto_id, tipo, larguras')
    .eq('id', midiaId)
    .maybeSingle()
  if (!midia) return

  const { error } = await supabase.from('midias').delete().eq('id', midiaId)
  if (error) throw new Error(`Não consegui apagar: ${error.message}`)

  const arquivos = (midia.larguras as number[]).map((l) => `${midia.produto_id}/${midia.id}-${l}.webp`)
  if (midia.tipo === 'video') arquivos.push(`${midia.produto_id}/${midia.id}.mp4`)
  await clienteAdmin().storage.from(BUCKET).remove(arquivos)

  atualizarCatalogo()
}

/** A foto escolhida vira a capa: a primeira da lista, no card e na galeria. */
export async function definirCapa(midiaId: string) {
  const { supabase } = await exigirAdmin()

  const { data: midia } = await supabase.from('midias').select('id, produto_id').eq('id', midiaId).maybeSingle()
  if (!midia) return

  const { data: irmas } = await supabase
    .from('midias')
    .select('id, ordem')
    .eq('produto_id', midia.produto_id)
    .order('ordem')

  const ordenadas = [midiaId, ...(irmas ?? []).map((m) => m.id).filter((id) => id !== midiaId)]
  for (const [i, id] of ordenadas.entries()) {
    await supabase.from('midias').update({ ordem: i }).eq('id', id)
  }

  atualizarCatalogo()
}
