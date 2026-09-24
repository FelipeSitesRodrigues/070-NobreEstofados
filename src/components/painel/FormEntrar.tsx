'use client'

import { Warning } from '@phosphor-icons/react'
import { entrar, type EstadoLogin } from '@/lib/painel/acoes/entrar'
import s from '@/app/painel/painel.module.css'
import { useAcaoFormulario } from './useAcaoFormulario'

/*
 * Entrar no painel. E-mail e senha, sem código no celular: quem usa é uma
 * pessoa só, e o segundo fator atrapalharia mais do que ajuda aqui.
 *
 * O campo de senha tem o botão do próprio navegador pra mostrar o que foi
 * digitado (type=password + autocomplete), que é o que a Edna conhece.
 */

export function FormEntrar({ volta, motivo }: { volta: string; motivo: string | null }) {
  const { estado, aoEnviar, pendente } = useAcaoFormulario<EstadoLogin>(entrar, { erro: null })
  const erro = estado.erro ?? motivo

  return (
    <form onSubmit={aoEnviar} noValidate>
      <input type="hidden" name="volta" value={volta} />

      <div className={s.campos}>
        <div className={s.campo}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
        </div>

        <div className={s.campo}>
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" autoComplete="current-password" required />
        </div>
      </div>

      {erro && (
        <p className={s.erro} role="alert">
          <Warning aria-hidden weight="fill" />
          {erro}
        </p>
      )}

      <button type="submit" className={s.botao} disabled={pendente} aria-busy={pendente}>
        {pendente ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
