import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowSquareOut, Check } from '@phosphor-icons/react/dist/ssr'
import { FormSofa } from '@/components/painel/FormSofa'
import { Midias } from '@/components/painel/Midias'
import { buscarProdutoPainel, listarCategoriasPainel } from '@/lib/painel/consultas'
import s from '../../../painel.module.css'

export const metadata: Metadata = { title: 'Editar sofá' }

export default async function PaginaSofa({ params, searchParams }: PageProps<'/painel/sofa/[id]'>) {
  const { id } = await params
  const parametros = await searchParams

  const [produto, categorias] = await Promise.all([buscarProdutoPainel(id), listarCategoriasPainel()])
  if (!produto) notFound()

  return (
    <>
      <Link href="/painel" className={s.voltar}>
        <ArrowLeft aria-hidden weight="bold" />
        Todos os sofás
      </Link>

      <div className={s.cabecalhoPagina}>
        <div>
          <h1 className={s.titulo}>{produto.nome}</h1>
          <p className={s.subtitulo}>{produto.categoria.nome}</p>
        </div>
        {produto.status === 'ativo' && (
          <a href={`/produto/${produto.slug}`} target="_blank" rel="noopener" className={s.botaoSecundario}>
            <ArrowSquareOut aria-hidden />
            Ver no site
          </a>
        )}
      </div>

      {parametros.novo === '1' && (
        <p className={s.ok} role="status">
          <Check aria-hidden weight="bold" />
          Sofá criado. Agora adicione as fotos — sem foto ele não fica bom na loja.
        </p>
      )}

      <Midias produtoId={produto.id} nomeProduto={produto.nome} midias={produto.midias} />

      <FormSofa produto={produto} categorias={categorias} />
    </>
  )
}
