import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import { Foto } from '@/components/ui/Foto'
import sec from '@/components/ui/secao.module.css'
import type { Categoria } from '@/lib/catalogo/tipos'
import s from './Categorias.module.css'

export function Categorias({ categorias }: { categorias: Categoria[] }) {
  return (
    <section className="secao escuro" aria-labelledby="titulo-categorias">
      <div className="conteiner">
        <div className={sec.cabecalho}>
          <h2 id="titulo-categorias" className={sec.titulo}>
            Escolha pelo tipo de sofá
          </h2>
          <Link href="/loja" className={b.link}>
            Ver todos
            <ArrowRight aria-hidden />
          </Link>
        </div>

        {/* No celular vira uma fileira que desliza pro lado. A revelação fica na
            lista inteira: card fora da tela na fileira não entraria na vista. */}
        <ul className={s.lista} data-revelar>
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link href={`/loja/${c.slug}`} className={s.card}>
                <span className={s.foto}>
                  {c.capa && <Foto foto={{ ...c.capa, alt: '' }} sizes="(max-width: 767px) 70vw, (max-width: 1023px) 32vw, 250px" />}
                </span>
                <span className={s.painel}>
                  <span className={s.nome}>{c.nome}</span>
                  <span className={s.quantidade}>
                    {c.quantidade} {c.quantidade === 1 ? 'modelo' : 'modelos'}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
