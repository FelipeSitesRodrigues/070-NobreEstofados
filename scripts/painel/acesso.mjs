/**
 * Quem entra no painel da Nobre.
 *
 *   node --env-file=.env.local scripts/painel/acesso.mjs criar <email> "<Nome>"
 *   node --env-file=.env.local scripts/painel/acesso.mjs senha <email>
 *   node --env-file=.env.local scripts/painel/acesso.mjs listar
 *
 * "criar" cadastra a conta já confirmada (sem e-mail de confirmação, que
 * dependeria de servidor de e-mail configurado) e grava o perfil de
 * administrador — sem o perfil, o login entra e não abre nada.
 *
 * A senha é sorteada aqui e aparece uma vez no terminal. Anote e mande pra
 * pessoa por um canal que não seja o mesmo do e-mail.
 */
import { randomInt } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const [comando, email, nome] = process.argv.slice(2)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const chave = process.env.SUPABASE_SECRET_KEY

if (!url || !chave) {
  console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY no .env.local')
  process.exit(1)
}

const db = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })

/*
 * Senha fácil de ditar no telefone e ainda assim difícil de adivinhar:
 * três palavras e quatro números (mais de 10^13 combinações).
 */
const PALAVRAS = [
  'sofa', 'nobre', 'veludo', 'conforto', 'sala', 'chaise', 'poltrona', 'canto',
  'macio', 'estofado', 'retratil', 'almofada', 'tecido', 'madeira', 'recanto',
]

function sortearSenha() {
  const palavras = Array.from({ length: 3 }, () => PALAVRAS[randomInt(PALAVRAS.length)])
  return `${palavras.join('-')}-${randomInt(1000, 10000)}`
}

async function acharUsuario(procurado) {
  // A API de admin lista por página; a loja tem pouca gente, uma página basta
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error) throw new Error(error.message)
  return data.users.find((u) => u.email?.toLowerCase() === procurado.toLowerCase()) ?? null
}

if (comando === 'listar') {
  const { data, error } = await db.from('perfis').select('id, nome, papel, criado_em')
  if (error) throw new Error(error.message)
  const { data: contas } = await db.auth.admin.listUsers({ page: 1, perPage: 200 })
  for (const perfil of data ?? []) {
    const conta = contas?.users.find((u) => u.id === perfil.id)
    console.log(`${perfil.nome} · ${conta?.email ?? 'sem e-mail'} · ${perfil.papel}`)
  }
  process.exit(0)
}

if (!email || !['criar', 'senha'].includes(comando)) {
  console.error('Uso: acesso.mjs criar <email> "<Nome>" | senha <email> | listar')
  process.exit(1)
}

const senha = sortearSenha()

if (comando === 'criar') {
  if (!nome) {
    console.error('Falta o nome: acesso.mjs criar <email> "<Nome>"')
    process.exit(1)
  }

  let usuario = await acharUsuario(email)

  if (usuario) {
    console.log('Essa conta já existe; trocando a senha dela.')
    const { error } = await db.auth.admin.updateUserById(usuario.id, { password: senha })
    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })
    if (error) throw new Error(error.message)
    usuario = data.user
  }

  const { error: erroPerfil } = await db.from('perfis').upsert({ id: usuario.id, nome, papel: 'admin' })
  if (erroPerfil) throw new Error(erroPerfil.message)

  console.log('\nPainel: /painel')
  console.log(`E-mail: ${email}`)
  console.log(`Senha:  ${senha}\n`)
  console.log('Essa senha não fica guardada em lugar nenhum. Anote agora.')
} else {
  const usuario = await acharUsuario(email)
  if (!usuario) {
    console.error('Não achei essa conta.')
    process.exit(1)
  }
  const { error } = await db.auth.admin.updateUserById(usuario.id, { password: senha })
  if (error) throw new Error(error.message)
  console.log(`\nSenha nova de ${email}: ${senha}\n`)
}
