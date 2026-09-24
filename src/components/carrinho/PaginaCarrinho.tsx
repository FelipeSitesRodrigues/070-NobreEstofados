'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Minus, Plus, ShoppingCartSimple, Trash, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import { conferirCarrinho, type AjusteCarrinho } from '@/lib/carrinho/acoes'
import { MAX_QUANTIDADE, chaveItem, paraMensagem, quantidadeTotal, textoTecido, totalCentavos } from '@/lib/carrinho/tipos'
import { formatarPreco } from '@/lib/site'
import { linkWhatsApp } from '@/lib/whatsapp'
import { carrinho, useCarrinho, validarItens } from './estado'
import s from './PaginaCarrinho.module.css'

const textoAjuste = (a: AjusteCarrinho) =>
  a.motivo === 'indisponivel'
    ? `${a.nome} não está mais disponível e saiu do seu carrinho.`
    : `O valor de ${a.nome} foi atualizado. Confira abaixo.`

/**
 * O carrinho. Toda vez que ele muda, o servidor confere nome e preço de cada
 * item pelo catálogo; a mensagem do WhatsApp sai do que voltou de lá.
 */
export function PaginaCarrinho({ whatsapp }: { whatsapp: string }) {
  const { itens, carregado } = useCarrinho()
  const [avisos, setAvisos] = useState<string[]>([])
  // Resultado da última conferência e de qual carrinho ela era
  const [resultado, setResultado] = useState<{ assinatura: string; falhou: boolean } | null>(null)

  // Muda quando entra, sai ou muda a quantidade de um item
  const assinatura = itens.map((i) => `${chaveItem(i)}:${i.quantidade}`).join('|')

  useEffect(() => {
    if (!carregado || !assinatura) return
    let valido = true
    const espera = window.setTimeout(async () => {
      const enviados = carrinho.itensAtuais()
      try {
        const resposta = await conferirCarrinho(
          enviados.map(({ produtoId, variacaoId, tecido, nome, quantidade, precoCentavos }) => ({
            produtoId,
            variacaoId,
            tecido,
            nome,
            quantidade,
            precoCentavos,
          })),
        )
        if (!valido) return
        const textos = Array.isArray(resposta.ajustes) ? resposta.ajustes.map(textoAjuste) : []
        if (textos.length) setAvisos(textos)
        // A resposta também passa pela validação do carrinho antes de entrar
        carrinho.substituir(validarItens(resposta.itens))
        setResultado({ assinatura, falhou: false })
      } catch {
        if (valido) setResultado({ assinatura, falhou: true })
      }
    }, 250)

    return () => {
      valido = false
      window.clearTimeout(espera)
    }
  }, [assinatura, carregado])

  // Conferindo enquanto o resultado não for deste carrinho
  const conferindo = itens.length > 0 && resultado?.assinatura !== assinatura
  const falhou = !conferindo && resultado?.falhou === true

  if (!carregado) {
    return (
      <div className={`conteiner ${s.pagina}`}>
        <h1 className={s.titulo}>Seu carrinho</h1>
        <p className={s.carregando}>Carregando o seu carrinho…</p>
      </div>
    )
  }

  if (!itens.length) {
    return (
      <div className={`conteiner ${s.pagina}`}>
        <h1 className={s.titulo}>Seu carrinho</h1>
        {avisos.map((aviso) => (
          <p key={aviso} className={s.aviso} role="status">
            {aviso}
          </p>
        ))}
        <div className={s.vazio}>
          <ShoppingCartSimple aria-hidden weight="light" className={s.vazioIcone} />
          <p className={s.vazioTitulo}>Seu carrinho está vazio.</p>
          <p>
            Escolha um sofá e toque em <strong>Adicionar ao carrinho</strong>. Se preferir, compre direto pelo botão{' '}
            <strong>Comprar pelo WhatsApp</strong> de cada modelo.
          </p>
          <Link href="/loja" className={`${b.botao} ${b.principal}`}>
            Ver os sofás
          </Link>
        </div>
      </div>
    )
  }

  const total = totalCentavos(itens)
  const semPreco = itens.some((i) => i.precoCentavos === null)
  const pedido = linkWhatsApp(whatsapp, { tipo: 'compra', itens: itens.map(paraMensagem) })
  const quantidade = quantidadeTotal(itens)

  return (
    <div className={`conteiner ${s.pagina}`}>
      <Link href="/loja" className={b.link}>
        <ArrowLeft aria-hidden />
        Continuar escolhendo
      </Link>
      <h1 className={s.titulo}>Seu carrinho</h1>

      {avisos.map((aviso) => (
        <p key={aviso} className={s.aviso} role="status">
          {aviso}
        </p>
      ))}

      <div className={s.grade}>
        <ul className={s.itens} aria-label="Itens do carrinho">
          {itens.map((item) => {
            const chave = chaveItem(item)
            return (
              <li key={chave} className={s.item}>
                <Link href={`/produto/${item.slug}`} className={s.foto} tabIndex={-1} aria-hidden>
                  {item.imagem && (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura já reduzida
                    <img src={item.imagem.src} alt="" width={item.imagem.largura} height={item.imagem.altura} loading="lazy" />
                  )}
                </Link>

                <div className={s.dados}>
                  <h2 className={s.nome}>
                    <Link href={`/produto/${item.slug}`}>{item.nome}</Link>
                  </h2>
                  {(item.opcao ?? item.tamanho) && <p className={s.detalhe}>{item.opcao ?? item.tamanho}</p>}
                  {textoTecido(item) && <p className={s.detalhe}>Tecido: {textoTecido(item)}</p>}
                  <p className={s.precoUnitario}>
                    {item.precoCentavos !== null ? formatarPreco(item.precoCentavos) : 'Valor a consultar'}
                  </p>
                </div>

                <div className={s.controles}>
                  <div className={s.quantidade} role="group" aria-label={`Quantidade de ${item.nome}`}>
                    <button
                      type="button"
                      onClick={() => carrinho.alterarQuantidade(chave, item.quantidade - 1)}
                      disabled={item.quantidade <= 1}
                      aria-label="Diminuir"
                    >
                      <Minus aria-hidden weight="bold" />
                    </button>
                    <span aria-live="polite">{item.quantidade}</span>
                    <button
                      type="button"
                      onClick={() => carrinho.alterarQuantidade(chave, item.quantidade + 1)}
                      disabled={item.quantidade >= MAX_QUANTIDADE}
                      aria-label="Aumentar"
                    >
                      <Plus aria-hidden weight="bold" />
                    </button>
                  </div>
                  <button type="button" className={s.remover} onClick={() => carrinho.remover(chave)}>
                    <Trash aria-hidden />
                    Tirar do carrinho
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className={s.resumo} aria-labelledby="titulo-resumo">
          <h2 id="titulo-resumo" className={s.resumoTitulo}>
            Resumo do pedido
          </h2>
          <dl className={s.linhas}>
            <div>
              <dt>Itens</dt>
              <dd>{quantidade}</dd>
            </div>
            <div className={s.total}>
              <dt>{semPreco && total > 0 ? 'Total dos itens com preço' : 'Total'}</dt>
              <dd>{total > 0 ? formatarPreco(total) : 'A consultar'}</dd>
            </div>
          </dl>
          {semPreco && <p className={s.nota}>O valor dos itens sem preço a Nobre te passa na conversa.</p>}

          {conferindo ? (
            <span className={`${b.botao} ${b.principal} ${b.largo} ${s.enviar}`} aria-disabled="true">
              Conferindo os valores…
            </span>
          ) : (
            <a href={pedido} target="_blank" rel="noopener" className={`${b.botao} ${b.principal} ${b.largo} ${s.enviar}`}>
              <WhatsappLogo aria-hidden weight="fill" />
              Enviar pedido pelo WhatsApp
            </a>
          )}
          {falhou && (
            <p className={s.aviso} role="status">
              Não conseguimos conferir os valores agora. Você pode enviar assim mesmo: a Nobre confirma tudo na conversa.
            </p>
          )}
          <p className={s.nota}>
            A conversa abre com todos os itens {semPreco ? '' : 'e valores '}já escritos. O pagamento e a entrega você combina
            direto com a Nobre.
          </p>
        </aside>
      </div>
    </div>
  )
}
