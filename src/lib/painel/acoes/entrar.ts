'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { clienteAdmin } from '@/lib/supabase/admin'
import { clienteServidor } from '@/lib/supabase/servidor'

/*
 * Entrar e sair do painel.
 *
 * O Supabase já segura tentativa em massa, mas ele conta por e-mail: quem
 * varre senha trocando de e-mail passa por baixo. O consumir_limite conta por
 * IP também (20 tentativas a cada 10 minutos) e roda com a chave secreta,
 * porque a tabela de limites não é visível pra ninguém.
 *
 * A mensagem de erro é sempre a mesma, com ou sem o e-mail existindo: quem
 * está tentando adivinhar não descobre se acertou o e-mail.
 */

export type EstadoLogin = { erro: string | null }

const ERRO_GENERICO = 'E-mail ou senha que não conferem. Tente de novo.'

async function podeTentar() {
  const cabecalhos = await headers()
  const ip = (cabecalhos.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'sem-ip'
  const { data } = await clienteAdmin().rpc('consumir_limite', {
    p_chave: `login:${ip}`,
    p_maximo: 20,
    p_janela_segundos: 600,
  })
  return data !== false
}

export async function entrar(_estado: EstadoLogin, dados: FormData): Promise<EstadoLogin> {
  const email = String(dados.get('email') ?? '').trim().toLowerCase()
  const senha = String(dados.get('senha') ?? '')
  const volta = String(dados.get('volta') ?? '')

  if (!email || !senha) return { erro: 'Preencha o e-mail e a senha.' }

  if (!(await podeTentar())) {
    return { erro: 'Muitas tentativas seguidas. Espere 10 minutos e tente de novo.' }
  }

  const supabase = await clienteServidor()
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) return { erro: ERRO_GENERICO }

  // Entrou no Auth, mas só é do painel quem tem perfil admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: perfil } = await supabase.from('perfis').select('papel').eq('id', user?.id ?? '').maybeSingle()
  if (!perfil || perfil.papel !== 'admin') {
    await supabase.auth.signOut({ scope: 'local' })
    return { erro: ERRO_GENERICO }
  }

  redirect(volta.startsWith('/painel') ? volta : '/painel')
}

export async function sair() {
  const supabase = await clienteServidor()
  await supabase.auth.signOut({ scope: 'local' })
  redirect('/painel/entrar')
}
