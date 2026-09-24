import type { Metadata } from 'next'
import { FormConfiguracoes } from '@/components/painel/FormConfiguracoes'
import { FormSenha } from '@/components/painel/FormSenha'
import { lerConfiguracoesPainel } from '@/lib/painel/consultas'
import { exigirAdmin } from '@/lib/painel/sessao'
import s from '../../painel.module.css'

export const metadata: Metadata = { title: 'Ajustes' }

export default async function PaginaConfiguracoes() {
  const [config, { user }] = await Promise.all([lerConfiguracoesPainel(), exigirAdmin()])

  return (
    <>
      <div className={s.cabecalhoPagina}>
        <div>
          <h1 className={s.titulo}>Ajustes da loja</h1>
          <p className={s.subtitulo}>O que muda no site inteiro de uma vez.</p>
        </div>
      </div>

      <FormConfiguracoes config={config} />

      <section className={s.cartao}>
        <h2 className={s.tituloCartao}>Minha senha</h2>
        <p className={s.ajudaCartao}>Você entra com {user.email}.</p>
        <FormSenha />
      </section>
    </>
  )
}
