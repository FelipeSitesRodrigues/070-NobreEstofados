'use client'

import Link from 'next/link'
import { ShoppingCartSimple } from '@phosphor-icons/react/dist/ssr'
import { quantidadeTotal } from '@/lib/carrinho/tipos'
import s from '@/components/loja/Cabecalho.module.css'
import { useCarrinho } from './estado'

/** "Carrinho (2)" no desktop; no celular, o ícone com o número em cima e a palavra embaixo. */
export function ContadorCarrinho() {
  const { itens } = useCarrinho()
  const total = quantidadeTotal(itens)

  return (
    <Link href="/carrinho" className={s.carrinho} aria-label={`Carrinho, ${total} ${total === 1 ? 'item' : 'itens'}`}>
      <span className={s.iconeCarrinho}>
        <ShoppingCartSimple aria-hidden weight="regular" />
        {/* key: o número "pula" quando muda */}
        <span key={total} className={s.contador} data-cheio={total > 0 || undefined} aria-hidden>
          {total}
        </span>
      </span>
      <span className={s.carrinhoTexto} aria-hidden>
        Carrinho
      </span>
    </Link>
  )
}
