import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from './config'
import { COOKIE_PAINEL } from './sessao'

/*
 * Cliente do painel: chave pública + a sessão da Edna lida do cookie. Tudo que
 * ela lê ou grava passa pelas regras do banco, que exigem perfil admin.
 *
 * Um cliente novo por request (nunca guardar em variável de módulo). Em Server
 * Component o cookie não pode ser gravado: se o token precisar de renovação
 * ali, o proxy já renovou antes da página rodar.
 */
export async function clienteServidor() {
  const loja = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookieOptions: COOKIE_PAINEL,
    cookies: {
      getAll: () => loja.getAll(),
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) loja.set(name, value, options)
        } catch {
          // Server Component: sem permissão de gravar cookie. O proxy cuida disso.
        }
      },
    },
  })
}
