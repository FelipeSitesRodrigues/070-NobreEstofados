import Link from 'next/link'
import { Play, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import { Foto } from '@/components/ui/Foto'
import { largura } from '@/lib/catalogo/medidas'
import { precoMinimo, precoVaria, type Produto } from '@/lib/catalogo/tipos'
import { formatarPreco } from '@/lib/site'
import { linkWhatsApp } from '@/lib/whatsapp'
import s from './CardProduto.module.css'

/** "Ver esta poltrona", "Ver este conjunto", "Ver este sofá". */
export function rotuloVer(nome: string) {
  if (/^poltrona/i.test(nome)) return 'Ver esta poltrona'
  if (/^conjunto/i.test(nome)) return 'Ver este conjunto'
  return 'Ver este sofá'
}

const SELO_DISPONIBILIDADE: Partial<Record<Produto['disponibilidade']['tipo'], string>> = {
  'pronta-entrega': 'Pronta entrega',
  'sob-encomenda': 'Sob encomenda',
  indisponivel: 'Indisponível no momento',
}

export type PropsCard = {
  produto: Produto
  whatsapp: string
  parcelas: number | null
}

export function CardProduto({ produto, whatsapp, parcelas }: PropsCard) {
  const href = `/produto/${produto.slug}`
  const preco = precoMinimo(produto)
  const tamanho = largura(produto.medidas)
  const capa = produto.fotos[0]
  const selo = SELO_DISPONIBILIDADE[produto.disponibilidade.tipo]

  return (
    <article className={s.card}>
      {/* A foto também abre o produto; fica fora do Tab porque o nome e o botão já levam lá */}
      <Link href={href} className={s.foto} tabIndex={-1} aria-hidden>
        {capa ? (
          <Foto foto={capa} sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 430px" />
        ) : (
          <span className={s.semFoto}>Foto em breve</span>
        )}
        {produto.video && (
          <span className={s.selo}>
            <Play aria-hidden weight="fill" />
            Tem vídeo
          </span>
        )}
        {selo && (
          <span className={s.disponibilidade} data-tipo={produto.disponibilidade.tipo}>
            {selo}
          </span>
        )}
      </Link>

      <div className={s.corpo}>
        <h3 className={s.nome}>
          <Link href={href}>{produto.nome}</Link>
        </h3>
        <p className={s.tipo}>
          {produto.subtitulo}
          {tamanho && ` · ${tamanho}`}
        </p>

        <div className={s.valor}>
          {preco !== null ? (
            <>
              <p className={s.preco}>
                {precoVaria(produto) && <span>a partir de </span>}
                {formatarPreco(preco)}
              </p>
              {parcelas && parcelas > 1 && (
                <p className={s.parcela}>
                  em até {parcelas}x de {formatarPreco(Math.round(preco / parcelas))}
                </p>
              )}
            </>
          ) : (
            <p className={s.consulte}>Consulte o valor no WhatsApp</p>
          )}
        </div>

        <div className={s.acoes}>
          <Link href={href} className={`${b.botao} ${b.principal}`}>
            {rotuloVer(produto.nome)}
          </Link>
          <a
            href={linkWhatsApp(whatsapp, { tipo: 'pergunta', nome: produto.nome, caminho: href })}
            target="_blank"
            rel="noopener"
            className={`${b.botao} ${b.contorno}`}
          >
            <WhatsappLogo aria-hidden weight="fill" />
            Perguntar no WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}
