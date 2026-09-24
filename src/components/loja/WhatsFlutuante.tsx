'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import s from './WhatsFlutuante.module.css'

/** Onde a página já tem o próprio botão de WhatsApp fixo (produto e carrinho), o flutuante some. */
const ROTAS_COM_BOTAO_PROPRIO = ['/produto/', '/carrinho']

/** Distância rolada até o botão aparecer: no topo, o hero já tem o botão do WhatsApp. */
const APARECE_EM_PX = 320

/** Botão fixo no canto: o WhatsApp sempre à vista depois do topo, com a palavra escrita. */
export function WhatsFlutuante({ link }: { link: string }) {
  const caminho = usePathname()
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    // Uma marca invisível a 320 px do topo: quando ela sobe pra fora da tela, o botão aparece
    const marca = document.createElement('div')
    marca.setAttribute('aria-hidden', 'true')
    marca.style.cssText = `position:absolute;top:${APARECE_EM_PX}px;left:0;width:1px;height:1px;pointer-events:none`
    document.body.prepend(marca)
    const observador = new IntersectionObserver(([e]) => setVisivel(!e.isIntersecting && e.boundingClientRect.top < 0))
    observador.observe(marca)
    return () => {
      observador.disconnect()
      marca.remove()
    }
  }, [])

  if (ROTAS_COM_BOTAO_PROPRIO.some((rota) => caminho.startsWith(rota))) return null

  return (
    <a href={link} target="_blank" rel="noopener" className={s.botao} data-visivel={visivel || undefined} tabIndex={visivel ? undefined : -1}>
      <WhatsappLogo aria-hidden weight="fill" />
      <span>WhatsApp</span>
    </a>
  )
}
