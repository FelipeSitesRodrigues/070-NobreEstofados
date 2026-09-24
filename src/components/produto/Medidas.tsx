import { Ruler } from '@phosphor-icons/react/dist/ssr'
import { fichaMedidas } from '@/lib/catalogo/medidas'
import type { Medidas as MedidasProduto } from '@/lib/catalogo/tipos'
import s from './Medidas.module.css'

/** Medidas em blocos grandes: o que mais decide a compra de um sofá é caber na sala. */
export function Medidas({ medidas }: { medidas: MedidasProduto }) {
  const linhas = fichaMedidas(medidas)
  if (!linhas.length) return null

  return (
    <section className={s.medidas} aria-labelledby="titulo-medidas">
      <h2 id="titulo-medidas" className={s.titulo}>
        <Ruler aria-hidden weight="light" />
        Medidas
      </h2>
      <dl className={s.lista}>
        {linhas.map((linha) => (
          <div key={linha.rotulo} className={s.item}>
            <dt>{linha.rotulo}</dt>
            <dd className={s.valor}>{linha.valor}</dd>
            {linha.detalhe && <dd className={s.detalhe}>{linha.detalhe}</dd>}
          </div>
        ))}
      </dl>
      <p className={s.dica}>Antes de comprar, meça o espaço da sala e a largura da porta por onde o sofá vai entrar.</p>
    </section>
  )
}
