'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { ArrowRight, Play, X } from '@phosphor-icons/react/dist/ssr'
import { Foto } from '@/components/ui/Foto'
import type { Video } from '@/lib/catalogo/tipos'
import s from './Videos.module.css'

type Props = { nome: string; subtitulo: string; slug: string; video: Video }

/**
 * Capa do vídeo com o play. O vídeo só baixa quando a pessoa aperta o play:
 * abre num <dialog> e o <video> nasce ali dentro.
 */
export function CartaoVideo({ nome, subtitulo, slug, video }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const tocador = useRef<HTMLVideoElement>(null)

  const abrir = () => {
    dialogo.current?.showModal()
    tocador.current?.play().catch(() => {})
  }
  const fechar = () => dialogo.current?.close()

  return (
    <>
      <button type="button" className={s.cartao} onClick={abrir}>
        <span className={s.capa}>
          <Foto foto={{ ...video.capa, alt: '' }} sizes="(max-width: 767px) 70vw, 310px" />
          <span className={s.play} aria-hidden>
            <Play weight="fill" />
          </span>
        </span>
        <span className={s.legenda}>
          <span className={s.nome}>{nome}</span>
          <span className={s.subtitulo}>Assistir ao vídeo · {subtitulo}</span>
        </span>
      </button>

      <dialog
        ref={dialogo}
        className={s.dialogo}
        aria-label={`Vídeo: ${nome}`}
        onClose={() => tocador.current?.pause()}
        onClick={(evento) => evento.target === dialogo.current && fechar()}
      >
        <button type="button" className={s.fechar} onClick={fechar}>
          <X aria-hidden />
          Fechar
        </button>
        <video ref={tocador} src={video.src} poster={video.capa.src} controls playsInline preload="none" />
        <Link href={`/produto/${slug}`} className={s.verProduto}>
          Ver medidas e detalhes
          <ArrowRight aria-hidden />
        </Link>
      </dialog>
    </>
  )
}
