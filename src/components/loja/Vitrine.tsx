import Link from 'next/link'
import { MagnifyingGlass, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import { GradeProdutos } from '@/components/produto/GradeProdutos'
import b from '@/components/ui/botao.module.css'
import type { Categoria, Produto } from '@/lib/catalogo/tipos'
import { linkWhatsApp } from '@/lib/whatsapp'
import s from './Vitrine.module.css'

type Props = {
  titulo: string
  descricao: string | null
  produtos: Produto[]
  categorias: Categoria[]
  /** Slug da categoria aberta, ou null na loja inteira. */
  ativa: string | null
  busca: string
  whatsapp: string
  parcelas: number | null
}

/**
 * A loja: busca, os tipos de sofá em botões e a grade. Serve pra /loja (todos
 * e a busca) e pra cada categoria. A busca é um formulário comum (GET), que
 * funciona até sem JavaScript.
 */
export function Vitrine({ titulo, descricao, produtos, categorias, ativa, busca, whatsapp, parcelas }: Props) {
  const total = produtos.length

  return (
    <div className={`conteiner ${s.vitrine}`}>
      <header className={s.cabecalho}>
        <h1 className={s.titulo}>{titulo}</h1>
        {descricao && <p className={s.descricao}>{descricao}</p>}
      </header>

      <form action="/loja" role="search" className={s.busca}>
        <label htmlFor="busca">Procurar um modelo</label>
        <div className={s.campo}>
          <input id="busca" name="busca" type="search" defaultValue={busca} placeholder="Ex.: retrátil, canto, poltrona" autoComplete="off" />
          <button type="submit" className={`${b.botao} ${b.principal}`}>
            <MagnifyingGlass aria-hidden />
            Buscar
          </button>
        </div>
      </form>

      <nav aria-label="Tipos de sofá" className={s.tipos}>
        <ul>
          <li>
            <Link href="/loja" aria-current={ativa === null && !busca ? 'page' : undefined}>
              Todos os modelos
            </Link>
          </li>
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link href={`/loja/${c.slug}`} aria-current={ativa === c.slug ? 'page' : undefined}>
                {c.nome}
                <span className={s.quantidade}>{c.quantidade}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className={s.contagem} role="status">
        {busca
          ? `${total} ${total === 1 ? 'modelo encontrado' : 'modelos encontrados'} para “${busca}”`
          : `${total} ${total === 1 ? 'modelo' : 'modelos'}`}
      </p>

      {total > 0 ? (
        <GradeProdutos produtos={produtos} whatsapp={whatsapp} parcelas={parcelas} />
      ) : (
        <div className={s.vazio}>
          <p className={s.vazioTitulo}>Não achamos nenhum modelo com “{busca}”.</p>
          <p>
            Tente outra palavra, como “retrátil”, “canto” ou “cama”, ou fale com a gente: a Nobre te ajuda a encontrar.
          </p>
          <div className={s.vazioAcoes}>
            <Link href="/loja" className={`${b.botao} ${b.principal}`}>
              Ver todos os modelos
            </Link>
            <a href={linkWhatsApp(whatsapp, { tipo: 'ajuda' })} target="_blank" rel="noopener" className={`${b.botao} ${b.contorno}`}>
              <WhatsappLogo aria-hidden weight="fill" />
              Pedir ajuda no WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
