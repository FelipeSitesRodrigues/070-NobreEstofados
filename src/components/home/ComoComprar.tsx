import type { CSSProperties } from 'react'
import { Couch, Handshake, Ruler, Truck, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import sec from '@/components/ui/secao.module.css'
import s from './ComoComprar.module.css'

const PASSOS = [
  { Icone: Couch, titulo: 'Escolha o sofá', texto: 'Veja as fotos e todas as informações de cada modelo.' },
  { Icone: Ruler, titulo: 'Confira o tamanho', texto: 'Compare as medidas com o espaço da sua sala.' },
  { Icone: WhatsappLogo, titulo: 'Compre pelo WhatsApp', texto: 'Toque em "Comprar pelo WhatsApp": a mensagem já vai pronta.' },
  { Icone: Truck, titulo: 'Combine pagamento e entrega', texto: 'A Nobre confirma tudo com você na conversa.' },
]

export function ComoComprar({ linkWhatsApp }: { linkWhatsApp: string }) {
  return (
    <section id="como-comprar" className={`secao ${s.secao}`} aria-labelledby="titulo-comprar">
      <div className="conteiner">
        <div className={sec.cabecalho}>
          <h2 id="titulo-comprar" className={sec.titulo}>
            Como comprar pelo site
          </h2>
        </div>

        {/* Números aqui carregam informação: é a ordem de fazer */}
        <ol className={s.passos}>
          {PASSOS.map(({ Icone, titulo, texto }, i) => (
            <li key={titulo} className={s.passo} data-revelar style={{ '--atraso': i * 80 } as CSSProperties}>
              <span className={s.numero} aria-hidden>
                {i + 1}
              </span>
              <div>
                <Icone aria-hidden weight="light" className={s.icone} />
                <h3 className={s.titulo}>{titulo}</h3>
                <p className={s.texto}>{texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={s.rodape}>
          <div className={s.conversa} data-revelar>
            <div>
              <h3 className={s.conversaTitulo}>Prefere comprar conversando?</h3>
              <p className={s.conversaTexto}>A gente te atende no WhatsApp e ajuda a escolher o modelo certo para a sua sala.</p>
            </div>
            <a href={linkWhatsApp} target="_blank" rel="noopener" className={`${b.botao} ${b.principal}`}>
              <WhatsappLogo aria-hidden weight="fill" />
              Chamar no WhatsApp
            </a>
          </div>
          <p className={s.nota} data-revelar>
            <Handshake aria-hidden weight="light" />
            O pagamento e a entrega você combina direto com a Nobre, na conversa.
          </p>
        </div>
      </div>
    </section>
  )
}
