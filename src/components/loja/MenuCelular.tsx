'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { List, MagnifyingGlass, WhatsappLogo, X } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import { NAVEGACAO } from '@/lib/site'
import s from './Cabecalho.module.css'

/**
 * Menu do celular num <dialog> nativo: prende o foco, fecha no Esc e no voltar
 * do Android, e não precisa de biblioteca. A entrada é só CSS (@starting-style).
 */
export function MenuCelular({ linkAjuda }: { linkAjuda: string }) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const fechar = () => dialogo.current?.close()

  return (
    <>
      <button type="button" className={s.botaoMenu} onClick={() => dialogo.current?.showModal()} aria-haspopup="dialog">
        <List aria-hidden weight="bold" />
        <span>Menu</span>
      </button>

      <dialog
        ref={dialogo}
        className={s.menu}
        aria-label="Menu"
        // Clique no fundo escurecido fecha
        onClick={(evento) => evento.target === dialogo.current && fechar()}
      >
        <div className={s.menuCaixa}>
          <div className={s.menuTopo}>
            <p className={s.menuTitulo}>Menu</p>
            <button type="button" className={s.fechar} onClick={fechar}>
              <X aria-hidden />
              Fechar
            </button>
          </div>

          <form action="/loja" role="search" className={s.menuBusca} onSubmit={fechar}>
            <label htmlFor="busca-menu">Buscar sofá</label>
            <div>
              <input id="busca-menu" name="busca" type="search" placeholder="Ex.: retrátil, canto, poltrona" autoComplete="off" />
              <button type="submit" aria-label="Buscar">
                <MagnifyingGlass aria-hidden />
              </button>
            </div>
          </form>

          <nav aria-label="Menu do celular">
            <ul className={s.menuLinks}>
              {NAVEGACAO.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={fechar}>
                    {item.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <a href={linkAjuda} target="_blank" rel="noopener" className={`${b.botao} ${b.principal} ${b.largo}`} onClick={fechar}>
            <WhatsappLogo aria-hidden weight="fill" />
            Chamar no WhatsApp
          </a>
        </div>
      </dialog>
    </>
  )
}
