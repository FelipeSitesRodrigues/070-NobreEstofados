import type { Metadata } from 'next'
import { sair } from '@/lib/painel/acoes/entrar'
import s from '../painel.module.css'

export const metadata: Metadata = { title: 'Sem acesso' }

/* Login que existe no Supabase mas não é administrador da loja. */
export default function PaginaSemAcesso() {
  return (
    <div className={s.entrar}>
      <div className={s.caixaEntrar}>
        <h1 className={s.tituloEntrar}>Esse login não abre o painel</h1>
        <p className={s.ajudaEntrar}>
          A conta entrou, mas não é a administradora da loja. Fale com quem cuida do site.
        </p>
        <form action={sair}>
          <button type="submit" className={s.botao}>
            Sair
          </button>
        </form>
      </div>
    </div>
  )
}
