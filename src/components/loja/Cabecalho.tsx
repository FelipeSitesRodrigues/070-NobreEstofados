import Link from 'next/link'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { ContadorCarrinho } from '@/components/carrinho/ContadorCarrinho'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'
import { linkWhatsApp } from '@/lib/whatsapp'
import s from './Cabecalho.module.css'
import { MenuCelular } from './MenuCelular'
import { Navegacao } from './Navegacao'

export async function Cabecalho() {
  const config = await lerConfiguracoes()
  const ajuda = linkWhatsApp(config.whatsapp, { tipo: 'ajuda' })

  return (
    <header className={s.header}>
      <div className={`conteiner ${s.linha}`}>
        <MenuCelular linkAjuda={ajuda} />

        <Link href="/" className={s.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element -- logo pequeno, já no tamanho certo */}
          <img src="/imagens/logo-nobre.png" alt="Nobre Estofados, página inicial" width={480} height={119} />
        </Link>

        <Navegacao />

        <div className={s.ferramentas}>
          <form action="/loja" role="search" className={s.busca}>
            <label htmlFor="busca-topo" className="visualmente-oculto">
              Buscar sofá
            </label>
            <input id="busca-topo" name="busca" type="search" placeholder="Buscar sofá..." autoComplete="off" />
            <button type="submit" aria-label="Buscar">
              <MagnifyingGlass aria-hidden />
            </button>
          </form>

          <Link href="/loja#busca" className={s.buscaCelular} aria-label="Buscar sofá">
            <MagnifyingGlass aria-hidden />
            <span className={s.rotuloIcone} aria-hidden>
              Buscar
            </span>
          </Link>

          <ContadorCarrinho />
        </div>
      </div>
    </header>
  )
}
