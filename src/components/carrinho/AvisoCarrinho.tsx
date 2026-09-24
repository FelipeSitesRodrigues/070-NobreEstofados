'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { CheckCircle, X } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import { carrinho, useCarrinho } from './estado'
import s from './AvisoCarrinho.module.css'

const DURACAO_MS = 8000

/**
 * Aviso que sobe quando um produto entra no carrinho: diz o que aconteceu e
 * oferece o próximo passo. Some sozinho depois de 8 s; o role="status" faz o
 * leitor de tela anunciar sem roubar o foco.
 */
export function AvisoCarrinho() {
  const { ultimo } = useCarrinho()

  useEffect(() => {
    if (!ultimo) return
    const tempo = window.setTimeout(() => carrinho.esquecerUltimo(), DURACAO_MS)
    return () => window.clearTimeout(tempo)
  }, [ultimo])

  return (
    <div className={s.area} role="status">
      {ultimo && (
        <div key={ultimo.vez} className={s.aviso}>
          <CheckCircle aria-hidden weight="fill" className={s.icone} />
          <p className={s.texto}>
            <strong>{ultimo.nome}</strong> foi para o carrinho.
          </p>
          <Link href="/carrinho" className={`${b.botao} ${b.principal}`} onClick={() => carrinho.esquecerUltimo()}>
            Ver carrinho
          </Link>
          <button type="button" className={s.fechar} onClick={() => carrinho.esquecerUltimo()}>
            <X aria-hidden />
            <span className="visualmente-oculto">Fechar aviso</span>
          </button>
        </div>
      )}
    </div>
  )
}
