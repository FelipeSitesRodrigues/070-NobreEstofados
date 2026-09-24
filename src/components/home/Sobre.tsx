import type { CSSProperties } from 'react'
import { Couch, Diamond, ShieldCheck } from '@phosphor-icons/react/dist/ssr'
import sec from '@/components/ui/secao.module.css'
import s from './Sobre.module.css'

const PILARES = [
  { Icone: Couch, titulo: 'Conforto', texto: 'Sofás feitos para a sua rotina.' },
  { Icone: ShieldCheck, titulo: 'Durabilidade', texto: 'Qualidade que acompanha o tempo.' },
  { Icone: Diamond, titulo: 'Estilo', texto: 'Design que valoriza o seu ambiente.' },
]

/*
 * TODO(cliente): o texto sobre a Edna foi escrito sem entrevista. Conferir com
 * ela (tempo de loja, cidade, como atende) antes de publicar.
 */
export function Sobre() {
  return (
    <section id="sobre" className="secao" aria-labelledby="titulo-sobre">
      <div className="conteiner">
        <div className={sec.cabecalho}>
          <h2 id="titulo-sobre" className={sec.titulo}>
            Sobre a Nobre Estofados
          </h2>
        </div>

        <div className={s.grade}>
          <figure className={s.retrato} data-revelar>
            {/* eslint-disable-next-line @next/next/no-img-element -- foto única, no tamanho em que aparece */}
            <img src="/imagens/edna.webp" alt="Edna, dona da Nobre Estofados, na loja" width={312} height={470} loading="lazy" decoding="async" />
            <figcaption>Edna, à frente da Nobre</figcaption>
          </figure>

          <div className={s.texto}>
            <h3 className={s.titulo} data-revelar>
              Qualidade que se sente.
            </h3>
            <div className={s.paragrafos} data-revelar style={{ '--atraso': 80 } as CSSProperties}>
              <p>
                À frente da Nobre está a Edna. É ela quem ajuda cada cliente a escolher o sofá certo, com atenção às
                medidas da sala, ao conforto e ao jeito de cada casa.
              </p>
              <p>
                Cada modelo do catálogo é escolhido pelo que faz diferença no dia a dia: assento confortável, estrutura
                resistente e um desenho que continua bonito com os anos.
              </p>
            </div>

            <ul className={s.pilares}>
              {PILARES.map(({ Icone, titulo, texto }, i) => (
                <li key={titulo} data-revelar style={{ '--atraso': 140 + i * 80 } as CSSProperties}>
                  <Icone aria-hidden weight="light" className={s.icone} />
                  <p className={s.pilarTitulo}>{titulo}</p>
                  <p className={s.pilarTexto}>{texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
