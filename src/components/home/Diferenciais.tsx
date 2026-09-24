import { ChatsCircle, Couch, MonitorPlay, Ruler, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import s from './Diferenciais.module.css'

const FIXOS = [
  { Icone: Ruler, titulo: 'Medidas completas', texto: 'Tamanho certo para a sua sala' },
  { Icone: WhatsappLogo, titulo: 'Compra pelo WhatsApp', texto: 'A mensagem já vai pronta' },
  { Icone: ChatsCircle, titulo: 'Atendimento de perto', texto: 'Tire suas dúvidas antes de comprar' },
]

/**
 * A faixa logo abaixo do hero: o que faz a compra na Nobre ser simples. O
 * primeiro item só fala de vídeo quando já existe vídeo cadastrado.
 */
export function Diferenciais({ temVideo, total }: { temVideo: boolean; total: number }) {
  const ITENS = [
    temVideo
      ? { Icone: MonitorPlay, titulo: 'Sofás em vídeo', texto: 'Veja os modelos em movimento' }
      : { Icone: Couch, titulo: `${total} modelos para escolher`, texto: 'Retráteis, de canto, sofás-cama e poltronas' },
    ...FIXOS,
  ]

  return (
    <section className={s.faixa} aria-label="Por que comprar na Nobre">
      <ul className={`conteiner ${s.lista}`}>
        {ITENS.map(({ Icone, titulo, texto }) => (
          <li key={titulo} className={s.item}>
            <Icone aria-hidden weight="light" className={s.icone} />
            <div>
              <p className={s.titulo}>{titulo}</p>
              <p className={s.texto}>{texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
