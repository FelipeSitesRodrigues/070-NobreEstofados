/**
 * Teste de ponta a ponta do painel da Nobre, contra o servidor de produção em 3071.
 *
 *   PAINEL_EMAIL=... PAINEL_SENHA=... node scripts/painel/testar-painel.mjs [pasta dos prints]
 *
 * Entra, muda um preço, confere a loja, sobe uma foto e confere os preços por
 * tecido. Mexe no banco DE VERDADE (é o mesmo da loja), então desfaz tudo no
 * fim: o preço volta ao que era e a foto de teste é apagada.
 *
 * O preço rápido só existe pra sofá de preço único (hoje, o Conjunto Roma): os
 * da tabela da fábrica têm três preços por tamanho e se editam na página deles.
 */
import puppeteer from 'puppeteer-core'
import { existsSync } from 'node:fs'

const BASE = 'http://localhost:3071'
const EMAIL = process.env.PAINEL_EMAIL
const SENHA = process.env.PAINEL_SENHA
const SAIDA = process.argv[2] ?? '.'
const FOTO_TESTE = 'public/semente/fotos/sofa-veneza-1600.webp'

if (!EMAIL || !SENHA) {
  console.error('Faltam PAINEL_EMAIL e PAINEL_SENHA.')
  process.exit(1)
}

const EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => existsSync(p))

const navegador = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--disable-gpu', '--hide-scrollbars'] })
const registrar = (texto) => console.log(texto)
const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const clicarBotao = (pagina, texto) =>
  pagina.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith(t))?.click(), texto)

try {
  const pagina = await navegador.newPage()
  const erros = []
  pagina.on('console', (m) => m.type() === 'error' && erros.push(m.text().slice(0, 200)))
  pagina.on('pageerror', (e) => erros.push(`pageerror: ${e.message.slice(0, 200)}`))
  // "Apagar esta foto?" do navegador: aceita
  pagina.on('dialog', (d) => d.accept())
  await pagina.setViewport({ width: 1280, height: 900 })

  // 1. Sem login, o painel manda pra tela de entrar
  await pagina.goto(`${BASE}/painel`, { waitUntil: 'networkidle2' })
  registrar(`1. /painel sem login → ${new URL(pagina.url()).pathname}`)

  // 2. Senha errada não entra
  await pagina.type('#email', EMAIL)
  await pagina.type('#senha', 'senha-que-nao-e-a-certa')
  await Promise.all([clicarBotao(pagina, 'Entrar'), pagina.waitForNetworkIdle()])
  registrar(`2. Senha errada → "${await pagina.$eval('[role=alert]', (e) => e.textContent.trim()).catch(() => 'sem recado')}"`)

  // 3. Senha certa entra
  await pagina.$eval('#senha', (e) => (e.value = ''))
  await pagina.type('#senha', SENHA)
  await Promise.all([clicarBotao(pagina, 'Entrar'), pagina.waitForNavigation({ waitUntil: 'networkidle2' })])
  registrar(`3. Senha certa → ${new URL(pagina.url()).pathname}`)
  await pagina.screenshot({ path: `${SAIDA}/painel-lista.png` })

  // 4. Preço rápido num sofá de preço único
  const artigo = await pagina.evaluateHandle(() => [...document.querySelectorAll('article')].find((a) => a.querySelector('input[name=preco]')))
  const nomeSofa = await artigo.evaluate((a) => a.querySelector('a').textContent.trim())
  const campo = await artigo.$('input[name=preco]')
  const original = await campo.evaluate((i) => i.value)
  const digitar = async (valor) => {
    await campo.click()
    await pagina.keyboard.down('Control')
    await pagina.keyboard.press('KeyA')
    await pagina.keyboard.up('Control')
    await pagina.keyboard.press('Backspace')
    if (valor) await campo.type(valor)
  }
  const salvarPreco = async () => {
    await artigo.evaluate((a) => a.querySelector('button[type=submit]')?.click())
    await pagina.waitForNetworkIdle()
    await esperar(300)
  }
  const recado = (papel) => artigo.evaluate((a, p) => a.querySelector(`[role=${p}]`)?.textContent.trim() ?? 'nada', papel)

  await digitar('3.490')
  await salvarPreco()
  registrar(`4. Preço de "${nomeSofa}" → "${await recado('status')}"`)

  await digitar('99.999.999')
  await salvarPreco()
  registrar(`   Preço de 99 milhões → "${await recado('alert')}"`)
  await digitar('3.490')
  await salvarPreco()

  // 5. A loja tem que mostrar o preço novo
  const loja = await navegador.newPage()
  await loja.goto(`${BASE}/loja`, { waitUntil: 'networkidle2' })
  registrar(`5. Loja mostrando R$ 3.490 → ${(await loja.evaluate(() => document.body.innerText.includes('3.490'))) ? 'sim' : 'NÃO'}`)
  await loja.close()

  // Desfaz: o preço volta ao que era
  await digitar(original)
  await salvarPreco()
  registrar(`   Preço devolvido ao original (${original || 'vazio'}) → "${await recado('status')}"`)

  // 6. Sobe uma foto e apaga em seguida
  await Promise.all([artigo.evaluate((a) => a.querySelector('a').click()), pagina.waitForNavigation({ waitUntil: 'networkidle2' })])
  const contarFotos = () => pagina.$$eval('img', (imgs) => imgs.filter((i) => i.src.includes('/storage/')).length)
  const antes = await contarFotos()
  const [seletor] = await Promise.all([pagina.waitForFileChooser(), clicarBotao(pagina, 'Mais fotos').then(() => clicarBotao(pagina, 'Adicionar fotos'))])
  await seletor.accept([FOTO_TESTE])
  await pagina.waitForNetworkIdle({ idleTime: 2500, timeout: 90000 })
  const depois = await contarFotos()
  const erroFoto = await pagina.$eval('p[role=alert]', (e) => e.textContent.trim()).catch(() => null)
  registrar(`6. Fotos: ${antes} → ${depois} depois do envio${erroFoto ? ` · erro: "${erroFoto}"` : ''}`)
  await pagina.screenshot({ path: `${SAIDA}/painel-fotos.png` })

  if (depois > antes) {
    // A foto nova é a última da galeria
    await pagina.evaluate(() => {
      const itens = [...document.querySelectorAll('img')].filter((i) => i.src.includes('/storage/'))
      const ultima = itens.at(-1).parentElement
      ;[...ultima.querySelectorAll('button')].find((b) => b.textContent.includes('Apagar')).click()
    })
    await pagina.waitForNetworkIdle({ idleTime: 1500, timeout: 60000 })
    registrar(`   Foto de teste apagada → ${await contarFotos()} fotos de novo`)
  }

  // 7. Sofá da tabela da fábrica: três preços por tamanho no formulário
  await pagina.goto(`${BASE}/painel`, { waitUntil: 'networkidle2' })
  const tabelaFabrica = await pagina.evaluate(() => {
    const a = [...document.querySelectorAll('article')].find((x) => x.textContent.includes('3 tecidos'))
    return a ? { nome: a.querySelector('a').textContent.trim(), href: a.querySelector('a').href } : null
  })
  if (tabelaFabrica) {
    await pagina.goto(tabelaFabrica.href, { waitUntil: 'networkidle2' })
    const campos = await pagina.evaluate(() =>
      ['variacaoPreco-0', 'variacaoPrecoLinho-0', 'variacaoPrecoPremium-0'].map((id) => document.getElementById(id)?.value ?? 'FALTA'),
    )
    registrar(`7. ${tabelaFabrica.nome}, 1º tamanho → Veludo ${campos[0]} · Linho ${campos[1]} · Premium ${campos[2]}`)
  }

  // 8. Ajustes
  await pagina.goto(`${BASE}/painel/configuracoes`, { waitUntil: 'networkidle2' })
  registrar(`8. Ajustes → ${await pagina.$eval('h1', (e) => e.textContent.trim())}`)
  await pagina.screenshot({ path: `${SAIDA}/painel-ajustes.png` })

  registrar(erros.length ? `\nErros de navegador: ${erros.join(' | ')}` : '\nNenhum erro de navegador.')
} finally {
  await navegador.close()
}
