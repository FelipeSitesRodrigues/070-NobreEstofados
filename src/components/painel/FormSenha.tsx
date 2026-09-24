'use client'

import { Check, Warning } from '@phosphor-icons/react'
import { trocarSenha } from '@/lib/painel/acoes/conta'
import type { EstadoForm } from '@/lib/painel/acoes/produtos'
import s from '@/app/painel/painel.module.css'
import { useAcaoFormulario } from './useAcaoFormulario'

export function FormSenha() {
  const { estado, aoEnviar, pendente } = useAcaoFormulario<EstadoForm>(trocarSenha, { erro: null, ok: null })

  return (
    <form onSubmit={aoEnviar} noValidate>
      <div className={s.duas}>
        <div className={s.campo}>
          <label htmlFor="senha">Senha nova</label>
          <input id="senha" name="senha" type="password" autoComplete="new-password" minLength={10} required />
        </div>
        <div className={s.campo}>
          <label htmlFor="confirmacao">Repita a senha</label>
          <input id="confirmacao" name="confirmacao" type="password" autoComplete="new-password" required />
        </div>
      </div>

      {estado.erro && (
        <p className={s.erro} role="alert">
          <Warning aria-hidden weight="fill" />
          {estado.erro}
        </p>
      )}
      {estado.ok && (
        <p className={s.ok} role="status">
          <Check aria-hidden weight="bold" />
          {estado.ok}
        </p>
      )}

      <div className={s.acoes}>
        <button type="submit" className={s.botaoSecundario} disabled={pendente}>
          {pendente ? 'Trocando...' : 'Trocar senha'}
        </button>
      </div>
    </form>
  )
}
