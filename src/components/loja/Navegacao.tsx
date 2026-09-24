'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAVEGACAO } from '@/lib/site'
import s from './Cabecalho.module.css'

/** Menu do desktop. Marca a página atual (a home, a loja ou as poltronas). */
export function Navegacao() {
  const caminho = usePathname()
  const atual = (href: string) =>
    href === '/' ? caminho === '/' : href === '/loja' ? caminho === '/loja' || (caminho.startsWith('/loja/') && caminho !== '/loja/poltronas') : caminho === href

  return (
    <nav aria-label="Principal" className={s.nav}>
      <ul>
        {NAVEGACAO.map((item) => (
          <li key={item.href}>
            <Link href={item.href} aria-current={atual(item.href) ? 'page' : undefined}>
              {item.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
