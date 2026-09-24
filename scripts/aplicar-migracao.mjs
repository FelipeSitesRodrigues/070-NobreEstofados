/**
 * Aplica uma migração de supabase/migrations no projeto da Nobre pela
 * Management API do Supabase e grava no histórico de migrações.
 *
 *   node --env-file=.env.local --env-file=.env.supabase.local scripts/aplicar-migracao.mjs supabase/migrations/<arquivo>.sql
 *
 * O projeto sai do NEXT_PUBLIC_SUPABASE_URL; o token (SUPABASE_ACCESS_TOKEN,
 * restrito ao projeto) vem do .env.supabase.local e nunca é impresso.
 * Sem o token, dá pra colar o mesmo arquivo no SQL Editor do Supabase.
 */
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'

const arquivo = process.argv[2]
const token = process.env.SUPABASE_ACCESS_TOKEN
const projeto = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1]

if (!arquivo || !token || !projeto) {
  console.error('Uso: node --env-file=.env.local --env-file=.env.supabase.local scripts/aplicar-migracao.mjs <arquivo.sql>')
  process.exit(1)
}

// "20260922120000_base_nobre.sql" vira versão + nome no histórico
const [, versao, nome] = basename(arquivo).match(/^(\d{14})_(.+)\.sql$/) ?? []
if (!versao) {
  console.error('O arquivo precisa se chamar AAAAMMDDHHMMSS_nome.sql')
  process.exit(1)
}

const resposta = await fetch(`https://api.supabase.com/v1/projects/${projeto}/database/migrations`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: nome, query: readFileSync(arquivo, 'utf8') }),
})

console.log(`${resposta.status} ${nome}`)
if (!resposta.ok) {
  console.error((await resposta.text()).slice(0, 2000))
  process.exit(1)
}
