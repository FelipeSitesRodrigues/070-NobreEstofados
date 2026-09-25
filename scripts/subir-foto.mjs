/**
 * Sobe fotos de um sofá daqui, sem o painel: pra quando a Edna manda foto pelo
 * WhatsApp e o Felipe sobe de uma vez. Par do scripts/subir-video.mjs.
 *
 *   node --env-file=.env.local scripts/subir-foto.mjs <slug> "<foto.jpg>" ["<outra.jpg>" ...] [--alt "texto"]
 *
 * Faz o mesmo que o painel (src/components/painel/Midias.tsx): 480, 960 e 1440
 * px em WebP (só as que cabem na largura da foto), borrão de 20 px e a linha na
 * tabela midias. A foto entra no fim da galeria; a capa do sofá não muda (no
 * painel, a estrela troca a capa).
 *
 * --alt   descrição da foto pro leitor de tela e pro Google. Sem ela, vale a
 *         do painel: "<nome do sofá> da Nobre Estofados".
 * --capa  a primeira foto enviada vira a capa (a estrela do painel); a capa
 *         antiga passa pra segunda posição.
 *
 * O site guarda o catálogo em cache por 5 minutos: a foto aparece depois disso.
 */
import { existsSync, statSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const indiceAlt = args.indexOf('--alt')
const alt = indiceAlt === -1 ? null : args[indiceAlt + 1]
const virarCapa = args.includes('--capa')
const soltos = args.filter((a, i) => a !== '--capa' && (indiceAlt === -1 || (i !== indiceAlt && i !== indiceAlt + 1)))
const [slug, ...fotos] = soltos

if (!slug || !fotos.length || fotos.some((f) => !existsSync(f))) {
  console.error('Uso: subir-foto.mjs <slug> "<foto.jpg>" [...] [--alt "texto"] [--capa]')
  process.exit(1)
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const chave = process.env.SUPABASE_SECRET_KEY
if (!url || !chave) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no .env.local')
  process.exit(1)
}

const BUCKET = 'midias'
const LARGURAS = [480, 960, 1440]
const MAX_BYTES = 50 * 1024 * 1024 // o mesmo limite do painel

const supabase = createClient(url, chave)
const storage = supabase.storage.from(BUCKET)
const { data: produto, error: erroProduto } = await supabase.from('produtos').select('id, nome').eq('slug', slug).maybeSingle()
if (erroProduto || !produto) throw new Error(`Sofá "${slug}" não encontrado`)

const enviadas = []
for (const foto of fotos) {
  if (statSync(foto).size > MAX_BYTES) throw new Error(`${foto} passa de 50 MB`)

  // rotate() sem argumento endireita pela orientação do celular (EXIF)
  const original = sharp(foto).rotate()
  const { width: largura, height: altura } = await original.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info)
  if (Math.min(largura, altura) < 300) throw new Error(`${foto} é pequena demais (${largura}x${altura})`)

  // As mesmas regras do gerarVersoes do painel: não estica, e foto estreita sobe na largura dela como "480"
  const alvos = LARGURAS.filter((l) => l <= largura)
  if (!alvos.length) alvos.push(LARGURAS[0])
  const maior = Math.min(alvos.at(-1), largura)
  const borrao = await original.clone().resize({ width: 20 }).webp({ quality: 40 }).toBuffer()
  const blur = `data:image/webp;base64,${borrao.toString('base64')}`

  const midiaId = randomUUID()
  enviadas.push(midiaId)
  for (const alvo of alvos) {
    const corpo = await original.clone().resize({ width: Math.min(alvo, largura) }).webp({ quality: 82 }).toBuffer()
    const { error } = await storage.upload(`${produto.id}/${midiaId}-${alvo}.webp`, corpo, { contentType: 'image/webp', upsert: false })
    if (error) throw new Error(`Não subiu ${path.basename(foto)} em ${alvo}: ${error.message}`)
  }

  const { count } = await supabase.from('midias').select('id', { count: 'exact', head: true }).eq('produto_id', produto.id)
  const { error: erroLinha } = await supabase.from('midias').insert({
    id: midiaId,
    produto_id: produto.id,
    tipo: 'foto',
    larguras: alvos,
    largura: maior,
    altura: Math.round((maior * altura) / largura),
    blur: blur.length <= 4000 ? blur : null,
    alt: (alt ?? `${produto.nome} da Nobre Estofados`).slice(0, 200),
    // O sofá costuma ficar um pouco abaixo do meio da foto (o mesmo do painel)
    foco_x: 50,
    foco_y: 58,
    ordem: count ?? 0,
  })
  if (erroLinha) {
    await storage.remove(alvos.map((l) => `${produto.id}/${midiaId}-${l}.webp`))
    throw new Error(`Não gravou a linha: ${erroLinha.message}`)
  }

  console.log(`ok ${produto.nome}: ${path.basename(foto)} · ${largura}x${altura} · ${alvos.join(', ')} · posição ${(count ?? 0) + 1}`)
}

// --capa: a primeira foto enviada vai pra frente, o resto segue na ordem em que estava
if (virarCapa && enviadas.length) {
  const { data: todas } = await supabase.from('midias').select('id').eq('produto_id', produto.id).order('ordem')
  const ordem = [enviadas[0], ...(todas ?? []).map((m) => m.id).filter((id) => id !== enviadas[0])]
  for (const [i, id] of ordem.entries()) {
    const { error } = await supabase.from('midias').update({ ordem: i }).eq('id', id)
    if (error) throw new Error(`Não trocou a capa: ${error.message}`)
  }
  console.log(`capa do ${produto.nome} trocada`)
}
