import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import s from './Banner.module.css'

const FOTO = [960, 1600].map((l) => `/imagens/banner-${l}.webp ${l}w`).join(', ')

/** Pausa institucional entre a compra e o Sobre: ambiente, não produto. */
export function Banner() {
  return (
    <section className={`escuro ${s.banner}`} aria-labelledby="titulo-banner">
      <div className={s.foto}>
        {/* eslint-disable-next-line @next/next/no-img-element -- já em duas larguras */}
        <img
          src="/imagens/banner-960.webp"
          srcSet={FOTO}
          sizes="(max-width: 767px) 100vw, 62vw"
          width={2910}
          height={1715}
          alt="Canto Chaise Veneza em tecido fendi, numa sala com parede escura e luminárias acesas"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className={`conteiner ${s.conteudo}`}>
        <div className={s.texto} data-revelar>
          <h2 id="titulo-banner" className={s.titulo}>
            Sofás para todos os momentos da sua vida.
          </h2>
          <p className={s.paragrafo}>
            Da sala da família ao seu cantinho de descanso: retráteis, de canto, sofás-cama e poltronas para fazer parte
            das suas melhores histórias.
          </p>
          <Link href="/loja" className={`${b.botao} ${b.acento}`}>
            Conheça a coleção
            <ArrowRight aria-hidden className={b.seta} />
          </Link>
        </div>
        <p className={s.frase} aria-hidden data-revelar="fade">
          Seu lar,
          <br />
          mais completo
          <br />
          com Nobre.
        </p>
      </div>
    </section>
  )
}
