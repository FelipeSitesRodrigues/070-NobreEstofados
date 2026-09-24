import type { CookieOptionsWithName } from '@supabase/ssr'

/*
 * Cookie da sessão do painel.
 *
 * - path /painel: o navegador só manda o cookie pro painel, nunca pra loja,
 *   então a loja continua estática e em cache.
 * - httpOnly: nenhum JavaScript da página lê o token (não existe cliente do
 *   Supabase no navegador; todo login passa pelo servidor).
 * - sameSite lax: link do WhatsApp pro painel abre já logado; formulário de
 *   outro site não consegue postar (as Server Actions ainda conferem a origem).
 */
export const COOKIE_PAINEL: CookieOptionsWithName = {
  name: 'nobre-painel',
  path: '/painel',
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
}

/*
 * Tempo máximo de uma sessão, contado desde a senha. A Edna entra pelo celular
 * e costuma ficar com a aba aberta: 12 horas cobre um dia de trabalho inteiro
 * sem pedir a senha de novo, e no dia seguinte pede.
 */
export const DURACAO_MAXIMA_SESSAO_S = 12 * 60 * 60

type EntradaAmr = { method: string; timestamp: number }

/** Momento (em segundos) em que um método de login foi usado nesta sessão. */
export function momentoDoMetodo(amr: unknown, metodos: string[]): number | null {
  if (!Array.isArray(amr)) return null
  const momentos = amr
    .filter((e): e is EntradaAmr => typeof e === 'object' && e !== null && 'method' in e && 'timestamp' in e)
    .filter((e) => metodos.includes(e.method) && Number.isFinite(e.timestamp))
    .map((e) => e.timestamp)
  return momentos.length ? Math.max(...momentos) : null
}

/** Sessão que passou do tempo máximo desde a senha. */
export function sessaoVencida(amr: unknown, agora = Date.now() / 1000) {
  const inicio = momentoDoMetodo(amr, ['password', 'otp', 'magiclink', 'invite', 'recovery'])
  return inicio === null || agora - inicio > DURACAO_MAXIMA_SESSAO_S
}
