import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from './config'

/*
 * Cliente com a chave secreta: passa por cima das regras do banco. Só pro que
 * o servidor faz em nome da loja, depois de conferir quem está pedindo:
 *   - contar tentativas de login (consumir_limite)
 *   - gerar link assinado de upload e apagar arquivo no Storage
 *   - registrar interesse no WhatsApp
 *
 * Nunca usar pra ler ou gravar o catálogo do painel: lá vale a sessão da Edna,
 * que passa pelo RLS. O import de "server-only" quebra o build se algum
 * componente do navegador importar este arquivo.
 */

let cliente: SupabaseClient | undefined

export function clienteAdmin() {
  const chave = process.env.SUPABASE_SECRET_KEY
  if (!chave) throw new Error('Variável de ambiente ausente: SUPABASE_SECRET_KEY. Confira o .env.local.')

  cliente ??= createClient(SUPABASE_URL, chave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return cliente
}
