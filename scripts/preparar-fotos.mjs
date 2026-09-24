/**
 * Prepara as imagens do site a partir dos arquivos que a Edna mandou
 * (sites/070 - Nobre Estofados/Recursos Site).
 *
 *   node scripts/preparar-fotos.mjs
 *
 * 1. Fotos dos produtos (páginas do catálogo 26/27): corta a faixa cinza de
 *    baixo (logo, nome e medidas) e gera webp em 480, 960 e 1600 px, mais um
 *    borrão de 20 px que aparece enquanto a foto carrega. Saem em
 *    public/semente/fotos/ e as medidas em semente/fotos.json. São as fotos
 *    provisórias: quando o Supabase entrar, o scripts/semear.mjs sobe estas
 *    mesmas para o Storage e a pasta public/semente sai do projeto.
 * 2. Imagens fixas do site (hero, banner, Edna) em public/imagens/.
 * 3. Logo em marrom, tirado da capa do catálogo (o logo inteiro em alta, com
 *    o nome), e o ícone do site com o monograma.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const recursos = path.resolve(raiz, '../070 - Nobre Estofados/Recursos Site')
const catalogoDir = path.join(recursos, 'Catálogo 26 27 -  Nobre Estofados')
const paginaCatalogo = (n) => path.join(catalogoDir, `Catálogo 26 27 -  Nobre Estofados-imagens-${n}.jpg`)

const saidaFotos = path.join(raiz, 'public/semente/fotos')
const saidaImagens = path.join(raiz, 'public/imagens')
mkdirSync(saidaFotos, { recursive: true })
mkdirSync(saidaImagens, { recursive: true })

/** Altura útil das páginas do catálogo: abaixo disso é a faixa cinza com o nome. */
const ALTURA_SEM_FAIXA = 2195
const LARGURAS_PRODUTO = [480, 960, 1600]
const MARROM = { r: 0x3a, g: 0x29, b: 0x20 }

async function borrao(entrada) {
  const buffer = await sharp(entrada).resize({ width: 20 }).webp({ quality: 40 }).toBuffer()
  return `data:image/webp;base64,${buffer.toString('base64')}`
}

/** Gera uma largura por arquivo, sem nunca aumentar a imagem. */
async function larguras(entrada, larguraOriginal, lista, destino, qualidade = 78) {
  const feitas = []
  for (const largura of lista.filter((l) => l <= larguraOriginal)) {
    await sharp(entrada).resize({ width: largura }).webp({ quality: qualidade, effort: 5 }).toFile(destino(largura))
    feitas.push(largura)
  }
  return feitas
}

// 1. Produtos ---------------------------------------------------------------

const { produtos } = JSON.parse(readFileSync(path.join(raiz, 'semente/catalogo.json'), 'utf8'))
const fotos = {}

for (const produto of produtos) {
  const recorte = await sharp(paginaCatalogo(produto.pagina))
    .extract({ left: 0, top: 0, width: 3510, height: ALTURA_SEM_FAIXA })
    .toBuffer()
  const feitas = await larguras(recorte, 3510, LARGURAS_PRODUTO, (l) => path.join(saidaFotos, `${produto.slug}-${l}.webp`))
  const maior = feitas.at(-1)
  fotos[produto.slug] = {
    larguras: feitas,
    largura: maior,
    altura: Math.round((maior * ALTURA_SEM_FAIXA) / 3510),
    blur: await borrao(recorte),
  }
  console.log(`produto ${produto.slug}`)
}

writeFileSync(path.join(raiz, 'semente/fotos.json'), `${JSON.stringify(fotos, null, 2)}\n`)

// 2. Imagens fixas ----------------------------------------------------------

const heroDesktop = path.join(recursos, 'DESKTOP/IMAGEM HERO DESKTOP.png')
const heroMobile = path.join(recursos, 'MOBILE/IMAGEM HERO.png')
await larguras(heroDesktop, 1672, [960, 1440, 1672], (l) => path.join(saidaImagens, `hero-desktop-${l}.webp`), 80)
await larguras(heroMobile, 941, [480, 720, 941], (l) => path.join(saidaImagens, `hero-mobile-${l}.webp`), 80)
console.log('hero')

// Banner: o Canto Chaise Veneza (página 13), sem a faixa e com o sofá inteiro. A
// parede escura e as luminárias acesas são o mais perto da sala do mockup, e a
// frase em serifada lê bem sobre a parede. (O Milão, bege, foi testado: a foto é
// fechada no sofá e a frase branca some sobre o tecido.)
const banner = await sharp(paginaCatalogo(13)).extract({ left: 600, top: 480, width: 2910, height: 1715 }).toBuffer()
await larguras(banner, 2910, [960, 1600], (l) => path.join(saidaImagens, `banner-${l}.webp`))
console.log('banner')

// Edna: o arquivo veio de um post, com "Feliz Dia do Cliente" no canto direito.
// O recorte fica à esquerda do texto e mantém o letreiro da loja atrás dela.
await sharp(path.join(recursos, '03 - EDNA - SOBRE.png'))
  .extract({ left: 0, top: 0, width: 312, height: 470 })
  .webp({ quality: 86 })
  .toFile(path.join(saidaImagens, 'edna.webp'))
console.log('edna')

// Imagem de compartilhamento (WhatsApp, Facebook): o hero em 1200 x 630
await sharp(heroDesktop)
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'right' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(raiz, 'src/app/opengraph-image.jpg'))
console.log('opengraph')

// 3. Logo -------------------------------------------------------------------

/**
 * Capa do catálogo: logo branco sobre cinza liso (#666). O brilho de cada
 * pixel vira a transparência e a cor passa a ser o marrom da marca.
 */
async function logoMarrom({ left, top, width, height }, larguraFinal) {
  const { data, info } = await sharp(paginaCatalogo(0))
    .extract({ left, top, width, height })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < info.width * info.height; i++) {
    const alfa = Math.max(0, Math.min(1, (data[i] - 118) / (245 - 118)))
    rgba[i * 4] = MARROM.r
    rgba[i * 4 + 1] = MARROM.g
    rgba[i * 4 + 2] = MARROM.b
    rgba[i * 4 + 3] = Math.round(alfa * 255)
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width: larguraFinal })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer({ resolveWithObject: true })
}

const logo = await logoMarrom({ left: 470, top: 900, width: 2560, height: 820 }, 480)
writeFileSync(path.join(saidaImagens, 'logo-nobre.png'), logo.data)
console.log(`logo ${logo.info.width}x${logo.info.height}`)

// Ícone: só o monograma, centrado num quadrado creme
const monograma = await logoMarrom({ left: 470, top: 900, width: 880, height: 820 }, 512)

async function icone(lado) {
  const margem = Math.round(lado * 0.12)
  const miolo = await sharp(monograma.data)
    .resize(lado - margem * 2, lado - margem * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  return sharp({ create: { width: lado, height: lado, channels: 4, background: '#F3EFE7' } })
    .composite([{ input: miolo, gravity: 'center' }])
    .png()
    .toBuffer()
}

writeFileSync(path.join(raiz, 'src/app/icon.png'), await icone(512))
writeFileSync(path.join(raiz, 'src/app/apple-icon.png'), await icone(180))
console.log('ícones')
