'use client'

import { useState } from 'react'
import { Check, Plus, Trash, Warning } from '@phosphor-icons/react'
import { salvarProduto, type EstadoForm } from '@/lib/painel/acoes/produtos'
import { textoDeCentavos } from '@/lib/painel/dinheiro'
import type { CategoriaPainel, ProdutoPainel } from '@/lib/painel/consultas'
import s from '@/app/painel/painel.module.css'
import { useAcaoFormulario } from './useAcaoFormulario'

/*
 * Formulário do sofá.
 *
 * A ordem dos campos é a ordem em que a Edna pensa: nome, categoria, preço,
 * texto, medidas. O que é de site (endereço no Google, ordem na lista) fica no
 * fim, dentro de "Detalhes do site", porque ela quase nunca vai mexer.
 *
 * Medidas em centímetros, mas aceitando metro: quem digita "2,5" quer 250 cm,
 * e o servidor entende os dois.
 */

/*
 * Um tamanho: nome e o preço em cada linha de tecido. Sofá de preço único (o
 * Conjunto Roma, que não está na tabela da fábrica) usa só a coluna Veludo.
 */
type Linha = { chave: string; id: string | null; nome: string; veludo: string; linho: string; premium: string }

const linhaVazia = (chave: string): Linha => ({ chave, id: null, nome: '', veludo: '', linho: '', premium: '' })

function linhasIniciais(produto: ProdutoPainel | null): Linha[] {
  if (!produto?.variacoes.length) return [linhaVazia('nova-0')]
  return produto.variacoes.map((v, i) => ({
    chave: v.id ?? `nova-${i}`,
    id: v.id,
    nome: v.nome ?? '',
    veludo: textoDeCentavos(v.precosTecido?.veludo ?? v.precoCentavos),
    linho: textoDeCentavos(v.precosTecido?.linho ?? null),
    premium: textoDeCentavos(v.precosTecido?.premium ?? null),
  }))
}

const CAMPOS_PRECO = [
  { campo: 'veludo', nome: 'variacaoPreco', rotulo: 'Veludo' },
  { campo: 'linho', nome: 'variacaoPrecoLinho', rotulo: 'Linho' },
  { campo: 'premium', nome: 'variacaoPrecoPremium', rotulo: 'Premium' },
] as const

const medidaTexto = (medidas: Record<string, unknown>, campo: string) => {
  const valor = medidas[campo]
  return typeof valor === 'number' ? String(valor) : ''
}

function pecasTexto(medidas: Record<string, unknown>) {
  const pecas = medidas.pecas
  if (!Array.isArray(pecas)) return ''
  return pecas
    .map((p) => (p && typeof p === 'object' ? `${(p as { nome?: string }).nome}: ${(p as { comprimento?: number }).comprimento}` : ''))
    .filter(Boolean)
    .join('\n')
}

export function FormSofa({ produto, categorias }: { produto: ProdutoPainel | null; categorias: CategoriaPainel[] }) {
  const { estado, aoEnviar, pendente } = useAcaoFormulario<EstadoForm>(salvarProduto, { erro: null, ok: null })
  const [linhas, setLinhas] = useState<Linha[]>(() => linhasIniciais(produto))
  const [disponibilidade, setDisponibilidade] = useState(produto?.disponibilidade ?? 'disponivel')
  const medidas = produto?.medidas ?? {}

  return (
    <form onSubmit={aoEnviar} noValidate>
      {produto && <input type="hidden" name="id" value={produto.id} />}

      <section className={s.cartao}>
        <h2 className={s.tituloCartao}>O sofá</h2>

        <div className={s.campos}>
          <div className={s.campo}>
            <label htmlFor="nome">Nome</label>
            <input id="nome" name="nome" defaultValue={produto?.nome ?? ''} maxLength={120} required />
          </div>

          <div className={s.duas}>
            <div className={s.campo}>
              <label htmlFor="categoria_id">Categoria</label>
              <select id="categoria_id" name="categoria_id" defaultValue={produto?.categoria.id ?? ''} required>
                <option value="">Escolha...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={s.campo}>
              <label htmlFor="subtitulo">Linha abaixo do nome</label>
              <input
                id="subtitulo"
                name="subtitulo"
                defaultValue={produto?.subtitulo ?? ''}
                maxLength={80}
                placeholder="Retrátil e reclinável · 2,50 m"
              />
            </div>
          </div>

          <div className={s.campo}>
            <label htmlFor="descricao">Descrição</label>
            <textarea id="descricao" name="descricao" defaultValue={produto?.descricao ?? ''} maxLength={2000} />
            <p className={s.ajuda}>Como você descreveria o sofá para uma cliente na loja.</p>
          </div>
        </div>
      </section>

      <section className={s.cartao}>
        <h2 className={s.tituloCartao}>Preço</h2>
        <p className={s.ajudaCartao}>
          Uma linha por tamanho, com o preço em cada tecido. Os preços vieram da tabela da fábrica com o seu acréscimo;
          mude aqui só o que fugir da tabela. Na loja aparece o menor, como &ldquo;a partir de&rdquo;. Sofá de preço
          único: preencha só o Veludo. Tudo vazio vira &ldquo;Consulte o valor no WhatsApp&rdquo;.
        </p>

        <div className={s.campos}>
          {linhas.map((linha, i) => (
            <div key={linha.chave} className={s.tamanhoPrecos}>
              <input type="hidden" name="variacaoId" value={linha.id ?? ''} />

              <div className={s.campo}>
                <label htmlFor={`variacaoNome-${i}`}>{linhas.length > 1 ? 'Tamanho' : 'Tamanho (opcional)'}</label>
                <input
                  id={`variacaoNome-${i}`}
                  name="variacaoNome"
                  defaultValue={linha.nome}
                  maxLength={80}
                  placeholder="2,00 m"
                />
              </div>

              {CAMPOS_PRECO.map(({ campo, nome, rotulo }) => (
                <div key={campo} className={s.campo}>
                  <label htmlFor={`${nome}-${i}`}>{rotulo}</label>
                  <div className={s.dinheiro}>
                    <span>R$</span>
                    <input id={`${nome}-${i}`} name={nome} defaultValue={linha[campo]} inputMode="decimal" />
                  </div>
                </div>
              ))}

              {linhas.length > 1 && (
                <button
                  type="button"
                  className={s.tirarTamanho}
                  onClick={() => setLinhas((atuais) => atuais.filter((l) => l.chave !== linha.chave))}
                >
                  <Trash aria-hidden /> Tirar este tamanho
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className={s.botaoSecundario}
            onClick={() => setLinhas((atuais) => [...atuais, linhaVazia(`nova-${Date.now()}`)])}
          >
            <Plus aria-hidden weight="bold" />
            Outro tamanho
          </button>
        </div>
      </section>

      <section className={s.cartao}>
        <h2 className={s.tituloCartao}>Medidas</h2>
        <p className={s.ajudaCartao}>Em centímetros. Pode digitar em metro também: 2,50 vira 250 cm.</p>

        <div className={s.duas}>
          <div className={s.campo}>
            <label htmlFor="comprimento">Largura</label>
            <input id="comprimento" name="comprimento" defaultValue={medidaTexto(medidas, 'comprimento')} inputMode="decimal" />
            <p className={s.ajuda}>Tem vários tamanhos? Deixe vazio: a largura já vai no nome de cada um.</p>
          </div>
          <div className={s.campo}>
            <label htmlFor="altura">Altura</label>
            <input id="altura" name="altura" defaultValue={medidaTexto(medidas, 'altura')} inputMode="decimal" />
          </div>
          <div className={s.campo}>
            <label htmlFor="profundidade">Profundidade (fechado)</label>
            <input
              id="profundidade"
              name="profundidade"
              defaultValue={medidaTexto(medidas, 'profundidade')}
              inputMode="decimal"
            />
          </div>
          <div className={s.campo}>
            <label htmlFor="profundidadeAberto">Profundidade (aberto)</label>
            <input
              id="profundidadeAberto"
              name="profundidadeAberto"
              defaultValue={medidaTexto(medidas, 'profundidadeAberto')}
              inputMode="decimal"
            />
          </div>
          <div className={s.campo}>
            <label htmlFor="profundidadeChaise">Profundidade do chaise</label>
            <input
              id="profundidadeChaise"
              name="profundidadeChaise"
              defaultValue={medidaTexto(medidas, 'profundidadeChaise')}
              inputMode="decimal"
            />
          </div>
          <div className={s.campo}>
            <label htmlFor="comprimentoLado">Segundo lado (sofá de canto)</label>
            <input
              id="comprimentoLado"
              name="comprimentoLado"
              defaultValue={medidaTexto(medidas, 'comprimentoLado')}
              inputMode="decimal"
            />
          </div>
        </div>

        <div className={s.campo} style={{ marginTop: 16 }}>
          <label htmlFor="pecas">Peças do conjunto</label>
          <textarea
            id="pecas"
            name="pecas"
            defaultValue={pecasTexto(medidas)}
            placeholder={'Sofá 3 lugares: 210\nSofá 2 lugares: 160'}
            rows={3}
          />
          <p className={s.ajuda}>Uma peça por linha, com o comprimento depois dos dois pontos. Só para conjuntos.</p>
        </div>
      </section>

      <section className={s.cartao}>
        <h2 className={s.tituloCartao}>No site</h2>

        <div className={s.campos}>
          <div className={s.duas}>
            <div className={s.campo}>
              <label htmlFor="status">Situação</label>
              <select id="status" name="status" defaultValue={produto?.status ?? 'rascunho'}>
                <option value="ativo">No ar (aparece na loja)</option>
                <option value="rascunho">Rascunho (só eu vejo)</option>
                <option value="arquivado">Fora do ar</option>
              </select>
            </div>

            <div className={s.campo}>
              <label htmlFor="disponibilidade">Entrega</label>
              <select
                id="disponibilidade"
                name="disponibilidade"
                defaultValue={produto?.disponibilidade ?? 'disponivel'}
                onChange={(e) => setDisponibilidade(e.target.value as ProdutoPainel['disponibilidade'])}
              >
                <option value="disponivel">Normal</option>
                <option value="pronta-entrega">Pronta-entrega</option>
                <option value="sob-encomenda">Sob encomenda</option>
                <option value="indisponivel">Sem estoque</option>
              </select>
            </div>
          </div>

          {disponibilidade === 'sob-encomenda' && (
            <div className={s.campo}>
              <label htmlFor="prazo_dias">Prazo em dias</label>
              <input
                id="prazo_dias"
                name="prazo_dias"
                type="number"
                min={1}
                max={365}
                defaultValue={produto?.prazoDias ?? ''}
              />
            </div>
          )}

          <div className={s.duas}>
            <div className={s.campo}>
              <label htmlFor="fixado">Posição nos &ldquo;mais procurados&rdquo; da capa</label>
              <select id="fixado" name="fixado" defaultValue={produto?.fixado ?? ''}>
                <option value="">Deixar o site escolher</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}º lugar
                  </option>
                ))}
              </select>
            </div>

            <div className={s.campo}>
              <label htmlFor="ordem">Ordem na categoria</label>
              <input id="ordem" name="ordem" type="number" defaultValue={produto?.ordem ?? 0} />
              <p className={s.ajuda}>Menor número aparece primeiro.</p>
            </div>
          </div>

          <div className={s.campo}>
            <label htmlFor="meta_titulo">Título no Google</label>
            <input id="meta_titulo" name="meta_titulo" defaultValue={produto?.metaTitulo ?? ''} maxLength={70} />
          </div>

          <div className={s.campo}>
            <label htmlFor="meta_descricao">Descrição no Google</label>
            <input id="meta_descricao" name="meta_descricao" defaultValue={produto?.metaDescricao ?? ''} maxLength={170} />
          </div>
        </div>
      </section>

      {estado.erro && (
        <p className={s.erro} role="alert">
          <Warning aria-hidden weight="fill" />
          {estado.erro}
        </p>
      )}
      {estado.ok && (
        <p className={s.ok} role="status">
          <Check aria-hidden weight="bold" />
          {estado.ok} A loja já está mostrando.
        </p>
      )}

      <div className={s.acoes}>
        <button type="submit" className={s.botao} disabled={pendente} aria-busy={pendente}>
          {pendente ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
