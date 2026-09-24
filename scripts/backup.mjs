/**
 * Backup do banco da Nobre: cada tabela num JSON e as fotos dos produtos.
 *
 *   node --env-file=.env.local scripts/backup.mjs <pasta-de-saida>
 *
 * Roda todo dia no GitHub Actions (.github/workflows/backup.yml), que junta a
 * pasta num arquivo criptografado antes de guardar. A mesma consulta diária
 * mantém acordado o projeto grátis do Supabase, que pausa depois de 7 dias
 * sem uso (a loja lê o banco quase nunca, por causa do cache).
 *
 * Vídeos ficam de fora: cada um tem alguns MB e o backup diário passaria do
 * espaço de artefatos do GitHub grátis. Os originais estão com a Edna.
 *
 * Sem dependência nenhuma (só fetch), pra rodar no Actions sem npm install.
 * Restaurar: descriptografar e reinserir as linhas na ordem da lista TABELAS,
 * que respeita as chaves estrangeiras.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
const CHAVE = process.env.SUPABASE_SECRET_KEY
const SAIDA = process.argv[2]

if (!URL_BASE || !CHAVE || !SAIDA) {
  console.error('Uso: node --env-file=.env.local scripts/backup.mjs <pasta-de-saida>')
  process.exit(1)
}

/** Tabela e a coluna que dá uma ordem estável pra paginar. */
const TABELAS = [
  ['configuracoes', 'id'],
  ['perfis', 'id'],
  ['categorias', 'id'],
  ['produtos', 'id'],
  ['variacoes', 'id'],
  ['midias', 'id'],
  ['interesses', 'id'],
]

const POR_PAGINA = 1000
const cabecalhos = { apikey: CHAVE, Authorization: `Bearer ${CHAVE}` }

async function pedir(caminho, opcoes = {}) {
  const resposta = await fetch(`${URL_BASE}${caminho}`, {
    ...opcoes,
    headers: { ...cabecalhos, ...(opcoes.headers ?? {}) },
    signal: AbortSignal.timeout(30000),
  })
  if (!resposta.ok) throw new Error(`${caminho.split('?')[0]}: HTTP ${resposta.status} ${(await resposta.text()).slice(0, 300)}`)
  return resposta
}

async function tabela(nome, ordem) {
  const linhas = []
  for (let inicio = 0; ; inicio += POR_PAGINA) {
    const pagina = await (await pedir(`/rest/v1/${nome}?select=*&order=${ordem}.asc&limit=${POR_PAGINA}&offset=${inicio}`)).json()
    linhas.push(...pagina)
    if (pagina.length < POR_PAGINA) return linhas
  }
}

/** Arquivos do bucket: <produto>/<mídia>-<largura>.webp e <produto>/<mídia>.mp4. */
async function listar(prefixo = '') {
  const itens = await (
    await pedir('/storage/v1/object/list/midias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: prefixo, limit: 1000, offset: 0 }),
    })
  ).json()
  const caminhos = []
  for (const item of itens) {
    const caminho = prefixo ? `${prefixo}/${item.name}` : item.name
    if (item.id === null) caminhos.push(...(await listar(caminho)))
    else caminhos.push(caminho)
  }
  return caminhos
}

mkdirSync(SAIDA, { recursive: true })
const resumo = { feito_em: new Date().toISOString(), tabelas: {}, fotos: 0 }

for (const [nome, ordem] of TABELAS) {
  const linhas = await tabela(nome, ordem)
  writeFileSync(join(SAIDA, `${nome}.json`), JSON.stringify(linhas))
  resumo.tabelas[nome] = linhas.length
}

for (const caminho of (await listar()).filter((c) => c.endsWith('.webp'))) {
  const dados = Buffer.from(await (await pedir(`/storage/v1/object/midias/${caminho}`)).arrayBuffer())
  const destino = join(SAIDA, 'fotos', caminho)
  mkdirSync(dirname(destino), { recursive: true })
  writeFileSync(destino, dados)
  resumo.fotos += 1
}

writeFileSync(join(SAIDA, 'resumo.json'), JSON.stringify(resumo, null, 2))
console.log(
  `Backup pronto: ${Object.entries(resumo.tabelas)
    .map(([t, n]) => `${t} ${n}`)
    .join(', ')}, ${resumo.fotos} fotos.`,
)
