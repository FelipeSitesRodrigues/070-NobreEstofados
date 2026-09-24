import type { CSSProperties } from 'react'
import type { Foto as FotoProduto } from '@/lib/catalogo/tipos'

type Props = {
  foto: FotoProduto
  /** Largura em que a foto aparece, pro navegador escolher o arquivo certo do srcset. */
  sizes: string
  /** Só pra foto que aparece sem rolar (topo da página do produto). */
  prioridade?: boolean
  className?: string
}

/**
 * Foto de produto. Os arquivos já existem em três larguras (o painel reduz no
 * navegador da Edna antes de subir), então é um <img> com srcset, sem passar
 * pelo otimizador de imagem da Vercel. O borrão de 20 px fica de fundo até a
 * foto carregar, e largura e altura reservam o espaço (a página não pula).
 */
export function Foto({ foto, sizes, prioridade = false, className }: Props) {
  const estilo: CSSProperties = {
    objectPosition: foto.foco,
    ...(foto.blur
      ? { backgroundImage: `url("${foto.blur}")`, backgroundSize: 'cover', backgroundPosition: foto.foco }
      : null),
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- fotos já em vários tamanhos (ver comentário acima)
    <img
      src={foto.src}
      srcSet={foto.srcset}
      sizes={sizes}
      width={foto.largura}
      height={foto.altura}
      alt={foto.alt}
      loading={prioridade ? 'eager' : 'lazy'}
      fetchPriority={prioridade ? 'high' : 'auto'}
      decoding="async"
      className={className}
      style={estilo}
    />
  )
}
