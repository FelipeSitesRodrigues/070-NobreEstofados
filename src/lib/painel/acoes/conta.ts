'use server'

import { exigirAdmin } from '@/lib/painel/sessao'
import type { EstadoForm } from './produtos'

/*
 * Trocar a própria senha. Sem e-mail no meio: a Edna já está logada, digita a
 * senha nova duas vezes e pronto. Se ela esquecer a senha, o Felipe gera outra
 * pelo scripts/painel/nova-senha.mjs.
 */

const MINIMO = 10

export async function trocarSenha(_estado: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin()

  const senha = String(dados.get('senha') ?? '')
  const confirmacao = String(dados.get('confirmacao') ?? '')

  if (senha.length < MINIMO) return { erro: `A senha precisa ter pelo menos ${MINIMO} letras ou números.`, ok: null }
  if (senha !== confirmacao) return { erro: 'As duas senhas não são iguais.', ok: null }

  const { error } = await supabase.auth.updateUser({ password: senha })
  if (error) return { erro: `Não consegui trocar: ${error.message}`, ok: null }

  return { erro: null, ok: 'Senha trocada.' }
}
