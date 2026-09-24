import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/supabase/config'
import { COOKIE_PAINEL, sessaoVencida } from '@/lib/supabase/sessao'

/*
 * Proxy do painel (só roda em /painel).
 *
 * 1. Renova a sessão do Supabase antes da página rodar e grava o cookie novo.
 * 2. Filtro rápido de acesso: sem login vai pra tela de entrar, sessão com mais
 *    de 12 horas faz login de novo.
 *    É só a primeira porta: toda página e toda ação do painel conferem a sessão
 *    de novo no servidor, e o banco confere mais uma vez (RLS + eh_admin).
 * 3. CSP com nonce por request: nenhum script inline sem o nonce roda. A loja
 *    recebe a política mais frouxa do next.config.ts, que deixa a página em cache.
 */

/** Abre sem login. */
const ROTAS_PUBLICAS = ['/painel/entrar']

const casa = (caminho: string, rotas: string[]) => rotas.some((r) => caminho === r || caminho.startsWith(`${r}/`))

function montarCsp(nonce: string) {
  const dev = process.env.NODE_ENV === 'development'
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // Atributo style (larguras calculadas, prévia da foto) não aceita nonce
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${new URL(SUPABASE_URL).origin}`,
    `media-src 'self' blob: ${new URL(SUPABASE_URL).origin}`,
    "font-src 'self' data:",
    // O navegador sobe foto e vídeo direto pro Storage, por link assinado
    `connect-src 'self' ${new URL(SUPABASE_URL).origin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const csp = montarCsp(nonce)

  // Os cabeçalhos da página saem do request atual: se a sessão for renovada,
  // o cookie novo já chega na página neste mesmo request.
  const seguir = () => {
    const cabecalhos = new Headers(request.headers)
    cabecalhos.set('x-nonce', nonce)
    cabecalhos.set('Content-Security-Policy', csp)
    return NextResponse.next({ request: { headers: cabecalhos } })
  }

  let resposta = seguir()
  let cabecalhosSessao: Record<string, string> = {}

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    cookieOptions: COOKIE_PAINEL,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(lista, cabecalhos) {
        for (const { name, value } of lista) request.cookies.set(name, value)
        resposta = seguir()
        for (const { name, value, options } of lista) resposta.cookies.set(name, value, options)
        cabecalhosSessao = { ...cabecalhosSessao, ...cabecalhos }
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const caminho = request.nextUrl.pathname

  /** Resposta final: cabeçalhos de segurança e os cookies da sessão renovada. */
  const finalizar = (saida: NextResponse) => {
    if (saida !== resposta) {
      for (const cookie of resposta.cookies.getAll()) saida.cookies.set(cookie)
    }
    for (const [chave, valor] of Object.entries(cabecalhosSessao)) saida.headers.set(chave, valor)
    saida.headers.set('Content-Security-Policy', csp)
    saida.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    saida.headers.set('Cache-Control', 'private, no-store')
    return saida
  }

  const irPara = (destino: string, volta?: string) => {
    const url = new URL(destino, request.url)
    if (volta && volta !== '/painel') url.searchParams.set('volta', volta)
    return finalizar(NextResponse.redirect(url, 303))
  }

  if (!claims) {
    return casa(caminho, ROTAS_PUBLICAS) ? finalizar(resposta) : irPara('/painel/entrar', caminho)
  }

  if (sessaoVencida(claims.amr)) {
    await supabase.auth.signOut({ scope: 'local' })
    return irPara('/painel/entrar?motivo=expirou')
  }

  // Já entrou: tela de login não faz sentido
  if (caminho === '/painel/entrar') return irPara('/painel')

  return finalizar(resposta)
}

export const config = {
  matcher: ['/painel', '/painel/:path*'],
}
