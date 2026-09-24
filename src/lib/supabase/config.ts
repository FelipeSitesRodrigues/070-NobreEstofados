/*
 * Endereço e chave pública do Supabase. As duas vão pro navegador de qualquer
 * jeito (é o papel delas): quem protege os dados são as regras do banco (RLS),
 * não o segredo da chave. A chave secreta nunca entra aqui.
 */

function exigir(nome: string, valor: string | undefined) {
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}. Confira o .env.local.`)
  return valor
}

export const SUPABASE_URL = exigir('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)

export const SUPABASE_CHAVE_PUBLICA = exigir(
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)

/** Pasta pública das fotos e vídeos no Storage. */
export const URL_MIDIAS = `${SUPABASE_URL}/storage/v1/object/public/midias`

/*
 * Nenhum caminho é gravado no banco: o arquivo sai dos ids (ver a tabela
 * midias na migração).
 *   foto:  <produto>/<midia>-<largura>.webp
 *   vídeo: <produto>/<midia>.mp4
 */
export const urlFoto = (produtoId: string, midiaId: string, largura: number) =>
  `${URL_MIDIAS}/${produtoId}/${midiaId}-${largura}.webp`

export const urlVideo = (produtoId: string, midiaId: string) => `${URL_MIDIAS}/${produtoId}/${midiaId}.mp4`
