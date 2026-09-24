'use client'

import { useState } from 'react'
import { Play } from '@phosphor-icons/react/dist/ssr'
import { Foto } from '@/components/ui/Foto'
import type { Foto as FotoProduto, Video } from '@/lib/catalogo/tipos'
import s from './Galeria.module.css'

type Item = { tipo: 'foto'; foto: FotoProduto } | { tipo: 'video'; video: Video }

/**
 * Fotos e vídeo do produto na mesma galeria, como no Mercado Livre. O vídeo
 * entra logo depois da capa e só baixa quando a pessoa aperta o play.
 */
export function Galeria({ fotos, video, nome }: { fotos: FotoProduto[]; video: Video | null; nome: string }) {
  const itens: Item[] = fotos.map((foto) => ({ tipo: 'foto' as const, foto }))
  if (video) itens.splice(Math.min(1, itens.length), 0, { tipo: 'video', video })

  const [atual, setAtual] = useState(0)
  const [tocando, setTocando] = useState(false)
  const item = itens[atual]

  const escolher = (indice: number) => {
    setAtual(indice)
    setTocando(false)
  }

  if (!item) return <div className={`${s.principal} ${s.vazia}`}>Foto em breve</div>

  return (
    <div className={s.galeria}>
      <div className={s.principal}>
        {item.tipo === 'foto' ? (
          <Foto foto={item.foto} sizes="(max-width: 1023px) 100vw, 740px" prioridade={atual === 0} />
        ) : tocando ? (
          <video src={item.video.src} poster={item.video.capa.src} controls autoPlay playsInline className={s.video} />
        ) : (
          <button type="button" className={s.capaVideo} onClick={() => setTocando(true)}>
            <Foto foto={{ ...item.video.capa, alt: '' }} sizes="(max-width: 1023px) 100vw, 740px" />
            <span className={s.play}>
              <Play aria-hidden weight="fill" />
              Assistir ao vídeo
            </span>
          </button>
        )}
      </div>

      {itens.length > 1 && (
        <ul className={s.miniaturas} aria-label={`Fotos e vídeo: ${nome}`}>
          {itens.map((it, i) => {
            const capa = it.tipo === 'foto' ? it.foto : it.video.capa
            return (
              <li key={i}>
                <button
                  type="button"
                  className={s.miniatura}
                  aria-current={i === atual || undefined}
                  aria-label={it.tipo === 'video' ? 'Ver o vídeo' : `Ver a foto ${i + 1}`}
                  onClick={() => escolher(i)}
                >
                  <Foto foto={{ ...capa, alt: '' }} sizes="120px" />
                  {it.tipo === 'video' && (
                    <span className={s.miniPlay} aria-hidden>
                      <Play weight="fill" />
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
