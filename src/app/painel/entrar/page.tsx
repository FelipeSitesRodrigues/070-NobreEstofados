import type { Metadata } from 'next'
import { FormEntrar } from '@/components/painel/FormEntrar'
import s from '../painel.module.css'

export const metadata: Metadata = { title: 'Entrar no painel' }

const MOTIVOS: Record<string, string> = {
  expirou: 'Sua sessão passou do tempo. Entre de novo para continuar.',
  saiu: 'Você saiu do painel.',
}

export default async function PaginaEntrar({ searchParams }: PageProps<'/painel/entrar'>) {
  const parametros = await searchParams
  const motivo = typeof parametros.motivo === 'string' ? MOTIVOS[parametros.motivo] : null
  const volta = typeof parametros.volta === 'string' && parametros.volta.startsWith('/painel') ? parametros.volta : ''

  return (
    <div className={s.entrar}>
      <div className={s.caixaEntrar}>
        {/* eslint-disable-next-line @next/next/no-img-element -- logo pequeno, já no tamanho certo */}
        <img src="/imagens/logo-nobre.png" alt="Nobre Estofados" width={480} height={119} className={s.logoEntrar} />
        <h1 className={s.tituloEntrar}>Painel da loja</h1>
        <p className={s.ajudaEntrar}>Aqui você muda preço, fotos e o que aparece no site.</p>
        <FormEntrar volta={volta} motivo={motivo} />
      </div>
    </div>
  )
}
