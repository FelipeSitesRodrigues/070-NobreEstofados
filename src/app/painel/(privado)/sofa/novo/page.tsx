import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import { FormSofa } from '@/components/painel/FormSofa'
import { listarCategoriasPainel } from '@/lib/painel/consultas'
import s from '../../../painel.module.css'

export const metadata: Metadata = { title: 'Novo sofá' }

/*
 * Sofá novo nasce sem foto: primeiro salva o cadastro, depois a página dele
 * abre com o envio de fotos. Tentar as duas coisas de uma vez daria um
 * formulário que perde tudo se algo falhar no meio.
 */
export default async function PaginaNovoSofa() {
  const categorias = await listarCategoriasPainel()

  return (
    <>
      <Link href="/painel" className={s.voltar}>
        <ArrowLeft aria-hidden weight="bold" />
        Todos os sofás
      </Link>

      <div className={s.cabecalhoPagina}>
        <div>
          <h1 className={s.titulo}>Novo sofá</h1>
          <p className={s.subtitulo}>Depois de salvar, você manda as fotos.</p>
        </div>
      </div>

      <FormSofa produto={null} categorias={categorias} />
    </>
  )
}
