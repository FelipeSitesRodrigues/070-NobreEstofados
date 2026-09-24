import 'server-only'
import { redirect } from 'next/navigation'
import { clienteServidor } from '@/lib/supabase/servidor'

/*
 * Porta de entrada de toda página e toda ação do painel.
 *
 * O proxy já barrou quem não tem cookie, mas ele é só o filtro rápido: aqui a
 * sessão é conferida no servidor (getUser fala com o Supabase) e o perfil admin
 * é lido do banco. Mesmo que isto falhasse, o RLS ainda barraria a escrita.
 */
export async function exigirAdmin() {
  const supabase = await clienteServidor()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/painel/entrar')

  const { data: perfil } = await supabase.from('perfis').select('id, nome, papel').eq('id', user.id).maybeSingle()
  if (!perfil || perfil.papel !== 'admin') redirect('/painel/sem-acesso')

  return { supabase, user, perfil: perfil as { id: string; nome: string; papel: string } }
}
