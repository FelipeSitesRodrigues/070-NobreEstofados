'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Revela ao rolar todo elemento marcado com `data-revelar` (padrão da 065).
 *
 * Um observador só pra página inteira, em vez de um componente cliente por
 * bloco: as seções continuam Server Components e o JS enviado é mínimo.
 *
 *   data-revelar           sobe e aparece
 *   data-revelar="fade"    só aparece
 *   style={{ '--atraso': 120 }}  atraso em ms, pra escalonar cards
 */
export function RevelarAoRolar() {
  const caminho = usePathname()

  useEffect(() => {
    const html = document.documentElement
    html.classList.add('revelar-pronto')

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.add('revelado')
          observador.unobserve(entrada.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )

    const varrer = () => document.querySelectorAll('[data-revelar]:not(.revelado)').forEach((el) => observador.observe(el))

    varrer()
    const mutacoes = new MutationObserver(varrer)
    mutacoes.observe(document.body, { childList: true, subtree: true })

    return () => {
      observador.disconnect()
      mutacoes.disconnect()
    }
  }, [caminho])

  return null
}
