/*
 * Prepara foto e vídeo no navegador, antes de subir.
 *
 * Por que aqui e não no servidor: o arquivo vai direto pro Storage por link
 * assinado, sem passar pela Vercel (que recusa acima de 4,5 MB). Então quem
 * redimensiona é a máquina da Edna, com canvas. É a mesma receita do
 * scripts/preparar-fotos.mjs, só que em vez do sharp é o navegador.
 *
 * Três larguras (480, 960, 1440) pro srcset da loja: no celular baixa a menor,
 * na TV do showroom a maior. Mais o borrão de 20 px que aparece enquanto a
 * foto de verdade carrega.
 *
 * Armadilha conhecida: o Safari do iPhone aceita "image/webp" no toBlob e
 * devolve PNG gigante. Por isso o tipo do blob é conferido, e a saída pode ser
 * JPEG — o bucket aceita os dois, e o que vale pro navegador é o content-type,
 * não a terminação do arquivo.
 */

export const LARGURAS = [480, 960, 1440] as const

export type VersaoFoto = { largura: number; blob: Blob }
export type FotoPreparada = {
  versoes: VersaoFoto[]
  /** Medidas da maior versão gerada. */
  largura: number
  altura: number
  blur: string | null
}

function desenhar(fonte: CanvasImageSource, largura: number, altura: number) {
  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura
  const contexto = canvas.getContext('2d')
  if (!contexto) throw new Error('Este navegador não consegue preparar a foto.')
  contexto.imageSmoothingQuality = 'high'
  contexto.drawImage(fonte, 0, 0, largura, altura)
  return canvas
}

function paraBlob(canvas: HTMLCanvasElement, tipo: string, qualidade: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, tipo, qualidade))
}

/** WebP quando o navegador sabe fazer; JPEG quando ele mente (Safari). */
async function comprimir(canvas: HTMLCanvasElement, qualidade: number) {
  const webp = await paraBlob(canvas, 'image/webp', qualidade)
  if (webp && webp.type === 'image/webp') return webp
  const jpeg = await paraBlob(canvas, 'image/jpeg', Math.min(qualidade + 0.05, 0.95))
  if (!jpeg) throw new Error('Não consegui preparar essa foto. Tente outra.')
  return jpeg
}

const paraDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => resolve(String(leitor.result))
    leitor.onerror = () => reject(new Error('Não consegui ler a foto.'))
    leitor.readAsDataURL(blob)
  })

async function gerarVersoes(fonte: CanvasImageSource, larguraOriginal: number, alturaOriginal: number): Promise<FotoPreparada> {
  const proporcao = alturaOriginal / larguraOriginal
  const alvos = LARGURAS.filter((l) => l <= larguraOriginal)
  // Foto menor que 480 px: sobe do tamanho que veio, sem esticar
  if (!alvos.length) alvos.push(LARGURAS[0])

  const versoes: VersaoFoto[] = []
  for (const alvo of alvos) {
    const largura = Math.min(alvo, larguraOriginal)
    const altura = Math.round(largura * proporcao)
    versoes.push({ largura: alvo, blob: await comprimir(desenhar(fonte, largura, altura), 0.82) })
  }

  const maior = Math.min(alvos[alvos.length - 1], larguraOriginal)
  const borrao = await paraBlob(desenhar(fonte, 20, Math.max(1, Math.round(20 * proporcao))), 'image/webp', 0.4)
  const blur = borrao ? await paraDataUrl(borrao) : null

  return {
    versoes,
    largura: maior,
    altura: Math.round(maior * proporcao),
    // O banco só guarda borrão de até 4000 caracteres
    blur: blur && blur.length <= 4000 ? blur : null,
  }
}

export async function prepararFoto(arquivo: File): Promise<FotoPreparada> {
  let bitmap: ImageBitmap
  try {
    // "from-image" respeita a rotação do celular; sem isso a foto deita
    bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('Não consegui abrir essa foto. Tente exportar como JPEG ou PNG.')
  }

  try {
    if (Math.min(bitmap.width, bitmap.height) < 300) {
      throw new Error('Essa foto é pequena demais para o site. Use uma de pelo menos 800 pixels de largura.')
    }
    return await gerarVersoes(bitmap, bitmap.width, bitmap.height)
  } finally {
    bitmap.close()
  }
}

export type VideoPreparado = { capa: FotoPreparada; duracaoSegundos: number | null }

/** Tira um quadro do começo do vídeo pra servir de capa. */
export function prepararVideo(arquivo: File): Promise<VideoPreparado> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    const endereco = URL.createObjectURL(arquivo)
    video.src = endereco

    const desistir = (mensagem: string) => {
      URL.revokeObjectURL(endereco)
      reject(new Error(mensagem))
    }

    video.onerror = () => desistir('Não consegui abrir esse vídeo. Ele precisa ser MP4.')

    video.onloadedmetadata = () => {
      // Um segundo pra frente: o primeiro quadro costuma ser preto
      video.currentTime = Math.min(1, (video.duration || 2) / 2)
    }

    video.onseeked = async () => {
      try {
        const preparada = await gerarVersoes(video, video.videoWidth, video.videoHeight)
        const duracao = Number.isFinite(video.duration) ? Math.round(video.duration) : null
        URL.revokeObjectURL(endereco)
        resolve({ capa: preparada, duracaoSegundos: duracao && duracao > 0 ? Math.min(duracao, 600) : null })
      } catch (erro) {
        desistir(erro instanceof Error ? erro.message : 'Não consegui preparar a capa do vídeo.')
      }
    }
  })
}
