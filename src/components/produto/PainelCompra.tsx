'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ShoppingCartSimple, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import { carrinho } from '@/components/carrinho/estado'
import b from '@/components/ui/botao.module.css'
import { paraItem, paraMensagem } from '@/lib/carrinho/tipos'
import { NOME_LINHA, buscarTecido } from '@/lib/catalogo/tecidos'
import { disponivel, precoNaLinha, temTecidos, type Disponibilidade, type Produto } from '@/lib/catalogo/tipos'
import { PRAZO_ENTREGA_DIAS, formatarPreco } from '@/lib/site'
import { linkWhatsApp } from '@/lib/whatsapp'
import { EscolhaTecido } from './EscolhaTecido'
import s from './PainelCompra.module.css'

function textoDisponibilidade(d: Disponibilidade) {
  switch (d.tipo) {
    case 'pronta-entrega':
      return 'Pronta entrega.'
    case 'sob-encomenda':
      return d.prazoDias ? `Sob encomenda: fica pronto em até ${d.prazoDias} dias.` : 'Sob encomenda: o prazo sai na conversa.'
    case 'indisponivel':
      return 'Indisponível no momento.'
    default:
      return `Prazo de entrega: ${PRAZO_ENTREGA_DIAS} dias.`
  }
}

type Props = { produto: Produto; whatsapp: string; parcelas: number | null }

/**
 * Preço, tamanho, tecido e os botões de compra. O link do WhatsApp é montado
 * aqui com o que foi escolhido, a partir dos dados do produto que vieram do
 * servidor. O preço muda com o tamanho e com a linha do tecido.
 *
 * No celular, quando os botões saem da tela, uma barra com o "Comprar pelo
 * WhatsApp" gruda embaixo: a pessoa lê as medidas sem perder o botão.
 */
export function PainelCompra({ produto, whatsapp, parcelas }: Props) {
  const [variacaoId, setVariacaoId] = useState(produto.variacoes[0]?.id)
  const [codigoTecido, setCodigoTecido] = useState<string | null>(null)
  const [adicionado, setAdicionado] = useState(false)
  const [barra, setBarra] = useState(false)
  const botoes = useRef<HTMLDivElement>(null)

  const variacao = produto.variacoes.find((v) => v.id === variacaoId) ?? produto.variacoes[0]

  useEffect(() => {
    if (!adicionado) return
    const tempo = window.setTimeout(() => setAdicionado(false), 2600)
    return () => window.clearTimeout(tempo)
  }, [adicionado])

  useEffect(() => {
    const alvo = botoes.current
    if (!alvo) return
    // Só depois de passar pelos botões (acima da tela), nunca antes de chegar neles
    const observador = new IntersectionObserver(([e]) => setBarra(!e.isIntersecting && e.boundingClientRect.top < 0))
    observador.observe(alvo)
    return () => observador.disconnect()
  }, [])

  if (!variacao) return null

  const item = paraItem(produto, variacao, 1, codigoTecido)
  const comTecido = temTecidos(produto)
  const caminho = `/produto/${produto.slug}`
  const compra = linkWhatsApp(whatsapp, { tipo: 'compra', itens: [paraMensagem(item)] })
  const pergunta = linkWhatsApp(whatsapp, { tipo: 'pergunta', nome: produto.nome, caminho })
  const aVenda = disponivel(produto)
  const preco = item.precoCentavos
  const tecido = buscarTecido(codigoTecido)

  const adicionar = () => {
    carrinho.adicionar(item)
    setAdicionado(true)
  }

  return (
    <div className={s.painel}>
      <div className={s.valor}>
        {preco !== null ? (
          <>
            {variacao.precoCheioCentavos !== null && variacao.precoCheioCentavos > preco && (
              <p className={s.cheio}>
                de <s>{formatarPreco(variacao.precoCheioCentavos)}</s> por
              </p>
            )}
            {parcelas && parcelas > 1 ? (
              <>
                {/* A parcela é o destaque; o valor à vista fica logo abaixo */}
                <p className={s.parcela}>
                  <strong>{parcelas}x</strong> de <strong>{formatarPreco(Math.round(preco / parcelas))}</strong>
                </p>
                <p className={s.total}>
                  ou <strong>{formatarPreco(preco)}</strong> à vista
                </p>
              </>
            ) : (
              <p className={s.preco}>{formatarPreco(preco)}</p>
            )}
            {item.linha && (
              <p className={s.nota}>
                {/* Sem "o tecido mais em conta": a Edna não quer o veludo parecendo tecido pior */}
                {tecido ? `No ${tecido.nome}` : `No ${NOME_LINHA[item.linha].toLowerCase()}`}
              </p>
            )}
          </>
        ) : (
          <>
            <p className={s.consulte}>Consulte o valor no WhatsApp</p>
            <p className={s.nota}>A Nobre te responde com o valor.</p>
          </>
        )}
      </div>

      {produto.variacoes.length > 1 && (
        <fieldset className={s.opcoes}>
          {/* "2,30 m", "2 lugares": toda opção com número é tamanho */}
          <legend>{produto.variacoes.every((v) => /\d/.test(v.nome ?? '')) ? 'Escolha o tamanho' : 'Escolha a opção'}</legend>
          <div className={s.listaOpcoes}>
            {produto.variacoes.map((v) => {
              // Cada tamanho no tecido que está escolhido agora
              const valor = precoNaLinha(v, item.linha)
              return (
                <label key={v.id} className={s.opcao}>
                  <input type="radio" name="opcao" value={v.id} checked={v.id === variacao.id} onChange={() => setVariacaoId(v.id)} />
                  <span className={s.opcaoNome}>{v.nome}</span>
                  {/* A parcela em destaque e o valor à vista embaixo, menor, como no preço lá em cima */}
                  {valor !== null &&
                    (parcelas && parcelas > 1 ? (
                      <span className={s.opcaoPreco}>
                        <span className={s.opcaoParcela}>
                          {parcelas}x de {formatarPreco(Math.round(valor / parcelas))}
                        </span>
                        <span className={s.opcaoVista}>ou {formatarPreco(valor)} à vista</span>
                      </span>
                    ) : (
                      <span className={s.opcaoPreco}>{formatarPreco(valor)}</span>
                    ))}
                </label>
              )
            })}
          </div>
          {/* Frase da Edna, do jeito que ela escreve pros clientes no WhatsApp */}
          <p className={s.ajudaTamanho}>
            Não sabe qual tamanho escolher?{' '}
            <a
              href={linkWhatsApp(whatsapp, { tipo: 'tamanho', nome: produto.nome, caminho })}
              target="_blank"
              rel="noopener"
            >
              Me chame que eu te ajudo.
            </a>
          </p>
        </fieldset>
      )}

      {comTecido && <EscolhaTecido escolhido={codigoTecido} onEscolher={setCodigoTecido} />}

      <p className={s.disponibilidade} data-tipo={produto.disponibilidade.tipo}>
        {textoDisponibilidade(produto.disponibilidade)}
      </p>

      <div ref={botoes} className={s.botoes}>
        {aVenda ? (
          <>
            <a href={compra} target="_blank" rel="noopener" className={`${b.botao} ${b.principal} ${s.comprar}`}>
              <WhatsappLogo aria-hidden weight="fill" />
              Comprar pelo WhatsApp
            </a>
            <button type="button" className={`${b.botao} ${b.contorno}`} onClick={adicionar} data-feito={adicionado || undefined}>
              {adicionado ? <Check aria-hidden weight="bold" /> : <ShoppingCartSimple aria-hidden />}
              <span aria-live="polite">{adicionado ? 'Adicionado ao carrinho' : 'Adicionar ao carrinho'}</span>
            </button>
          </>
        ) : (
          <a href={pergunta} target="_blank" rel="noopener" className={`${b.botao} ${b.principal} ${s.comprar}`}>
            <WhatsappLogo aria-hidden weight="fill" />
            Perguntar quando volta
          </a>
        )}
      </div>

      {aVenda && (
        <p className={s.explica}>
          Ao tocar em <strong>Comprar pelo WhatsApp</strong>, a conversa abre com o modelo
          {preco !== null ? ' e o valor já escritos. É só enviar.' : ' já escrito. É só enviar, e a Nobre te passa o valor.'}
        </p>
      )}

      {aVenda && (
        <div className={s.barra} data-visivel={barra || undefined} inert={!barra}>
          <a href={compra} target="_blank" rel="noopener" className={`${b.botao} ${b.principal} ${b.largo}`}>
            <WhatsappLogo aria-hidden weight="fill" />
            Comprar pelo WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
