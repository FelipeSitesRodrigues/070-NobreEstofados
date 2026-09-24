'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Couch, Gear } from '@phosphor-icons/react'
import s from '@/app/painel/painel.module.css'

/* Duas telas só. Mais que isso vira menu, e menu dá trabalho de aprender. */
const ITENS = [
  { href: '/painel', rotulo: 'Sofás', Icone: Couch },
  { href: '/painel/configuracoes', rotulo: 'Ajustes', Icone: Gear },
]

export function Menu() {
  const caminho = usePathname()

  return (
    <nav className={s.menu} aria-label="Seções do painel">
      {ITENS.map(({ href, rotulo, Icone }) => {
        const atual = href === '/painel' ? caminho === href || caminho.startsWith('/painel/sofa') : caminho.startsWith(href)
        return (
          <Link key={href} href={href} aria-current={atual ? 'page' : undefined}>
            <Icone aria-hidden weight={atual ? 'fill' : 'regular'} />
            {rotulo}
          </Link>
        )
      })}
    </nav>
  )
}
