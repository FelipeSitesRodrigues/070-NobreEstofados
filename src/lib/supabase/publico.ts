import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from './config'

/*
 * Cliente da loja: chave pública, sem sessão e sem cookie. Lê só o que o banco
 * libera pra visitante (produto ativo, as mídias dele e as configurações). Por
 * não ler cookie, as páginas da loja continuam estáticas.
 */

let cliente: SupabaseClient | undefined

export function clientePublico() {
  cliente ??= createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return cliente
}
