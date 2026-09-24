import sec from '@/components/ui/secao.module.css'
import type { Produto } from '@/lib/catalogo/tipos'
import { CartaoVideo } from './CartaoVideo'
import s from './Videos.module.css'

/**
 * Sofás em vídeo. Só aparece quando a Edna já subiu vídeo em algum produto:
 * seção vazia ou com vídeo de mentira confunde mais do que ajuda.
 */
export function Videos({ produtos }: { produtos: Produto[] }) {
  const comVideo = produtos.filter((p) => p.video)
  if (!comVideo.length) return null

  return (
    <section className="secao escuro" aria-labelledby="titulo-videos">
      <div className="conteiner">
        <div className={sec.cabecalho}>
          <h2 id="titulo-videos" className={sec.titulo}>
            Veja os sofás em vídeo
          </h2>
        </div>
        <ul className={s.lista} data-revelar>
          {comVideo.map((produto) => (
            <li key={produto.id}>
              <CartaoVideo nome={produto.nome} subtitulo={produto.subtitulo} slug={produto.slug} video={produto.video!} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
