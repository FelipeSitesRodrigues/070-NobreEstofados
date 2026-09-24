import Link from 'next/link'
import { ArrowRight, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import s from './Hero.module.css'

const DESKTOP = [960, 1440, 1672].map((l) => `/imagens/hero-desktop-${l}.webp ${l}w`).join(', ')
const CELULAR = [480, 720, 941].map((l) => `/imagens/hero-mobile-${l}.webp ${l}w`).join(', ')

/**
 * Hero: a foto ocupa o hero inteiro nas duas telas. No desktop o texto fica à
 * esquerda, sobre a parte clara da sala; no celular, em cima, sobre a parede,
 * com o sofá embaixo. É a imagem mais importante da página: carrega primeiro.
 */
export function Hero({ linkWhatsApp }: { linkWhatsApp: string }) {
  return (
    <section className={s.hero} aria-labelledby="titulo-hero">
      <picture className={s.fundo}>
        <source media="(max-width: 767px)" srcSet={CELULAR} sizes="100vw" width={941} height={1672} />
        <img
          src="/imagens/hero-desktop-1440.webp"
          srcSet={DESKTOP}
          sizes="100vw"
          width={1672}
          height={941}
          alt="Sofá Porto Príncipe, retrátil, em tecido cinza claro, numa sala com painel de madeira e luz quente"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className={s.veu} aria-hidden />

      <div className={`conteiner ${s.conteudo}`}>
        <div className={s.texto}>
          <h1 id="titulo-hero" className={s.titulo}>
            {/* No desktop, as três linhas do mockup; no celular a frase quebra sozinha */}
            <span className={s.linha}>Mais que estofados,</span> <span className={s.linha}>conforto para a</span>{' '}
            <span className={s.linha}>sua história.</span>
          </h1>
          <p className={s.sub}>
            Escolha o seu sofá, confira as medidas e compre pelo WhatsApp, com a mensagem já pronta.
          </p>
          <div className={s.acoes}>
            <Link href="/loja" className={`${b.botao} ${b.principal}`}>
              Ver os sofás
              <ArrowRight aria-hidden className={b.seta} />
            </Link>
            <a href={linkWhatsApp} target="_blank" rel="noopener" className={`${b.botao} ${s.botaoWhats}`}>
              <WhatsappLogo aria-hidden weight="fill" />
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      <Link href="/produto/sofa-porto-principe" className={s.legenda}>
        Sofá Porto Príncipe
        <ArrowRight aria-hidden />
      </Link>
    </section>
  )
}
