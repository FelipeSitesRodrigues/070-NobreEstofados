/**
 * Bolinhas de tecido a partir do Mostruário 26/27 da Nobre.
 *
 *   node scripts/preparar-tecidos.mjs
 *
 * Lê as páginas de "Recursos Site/Mostruário 26 27 - Nobre Estofados" (uma
 * amostra por página, com a referência na faixa cinza embaixo) e gera:
 *   public/tecidos/<ref>-96.webp    a bolinha (48 px na tela, em dobro; recorte perto, pra ver a trama)
 *   public/tecidos/<ref>-480.webp   a amostra maior, da cor escolhida
 *   src/lib/catalogo/tecidos.json   a lista que o site usa
 *
 * As referências não são lidas da imagem: estão na lista abaixo, na ordem das
 * páginas (conferidas a olho em 2026-09-23). Mostruário novo = lista nova.
 *
 * A linha define o preço, igual à tabela da fábrica: Veludo (100), Linho (300)
 * e Premium (500, que mistura veludo e linho e é a coluna "Linho 500").
 */
import sharp from 'sharp'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const recursos = path.resolve(raiz, '..', '070 - Nobre Estofados', 'Recursos Site')
const pasta = path.join(recursos, readdirSync(recursos).find((n) => n.startsWith('Mostru')))

// Página 1 é a capa. Da 2 em diante, uma referência por página.
const REFERENCIAS = [
  ...[102, 103, 105, 107, 108, 110, 111, 112, 113, 114, 115, 116, 117, 120, 124, 126].map((n) => ['veludo', `Veludo ${n}`]),
  ...[302, 303, 304, 305, 306, 308, 311, 312, 313, 314].map((n) => ['linho', `Linho ${n}`]),
  ...[501, 502, 503, 504, 505, 506, 507].map((n) => ['premium', `Veludo Premium ${n}`]),
  ...[508, 509, 510, 511].map((n) => ['premium', `Linho Premium ${n}`]),
]

const paginas = readdirSync(pasta)
  .filter((n) => n.endsWith('.jpg'))
  .sort()
  .slice(1)

if (paginas.length !== REFERENCIAS.length) {
  console.error(`O mostruário tem ${paginas.length} amostras e a lista tem ${REFERENCIAS.length}. Confira a lista.`)
  process.exit(1)
}

const saida = path.join(raiz, 'public', 'tecidos')
mkdirSync(saida, { recursive: true })

const cores = []
for (const [i, [linha, nome]] of REFERENCIAS.entries()) {
  const arquivo = path.join(pasta, paginas[i])
  const { width, height } = await sharp(arquivo).metadata()
  // A textura ocupa tudo acima da faixa cinza (os 11% de baixo)
  const alturaTextura = Math.round(height * 0.89)
  const quadrado = (lado) => ({
    left: Math.round((width - lado) / 2),
    top: Math.round((alturaTextura - lado) / 2),
    width: lado,
    height: lado,
  })

  const codigo = nome.toLowerCase().replace(/\s+/g, '-')
  // Bolinha: recorte perto, senão a trama some e vira só uma cor lisa
  await sharp(arquivo).extract(quadrado(420)).resize(96, 96).webp({ quality: 72 }).toFile(path.join(saida, `${codigo}-96.webp`))
  await sharp(arquivo).extract(quadrado(900)).resize(480, 480).webp({ quality: 72 }).toFile(path.join(saida, `${codigo}-480.webp`))

  // Cor média: aparece no lugar da foto enquanto ela carrega
  const { dominant } = await sharp(arquivo).extract(quadrado(900)).stats()
  const hex = `#${[dominant.r, dominant.g, dominant.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`

  cores.push({ codigo, nome, linha, fundo: hex })
}

writeFileSync(path.join(raiz, 'src', 'lib', 'catalogo', 'tecidos.json'), `${JSON.stringify(cores, null, 2)}\n`)
console.log(`${cores.length} tecidos: ${['veludo', 'linho', 'premium'].map((l) => `${cores.filter((c) => c.linha === l).length} ${l}`).join(', ')}`)
