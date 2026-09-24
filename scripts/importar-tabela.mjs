/**
 * Carrega os preços do site a partir da tabela da fábrica (R7 Estofados).
 *
 *   node --env-file=.env.local scripts/importar-tabela.mjs "<tabela-fabrica.json>" --acrescimo 600
 *   node --env-file=.env.local scripts/importar-tabela.mjs "<tabela-fabrica.json>" --acrescimo 600 --simular
 *
 * A tabela de fábrica fica FORA deste repositório, de propósito: é preço de
 * custo e não pode ir pro GitHub do site. Ela mora na pasta da cliente
 * ("sites/070 - Nobre Estofados/tabela-fabrica-2026.json"), montada do PDF.
 *
 * Preço do site = preço de fábrica + acréscimo, em cada tamanho e em cada linha
 * de tecido (Veludo, Linho, Premium). O acréscimo é a margem da Edna: R$ 600
 * por sofá, combinado em 2026-09-23.
 *
 * Para cada sofá da tabela, os tamanhos do banco são TROCADOS pelos da tabela
 * (apaga e grava de novo). Preço que a Edna tenha mudado à mão no painel volta
 * pro da tabela: rodar só quando a fábrica mandar tabela nova ou a margem mudar.
 * Sofá que não está na tabela (o Conjunto Roma) não é tocado.
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const arquivo = args.find((a) => !a.startsWith('--'))
const indice = args.indexOf('--acrescimo')
const acrescimoReais = indice === -1 ? NaN : Number(String(args[indice + 1]).replace(',', '.'))
const simular = args.includes('--simular')

if (!arquivo || !Number.isFinite(acrescimoReais) || acrescimoReais < 0) {
  console.error('Uso: importar-tabela.mjs "<tabela-fabrica.json>" --acrescimo 600 [--simular]')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const chave = process.env.SUPABASE_SECRET_KEY
if (!url || !chave) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no .env.local')
  process.exit(1)
}

const db = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
const tabela = JSON.parse(readFileSync(arquivo, 'utf8'))
const acrescimo = Math.round(acrescimoReais * 100)
const reais = (c) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** "pillow 15 cm", pra distinguir as duas versões do mesmo sofá. */
const pillow = (titulo) => titulo.match(/PILLOW\s*(\d+)\s*CM/i)?.[1]

let sofas = 0
let tamanhos = 0

for (const produto of tabela.produtos) {
  if (!produto.versoes.length) {
    console.log(`– ${produto.nome}: fora da tabela, não mexi`)
    continue
  }

  const { data: linha, error } = await db.from('produtos').select('id, nome').eq('slug', produto.slug).maybeSingle()
  if (error || !linha) {
    console.log(`! ${produto.nome}: não achei "${produto.slug}" no banco`)
    continue
  }

  const duasVersoes = produto.versoes.length > 1
  const lista = produto.versoes.flatMap((versao) =>
    versao.tamanhos.map((t) => {
      const precos = {
        veludo: t.fabrica.veludo + acrescimo,
        linho: t.fabrica.linho300 + acrescimo,
        premium: t.fabrica.linho500 + acrescimo,
      }
      const unico = versao.tamanhos.length === 1 && !duasVersoes
      return {
        // Tamanho único (poltrona, conjunto): sem nome, a medida vem das medidas do produto
        nome: unico ? null : `${t.tamanho}${duasVersoes ? ` · pillow ${pillow(versao.tabelaFabrica)} cm` : ''}`,
        metros: Number(t.tamanho.split(' ')[0].replace(',', '.')) || 0,
        pillow: Number(pillow(versao.tabelaFabrica) ?? 0),
        precos,
      }
    }),
  )
  // Do menor pro maior; no mesmo tamanho, o pillow mais alto primeiro
  lista.sort((a, b) => a.metros - b.metros || b.pillow - a.pillow)

  const menor = Math.min(...lista.map((v) => v.precos.veludo))
  console.log(`✓ ${linha.nome}: ${lista.length} ${lista.length === 1 ? 'tamanho' : 'tamanhos'}, a partir de ${reais(menor)}`)
  sofas += 1
  tamanhos += lista.length
  if (simular) continue

  const apagar = await db.from('variacoes').delete().eq('produto_id', linha.id)
  if (apagar.error) throw new Error(`${linha.nome}: ${apagar.error.message}`)

  const gravar = await db.from('variacoes').insert(
    lista.map((v, ordem) => ({
      produto_id: linha.id,
      nome: v.nome,
      preco_centavos: v.precos.veludo,
      preco_cheio_centavos: null,
      precos_tecido: v.precos,
      ordem,
    })),
  )
  if (gravar.error) throw new Error(`${linha.nome}: ${gravar.error.message}`)
}

console.log(`\n${simular ? 'Simulação: nada gravado. ' : ''}${sofas} sofás, ${tamanhos} tamanhos, acréscimo de ${reais(acrescimo)} em cada preço.`)
