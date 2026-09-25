'use client'

import { useState } from 'react'
import { Play } from '@phosphor-icons/react/dist/ssr'
import { Foto } from '@/components/ui/Foto'
import type { Foto as FotoProduto, Video } from '@/lib/catalogo/tipos'
import s from './Galeria.module.css'

type Item = { tipo: 'foto'; foto: FotoProduto } | { tipo: 'video'; video: Video }

/**
 * Fotos e vídeos do produto na mesma galeria, como no Mercado Livre. Os
 * vídeos entram logo depois da capa, na ordem do painel, e cada um só baixa
 * quando a pessoa aperta o play.
 */
export function Galeria({ fotos, videos, nome }: { fotos: FotoProduto[]; videos: Video[]; nome: string }) {
  const itens: Item[] = fotos.map((foto) => ({ tipo: 'foto' as const, foto }))
  itens.splice(Math.min(1, itens.length), 0, ...videos.map((video) => ({ tipo: 'video' as const, video })))
  let numeroVideo = 0

  const [atual, setAtual] = useState(0)
  const [tocando, setTocando] = useState(false)
  const item = itens[atual]

  const escolher = (indice: number) => {
    setAtual(indice)
    setTocando(false)
  }

  if (!item) return <div className={`${s.principal} ${s.vazia}`}>Foto em breve</div>

  // Vídeo gravado em pé no celular (quase todo vídeo da fábrica): numa caixa
  // 16:10 ele viraria uma faixa fina. A caixa cresce e o vídeo aparece inteiro,
  // com o borrão da capa nas laterais.
  const capaEmPe = item.tipo === 'video' && item.video.capa.altura > item.video.capa.largura ? item.video.capa : null

  return (
    <div className={s.galeria}>
      <div
        className={s.principal}
        data-em-pe={capaEmPe ? '' : undefined}
        style={capaEmPe?.blur ? { backgroundImage: `url("${capaEmPe.blur}")` } : undefined}
      >
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
        <ul className={s.miniaturas} aria-label={`${videos.length > 1 ? 'Fotos e vídeos' : 'Fotos e vídeo'}: ${nome}`}>
          {itens.map((it, i) => {
            const capa = it.tipo === 'foto' ? it.foto : it.video.capa
            // Vídeo não conta como foto: "foto 2" é a segunda foto, mesmo com vídeo no meio
            if (it.tipo === 'video') numeroVideo++
            const rotuloVideo = videos.length > 1 ? `Ver o vídeo ${numeroVideo}` : 'Ver o vídeo'
            return (
              <li key={i}>
                <button
                  type="button"
                  className={s.miniatura}
                  aria-current={i === atual || undefined}
                  aria-label={it.tipo === 'video' ? rotuloVideo : `Ver a foto ${i + 1 - numeroVideo}`}
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
