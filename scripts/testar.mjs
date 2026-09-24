/**
 * Teste da loja no navegador de verdade, com animação LIGADA (como o visitante vê).
 *
 *   node scripts/testar.mjs [--base http://localhost:3070]
 *
 * Em cada página, no desktop e no celular:
 *   - rola na roda do mouse até o fim e confere se todo [data-revelar] apareceu
 *     (foto recortada que nunca dispara o observador fica em branco pra sempre;
 *     o print de revisão, com movimento reduzido, não mostra esse bug)
 *   - toda imagem carregou (nada de foto quebrada)
 *   - nada estoura na horizontal
 *   - todo link de WhatsApp é wa.me/<só dígitos>?text=<mensagem>
 *   - nenhum erro no console
 * Sai com código 1 se alguma coisa falhar.
 */
import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const i = process.argv.indexOf('--base')
const base = i > -1 ? process.argv[i + 1] : 'http://localhost:3070'
const ROTAS = ['/', '/loja', '/loja/sofas-de-canto', '/produto/sofa-porto-principe', '/produto/conjunto-roma', '/carrinho', '/politica-de-privacidade']
const TELAS = [
  { nome: 'desktop', width: 1440, height: 900 },
  { nome: 'celular', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
]

const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find((p) =>
  existsSync(p),
)
const navegador = await puppeteer.launch({ executablePath: EDGE, headless: 'new' })
const falhas = []

try {
  for (const tela of TELAS) {
    for (const rota of ROTAS) {
      const pagina = await navegador.newPage()
      const erros = []
      pagina.on('pageerror', (e) => erros.push(e.message))
      pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
      await pagina.setViewport(tela)
      await pagina.goto(base + rota, { waitUntil: 'networkidle2', timeout: 90000 })

      // Rola como gente: roda do mouse, devagar
      await pagina.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'))
      const altura = await pagina.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y < altura; y += 400) {
        await pagina.mouse.wheel({ deltaY: 400 })
        await new Promise((r) => setTimeout(r, 90))
      }
      await new Promise((r) => setTimeout(r, 1200))

      const r = await pagina.evaluate(() => ({
        // Elemento oculto nessa tela (display: none) nunca entra na vista e não conta
        escondidos: [...document.querySelectorAll('[data-revelar]:not(.revelado)')]
          .filter((el) => el.getClientRects().length > 0)
          .map((el) => el.className || el.tagName),
        quebradas: [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
        estouro: document.documentElement.scrollWidth - window.innerWidth,
        whatsapp: [...document.querySelectorAll('a[href*="wa.me"]')]
          .map((a) => a.href)
          .filter((href) => !/^https:\/\/wa\.me\/\d{10,13}\?text=.+/.test(href)),
      }))

      const nome = `${tela.nome} ${rota}`
      if (r.escondidos.length) falhas.push(`${nome}: ${r.escondidos.length} bloco(s) sem revelar (${r.escondidos.slice(0, 3).join(', ')})`)
      if (r.quebradas.length) falhas.push(`${nome}: imagem quebrada ${r.quebradas.slice(0, 3).join(', ')}`)
      if (r.estouro > 1) falhas.push(`${nome}: estoura ${r.estouro}px na horizontal`)
      if (r.whatsapp.length) falhas.push(`${nome}: link de WhatsApp malformado ${r.whatsapp[0]}`)
      if (erros.length) falhas.push(`${nome}: erro no console: ${erros[0].slice(0, 160)}`)
      console.log(`${falhas.some((f) => f.startsWith(nome)) ? 'FALHOU' : 'ok    '} ${nome}`)
      await pagina.close()
    }
  }
} finally {
  await navegador.close()
}

if (falhas.length) {
  console.log(`\n${falhas.length} problema(s):\n  ${falhas.join('\n  ')}`)
  process.exit(1)
}
console.log('\nTudo certo.')
