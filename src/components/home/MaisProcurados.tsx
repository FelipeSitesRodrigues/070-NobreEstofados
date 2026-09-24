import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import { GradeProdutos } from '@/components/produto/GradeProdutos'
import b from '@/components/ui/botao.module.css'
import sec from '@/components/ui/secao.module.css'
import type { Produto } from '@/lib/catalogo/tipos'
import s from './MaisProcurados.module.css'

type Props = { produtos: Produto[]; total: number; whatsapp: string; parcelas: number | null }

/** Seis no desktop; no celular, três e o botão pra loja inteira, como no mockup. */
export function MaisProcurados({ produtos, total, whatsapp, parcelas }: Props) {
  return (
    <section className="secao" aria-labelledby="titulo-procurados">
      <div className="conteiner">
        <div className={sec.cabecalho}>
          <h2 id="titulo-procurados" className={sec.titulo}>
            Sofás mais procurados
          </h2>
          <Link href="/loja" className={`${b.link} ${s.linkTopo}`}>
            Ver todos os {total} modelos
            <ArrowRight aria-hidden />
          </Link>
        </div>
        <GradeProdutos produtos={produtos} whatsapp={whatsapp} parcelas={parcelas} className={s.grade} />
        <Link href="/loja" className={`${b.botao} ${b.principal} ${b.largo} ${s.verTodos}`}>
          Ver todos os {total} modelos
          <ArrowRight aria-hidden className={b.seta} />
        </Link>
      </div>
    </section>
  )
}
