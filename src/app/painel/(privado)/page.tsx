import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from '@phosphor-icons/react/dist/ssr'
import { PrecoRapido } from '@/components/painel/PrecoRapido'
import { contarInteresses, listarProdutosPainel } from '@/lib/painel/consultas'
import { formatarPreco } from '@/lib/site'
import s from '../painel.module.css'

export const metadata: Metadata = { title: 'Sofás' }

/*
 * A tela principal: a lista dos sofás com o preço editável ali mesmo.
 *
 * Sofá de preço único ganha um campo aqui mesmo, com botão do lado. Sofá com
 * vários tamanhos ou preço por tecido (quase todos, desde a tabela da fábrica)
 * mostra o "a partir de" e leva pra página dele, onde cabem os três tecidos.
 */

const ABAS = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'ativo', rotulo: 'No ar' },
  { chave: 'rascunho', rotulo: 'Rascunho' },
  { chave: 'arquivado', rotulo: 'Fora do ar' },
] as const

export default async function PaginaSofas({ searchParams }: PageProps<'/painel'>) {
  const parametros = await searchParams
  const aba = ABAS.find((a) => a.chave === parametros.status)?.chave ?? 'todos'

  const [produtos, procura] = await Promise.all([listarProdutosPainel(), contarInteresses()])
  const lista = aba === 'todos' ? produtos : produtos.filter((p) => p.status === aba)

  return (
    <>
      <div className={s.cabecalhoPagina}>
        <div>
          <h1 className={s.titulo}>Sofás</h1>
          <p className={s.subtitulo}>
            {produtos.length} no catálogo · {produtos.filter((p) => p.status === 'ativo').length} aparecendo no site
          </p>
        </div>
        <Link href="/painel/sofa/novo" className={s.botao}>
          <Plus aria-hidden weight="bold" />
          Novo sofá
        </Link>
      </div>

      <div className={s.filtros}>
        {ABAS.map((a) => (
          <Link
            key={a.chave}
            href={a.chave === 'todos' ? '/painel' : `/painel?status=${a.chave}`}
            className={s.filtro}
            aria-pressed={aba === a.chave}
          >
            {a.rotulo}
          </Link>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className={s.vazio}>Nenhum sofá aqui ainda.</p>
      ) : (
        <div className={s.lista}>
          {lista.map((produto) => {
            const foto = produto.midias.find((m) => m.tipo === 'foto')
            const pedidos = procura.get(produto.id) ?? 0
            // Campo rápido só pra preço único; tabela por tecido se edita na página do sofá
            const umaVariacao =
              produto.variacoes.length === 1 && produto.variacoes[0].precosTecido === null ? produto.variacoes[0] : null
            const menorPreco = Math.min(...produto.variacoes.map((v) => v.precoCentavos ?? Infinity))
            const tamanhos = produto.variacoes.length > 1 ? `${produto.variacoes.length} tamanhos` : ''
            const tecidos = produto.variacoes.some((v) => v.precosTecido) ? '3 tecidos' : ''

            return (
              <article key={produto.id} className={s.linha}>
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura do Storage, sem otimização do Next
                  <img src={foto.src} alt="" className={s.miniatura} loading="lazy" />
                ) : (
                  <div className={`${s.miniatura} ${s.semFoto}`}>sem foto</div>
                )}

                <div>
                  <Link href={`/painel/sofa/${produto.id}`} className={s.nomeSofa}>
                    {produto.nome}
                  </Link>
                  <p className={s.metaSofa}>
                    <span
                      className={`${s.etiqueta} ${
                        produto.status === 'ativo' ? s.etiquetaNoAr : produto.status === 'arquivado' ? s.etiquetaFora : ''
                      }`}
                    >
                      {produto.status === 'ativo' ? 'No ar' : produto.status === 'rascunho' ? 'Rascunho' : 'Fora do ar'}
                    </span>
                    <span>{produto.categoria.nome}</span>
                    {pedidos > 0 && <span>{pedidos} no WhatsApp em 30 dias</span>}
                  </p>
                </div>

                {umaVariacao ? (
                  <PrecoRapido variacaoId={umaVariacao.id} precoCentavos={umaVariacao.precoCentavos} nome={produto.nome} />
                ) : (
                  <p className={s.varias}>
                    {Number.isFinite(menorPreco) ? `a partir de ${formatarPreco(menorPreco)}` : 'sem preço'}
                    <br />
                    {[tamanhos, tecidos].filter(Boolean).join(', ')} ·{' '}
                    <Link href={`/painel/sofa/${produto.id}`}>editar preços</Link>
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
