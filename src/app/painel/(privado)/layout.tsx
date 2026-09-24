import Link from 'next/link'
import { SignOut } from '@phosphor-icons/react/dist/ssr'
import { Menu } from '@/components/painel/Menu'
import { sair } from '@/lib/painel/acoes/entrar'
import { exigirAdmin } from '@/lib/painel/sessao'
import s from '../painel.module.css'

/*
 * Casca de quem já entrou.
 *
 * O layout não roda de novo a cada navegação, então cada página e cada ação
 * chamam exigirAdmin() por conta própria. Aqui ele serve só pra saber o nome
 * de quem está logado — e pra barrar quem abriu direto pelo endereço.
 */

export default async function LayoutPrivado({ children }: LayoutProps<'/painel'>) {
  const { perfil } = await exigirAdmin()

  return (
    <div className={s.pagina}>
      <header className={s.topo}>
        <div className={s.topoLinha}>
          <Link href="/painel" className={s.marca}>
            Nobre Estofados
            <span>Olá, {perfil.nome.split(' ')[0]}</span>
          </Link>

          <Menu />

          <form action={sair}>
            <button type="submit" className={s.sair}>
              <SignOut aria-hidden />
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className={s.conteudo}>{children}</main>
    </div>
  )
}
