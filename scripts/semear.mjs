/**
 * Sobe o catálogo 26/27 para o Supabase: categorias, produtos, uma variação
 * sem preço por produto e a foto de cada um, nas três larguras.
 *
 *   node scripts/preparar-fotos.mjs        (gera as fotos, se ainda não gerou)
 *   node --env-file=.env.local scripts/semear.mjs
 *
 * Pode rodar mais de uma vez: categoria e produto são atualizados pelo slug,
 * e variação e foto só entram se o produto ainda não tem. Preço fica vazio
 * (a Edna preenche no painel) e todo produto entra ativo.
 */
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const chave = process.env.SUPABASE_SECRET_KEY
if (!url || !chave) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no .env.local')
  process.exit(1)
}

const sb = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
const ler = (arquivo) => JSON.parse(readFileSync(path.join(raiz, arquivo), 'utf8'))
const { categorias, produtos } = ler('semente/catalogo.json')
const fotos = ler('semente/fotos.json')

const falhar = (onde, erro) => {
  console.error(`${onde}: ${erro.message}`)
  process.exit(1)
}

const { data: gravadas, error: erroCategorias } = await sb
  .from('categorias')
  .upsert(categorias.map(({ slug, nome, descricao, ordem }) => ({ slug, nome, descricao: descricao ?? '', ordem })), { onConflict: 'slug' })
  .select('id, slug')
if (erroCategorias) falhar('categorias', erroCategorias)
const idCategoria = new Map(gravadas.map((c) => [c.slug, c.id]))
console.log(`${gravadas.length} categorias`)

for (const p of produtos) {
  const { data: produto, error } = await sb
    .from('produtos')
    .upsert(
      {
        slug: p.slug,
        nome: p.nome,
        categoria_id: idCategoria.get(p.categoria),
        subtitulo: p.subtitulo,
        descricao: p.descricao,
        medidas: p.medidas,
        fixado: p.fixado ?? null,
        status: 'ativo',
        ordem: p.ordem,
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single()
  if (error) falhar(p.slug, error)

  const { count: variacoes } = await sb.from('variacoes').select('id', { count: 'exact', head: true }).eq('produto_id', produto.id)
  if (!variacoes) {
    const { error: erroVariacao } = await sb.from('variacoes').insert({ produto_id: produto.id, nome: null, preco_centavos: null })
    if (erroVariacao) falhar(`${p.slug} variação`, erroVariacao)
  }

  const { count: temFoto } = await sb
    .from('midias')
    .select('id', { count: 'exact', head: true })
    .eq('produto_id', produto.id)
    .eq('tipo', 'foto')
  if (!temFoto) {
    const foto = fotos[p.slug]
    const midia = randomUUID()
    for (const largura of foto.larguras) {
      const arquivo = readFileSync(path.join(raiz, 'public/semente/fotos', `${p.slug}-${largura}.webp`))
      const { error: erroUpload } = await sb.storage
        .from('midias')
        .upload(`${produto.id}/${midia}-${largura}.webp`, arquivo, { contentType: 'image/webp', cacheControl: '31536000' })
      if (erroUpload) falhar(`${p.slug} foto ${largura}`, erroUpload)
    }
    const { error: erroMidia } = await sb.from('midias').insert({
      id: midia,
      produto_id: produto.id,
      tipo: 'foto',
      larguras: foto.larguras,
      largura: foto.largura,
      altura: foto.altura,
      blur: foto.blur,
      alt: p.alt,
      // As fotos do catálogo têm o sofá um pouco abaixo do meio
      foco_y: 58,
    })
    if (erroMidia) falhar(`${p.slug} mídia`, erroMidia)
  }

  console.log(`produto ${p.slug}`)
}

console.log('Catálogo no Supabase.')
