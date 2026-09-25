/**
 * Sobe o vídeo de um sofá daqui, sem o painel: pra quando a Edna manda vídeo
 * pelo WhatsApp e o Felipe sobe de uma vez.
 *
 *   node --env-file=.env.local scripts/subir-video.mjs <slug> "<video.mp4>"
 *   node --env-file=.env.local scripts/subir-video.mjs <slug> "<video.mp4>" --segundo 3 --substituir
 *
 * Faz o mesmo que o painel (src/components/painel/Midias.tsx): o mp4 vai como
 * veio pro bucket "midias", a capa é um quadro do próprio vídeo em 480, 960 e
 * 1440 px (só as que cabem na largura do vídeo) mais o borrão, e a linha entra
 * na tabela midias. A máquina não tem ffmpeg, então o quadro sai do Edge
 * (puppeteer-core) com canvas, como no navegador da Edna.
 *
 * --segundo N  quadro da capa (padrão: 1 s, o primeiro costuma ser preto)
 * --substituir apaga o vídeo que o sofá já tem (o banco só aceita um por sofá)
 *
 * O site guarda o catálogo em cache por 5 minutos: o vídeo aparece depois disso.
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const [slug, arquivo] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--segundo'))
const indiceSegundo = args.indexOf('--segundo')
const segundo = indiceSegundo === -1 ? null : Number(args[indiceSegundo + 1])
const substituir = args.includes('--substituir')

if (!slug || !arquivo || !existsSync(arquivo) || !arquivo.toLowerCase().endsWith('.mp4')) {
  console.error('Uso: subir-video.mjs <slug> "<video.mp4>" [--segundo N] [--substituir]')
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
if (statSync(arquivo).size > MAX_BYTES) throw new Error('Vídeo acima de 50 MB')

const supabase = createClient(url, chave)
const { data: produto, error: erroProduto } = await supabase.from('produtos').select('id, nome').eq('slug', slug).maybeSingle()
if (erroProduto || !produto) throw new Error(`Sofá "${slug}" não encontrado`)

const { data: antigo } = await supabase
  .from('midias')
  .select('id, larguras')
  .eq('produto_id', produto.id)
  .eq('tipo', 'video')
  .maybeSingle()
if (antigo && !substituir) throw new Error(`${produto.nome} já tem vídeo. Use --substituir pra trocar.`)

/** Um quadro do vídeo em PNG, na largura original, tirado pelo Edge. */
async function tirarQuadro() {
  const tamanho = statSync(arquivo).size
  // O Edge só pinta vídeo de mesma origem no canvas: um servidor de um arquivo só
  const servidor = createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html' })
      return res.end('<!doctype html><body></body>')
    }
    const faixa = req.headers.range?.match(/bytes=(\d+)-(\d*)/)
    const ini = faixa ? Number(faixa[1]) : 0
    const fim = faixa?.[2] ? Number(faixa[2]) : tamanho - 1
    res.writeHead(faixa ? 206 : 200, {
      'content-type': 'video/mp4',
      'accept-ranges': 'bytes',
      'content-length': fim - ini + 1,
      ...(faixa ? { 'content-range': `bytes ${ini}-${fim}/${tamanho}` } : {}),
    })
    createReadStream(arquivo, { start: ini, end: fim }).pipe(res)
  })
  await new Promise((pronto) => servidor.listen(0, pronto))
  const porta = servidor.address().port

  const edge = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ].find(existsSync)
  const navegador = await puppeteer.launch({ executablePath: edge, headless: true })
  try {
    const pagina = await navegador.newPage()
    await pagina.goto(`http://localhost:${porta}/`)
    return await pagina.evaluate(async (segundoPedido) => {
      const video = document.createElement('video')
      video.muted = true
      video.preload = 'auto'
      video.src = '/video.mp4'
      await new Promise((ok, erro) => {
        video.onloadeddata = ok
        video.onerror = () => erro(new Error('O Edge não abriu esse vídeo'))
      })
      video.currentTime = segundoPedido ?? Math.min(1, (video.duration || 2) / 2)
      await new Promise((ok) => (video.onseeked = ok))
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      return {
        png: canvas.toDataURL('image/png'),
        largura: video.videoWidth,
        altura: video.videoHeight,
        duracao: video.duration,
      }
    }, segundo)
  } finally {
    await navegador.close()
    servidor.close()
  }
}

const quadro = await tirarQuadro()
const png = Buffer.from(quadro.png.split(',')[1], 'base64')

// As mesmas regras do gerarVersoes do painel: não estica, e vídeo estreito sobe na largura dele como "480"
const alvos = LARGURAS.filter((l) => l <= quadro.largura)
if (!alvos.length) alvos.push(LARGURAS[0])
const proporcao = quadro.altura / quadro.largura
const versoes = []
for (const alvo of alvos) {
  const largura = Math.min(alvo, quadro.largura)
  versoes.push({ alvo, buffer: await sharp(png).resize({ width: largura }).webp({ quality: 82 }).toBuffer() })
}
const maior = Math.min(alvos.at(-1), quadro.largura)
const borrao = await sharp(png).resize({ width: 20 }).webp({ quality: 40 }).toBuffer()
const blur = `data:image/webp;base64,${borrao.toString('base64')}`
const duracao = Math.round(quadro.duracao)

const storage = supabase.storage.from(BUCKET)
const midiaId = randomUUID()
const enviar = async (caminho, corpo, tipo) => {
  const { error } = await storage.upload(caminho, corpo, { contentType: tipo, upsert: false })
  if (error) throw new Error(`Não subiu ${caminho}: ${error.message}`)
}

if (antigo) {
  const { error } = await supabase.from('midias').delete().eq('id', antigo.id)
  if (error) throw new Error(`Não apagou o vídeo antigo: ${error.message}`)
  await storage.remove([`${produto.id}/${antigo.id}.mp4`, ...antigo.larguras.map((l) => `${produto.id}/${antigo.id}-${l}.webp`)])
}

await enviar(`${produto.id}/${midiaId}.mp4`, readFileSync(arquivo), 'video/mp4')
for (const v of versoes) await enviar(`${produto.id}/${midiaId}-${v.alvo}.webp`, v.buffer, 'image/webp')

const { count } = await supabase.from('midias').select('id', { count: 'exact', head: true }).eq('produto_id', produto.id)
const { error: erroLinha } = await supabase.from('midias').insert({
  id: midiaId,
  produto_id: produto.id,
  tipo: 'video',
  larguras: alvos,
  largura: maior,
  altura: Math.round(maior * proporcao),
  blur: blur.length <= 4000 ? blur : null,
  alt: `Vídeo do ${produto.nome}`,
  foco_x: 50,
  foco_y: 50,
  duracao_segundos: duracao > 0 ? Math.min(duracao, 600) : null,
  ordem: count ?? 0,
})
if (erroLinha) {
  await storage.remove([`${produto.id}/${midiaId}.mp4`, ...alvos.map((l) => `${produto.id}/${midiaId}-${l}.webp`)])
  throw new Error(`Não gravou a linha: ${erroLinha.message}`)
}

console.log(
  `ok ${produto.nome}: ${path.basename(arquivo)} · ${quadro.largura}x${quadro.altura} · ${duracao} s · capa em ${alvos.join(', ')}`,
)
