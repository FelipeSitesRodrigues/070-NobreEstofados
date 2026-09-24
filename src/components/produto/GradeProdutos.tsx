import type { CSSProperties } from 'react'
import type { Produto } from '@/lib/catalogo/tipos'
import { CardProduto } from './CardProduto'
import s from './GradeProdutos.module.css'

type Props = { produtos: Produto[]; whatsapp: string; parcelas: number | null; className?: string }

/** Três por linha no desktop, dois no tablet, um no celular (card grande, fácil de tocar). */
export function GradeProdutos({ produtos, whatsapp, parcelas, className }: Props) {
  return (
    <ul className={className ? `${s.grade} ${className}` : s.grade}>
      {produtos.map((produto, i) => (
        // A entrada ao rolar fica no item, e o card fica livre pro movimento do hover
        <li key={produto.id} data-revelar style={{ '--atraso': (i % 3) * 70 } as CSSProperties}>
          <CardProduto produto={produto} whatsapp={whatsapp} parcelas={parcelas} />
        </li>
      ))}
    </ul>
  )
}
