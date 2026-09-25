'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Image as IconeImagem, Star, Trash, VideoCamera, Warning } from '@phosphor-icons/react'
import { concluirMidia, excluirMidia, definirCapa, prepararUpload } from '@/lib/painel/acoes/midias'
import { prepararFoto, prepararVideo } from '@/lib/painel/imagemNavegador'
import { SUPABASE_CHAVE_PUBLICA, SUPABASE_URL } from '@/lib/supabase/config'
import type { MidiaPainel } from '@/lib/painel/consultas'
import s from '@/app/painel/painel.module.css'

/*
 * Fotos e vídeos do sofá.
 *
 * O arquivo nunca passa pelo servidor do site: o navegador prepara os três
 * tamanhos, pede um link assinado e sobe direto pro Storage. Só depois o
 * servidor grava a linha no banco — a foto aparece no site nesse instante.
 *
 * Um arquivo por vez, de propósito: assim a barra anda de verdade e um erro no
 * terceiro não derruba os dois que já subiram.
 */

/** Teto do bucket no plano grátis. */
const MAX_BYTES = 50 * 1024 * 1024

const armazenamento = () =>
  createClient(SUPABASE_URL, SUPABASE_CHAVE_PUBLICA, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }).storage.from('midias')

export function Midias({
  produtoId,
  nomeProduto,
  midias,
}: {
  produtoId: string
  nomeProduto: string
  midias: MidiaPainel[]
}) {
  const router = useRouter()
  const escolherFoto = useRef<HTMLInputElement>(null)
  const escolherVideo = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [andamento, setAndamento] = useState<{ feito: number; total: number } | null>(null)
  const [emAcao, iniciar] = useTransition()

  const fotos = midias.filter((m) => m.tipo === 'foto')
  const temVideo = midias.some((m) => m.tipo === 'video')

  async function enviarFotos(arquivos: File[]) {
    setErro(null)
    for (const [indice, arquivo] of arquivos.entries()) {
      setAndamento({ feito: indice, total: arquivos.length })
      if (arquivo.size > MAX_BYTES) throw new Error(`"${arquivo.name}" é grande demais. O limite é 50 MB.`)

      const preparada = await prepararFoto(arquivo)
      const { midiaId, links } = await prepararUpload(
        produtoId,
        'foto',
        preparada.versoes.map((v) => v.largura),
      )

      for (const versao of preparada.versoes) {
        const link = links.find((l) => l.largura === versao.largura)
        if (!link) continue
        const { error } = await armazenamento().uploadToSignedUrl(link.caminho, link.token, versao.blob, {
          contentType: versao.blob.type,
        })
        if (error) throw new Error(`Não consegui enviar a foto: ${error.message}`)
      }

      await concluirMidia({
        produtoId,
        midiaId,
        tipo: 'foto',
        larguras: preparada.versoes.map((v) => v.largura),
        largura: preparada.largura,
        altura: preparada.altura,
        blur: preparada.blur,
        alt: `${nomeProduto} da Nobre Estofados`,
      })
    }
  }

  async function enviarVideo(arquivo: File) {
    setErro(null)
    if (arquivo.size > MAX_BYTES) {
      throw new Error('Esse vídeo passa de 50 MB. Mande um mais curto, de até uns 30 segundos.')
    }
    setAndamento({ feito: 0, total: 1 })

    const { capa, duracaoSegundos } = await prepararVideo(arquivo)
    const { midiaId, links } = await prepararUpload(
      produtoId,
      'video',
      capa.versoes.map((v) => v.largura),
    )

    const linkVideo = links.find((l) => l.largura === null)
    if (!linkVideo) throw new Error('Não consegui preparar o envio do vídeo.')

    const envio = await armazenamento().uploadToSignedUrl(linkVideo.caminho, linkVideo.token, arquivo, {
      contentType: 'video/mp4',
    })
    if (envio.error) throw new Error(`Não consegui enviar o vídeo: ${envio.error.message}`)

    for (const versao of capa.versoes) {
      const link = links.find((l) => l.largura === versao.largura)
      if (!link) continue
      await armazenamento().uploadToSignedUrl(link.caminho, link.token, versao.blob, {
        contentType: versao.blob.type,
      })
    }

    await concluirMidia({
      produtoId,
      midiaId,
      tipo: 'video',
      larguras: capa.versoes.map((v) => v.largura),
      largura: capa.largura,
      altura: capa.altura,
      blur: capa.blur,
      alt: `Vídeo do ${nomeProduto}`,
      duracaoSegundos,
    })
  }

  /** Tudo que fala com o Storage passa por aqui: um lugar só pra mostrar erro. */
  function executar(trabalho: () => Promise<void>) {
    iniciar(async () => {
      try {
        await trabalho()
        router.refresh()
      } catch (falha) {
        setErro(falha instanceof Error ? falha.message : 'Não consegui concluir. Tente de novo.')
      } finally {
        setAndamento(null)
      }
    })
  }

  return (
    <section className={s.cartao}>
      <h2 className={s.tituloCartao}>Fotos e vídeos</h2>
      <p className={s.ajudaCartao}>
        A primeira foto é a capa: é ela que aparece na lista da loja. Dá para mandar direto da câmera do celular.
      </p>

      {midias.length > 0 && (
        <div className={s.galeria}>
          {midias.map((midia) => (
            <div key={midia.id} className={s.fotoItem}>
              {midia.tipo === 'video' ? (
                <video src={midia.src} poster={midia.capa ?? undefined} controls preload="none" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- miniatura do Storage
                <img src={midia.src} alt={midia.alt} loading="lazy" />
              )}

              {midia.tipo === 'foto' && midia.ordem === 0 && <span className={s.capa}>Capa</span>}

              <div className={s.fotoBotoes}>
                {midia.tipo === 'foto' && midia.ordem !== 0 && (
                  <button type="button" onClick={() => executar(() => definirCapa(midia.id))} disabled={emAcao}>
                    <Star aria-hidden /> Capa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(midia.tipo === 'video' ? 'Apagar o vídeo?' : 'Apagar esta foto?')) {
                      executar(() => excluirMidia(midia.id))
                    }
                  }}
                  disabled={emAcao}
                >
                  <Trash aria-hidden /> Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={s.acoes}>
        <button type="button" className={s.botaoSecundario} onClick={() => escolherFoto.current?.click()} disabled={emAcao}>
          <IconeImagem aria-hidden />
          {fotos.length ? 'Mais fotos' : 'Adicionar fotos'}
        </button>

        <button
          type="button"
          className={s.botaoSecundario}
          onClick={() => escolherVideo.current?.click()}
          disabled={emAcao}
        >
          <VideoCamera aria-hidden />
          {temVideo ? 'Mais um vídeo' : 'Adicionar vídeo'}
        </button>
      </div>

      {/* Escondidos: quem aparece são os botões acima, com texto */}
      <input
        ref={escolherFoto}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const arquivos = [...(e.target.files ?? [])]
          e.target.value = '' // permite mandar o mesmo arquivo de novo
          if (arquivos.length) executar(() => enviarFotos(arquivos))
        }}
      />
      <input
        ref={escolherVideo}
        type="file"
        accept="video/mp4"
        hidden
        onChange={(e) => {
          const arquivo = e.target.files?.[0]
          e.target.value = ''
          if (arquivo) executar(() => enviarVideo(arquivo))
        }}
      />

      {andamento && (
        <div className={s.enviando} role="status">
          <p>
            Enviando {andamento.feito + 1} de {andamento.total}...
          </p>
          <div className={s.barra}>
            <div style={{ width: `${((andamento.feito + 0.5) / andamento.total) * 100}%` }} />
          </div>
        </div>
      )}

      {erro && (
        <p className={s.erro} role="alert">
          <Warning aria-hidden weight="fill" />
          {erro}
        </p>
      )}
    </section>
  )
}
