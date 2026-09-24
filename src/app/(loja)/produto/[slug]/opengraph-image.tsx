import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { buscarProduto, listarSlugs } from '@/lib/catalogo/consultas'

/*
 * Imagem de compartilhamento do produto (a prévia do link no WhatsApp e no
 * Facebook). As fotos do site são WebP, que o WhatsApp nem sempre mostra na
 * prévia; aqui sai um JPEG 1200 x 630, recortado no ponto de foco da foto.
 * A mensagem de compra leva o link do produto, então é a Edna quem mais vê
 * esta imagem.
 */

export const size = { width: 1200, height: 630 }
export const contentType = 'image/jpeg'

export async function generateStaticParams() {
  return (await listarSlugs()).map((slug) => ({ slug }))
}

/** A maior versão da foto: arquivo local no catálogo provisório, URL do Storage depois. */
async function lerFoto(srcset: string) {
  const maior = srcset.split(', ').at(-1)?.split(' ')[0] ?? ''
  if (maior.startsWith('/')) return readFile(path.join(process.cwd(), 'public', maior))
  const resposta = await fetch(maior)
  if (!resposta.ok) throw new Error(`Foto indisponível: ${resposta.status}`)
  return Buffer.from(await resposta.arrayBuffer())
}

export default async function Imagem({ params }: { params: Promise<{ slug: string }> }) {
  const produto = await buscarProduto((await params).slug)
  const capa = produto?.fotos[0]
  if (!capa) return new Response(null, { status: 404 })

  // Cobre 1200 x 630 e corta no foco ("50% 58%"), como o card faz com object-position
  const [focoX, focoY] = capa.foco.split(' ').map((v) => Number.parseFloat(v) / 100)
  const escala = Math.max(size.width / capa.largura, size.height / capa.altura)
  const largura = Math.round(capa.largura * escala)
  const altura = Math.round(capa.altura * escala)

  const jpeg = await sharp(await lerFoto(capa.srcset))
    .resize(largura, altura)
    .extract({
      left: Math.round((largura - size.width) * (focoX || 0.5)),
      top: Math.round((altura - size.height) * (focoY || 0.5)),
      width: size.width,
      height: size.height,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()

  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': contentType } })
}
