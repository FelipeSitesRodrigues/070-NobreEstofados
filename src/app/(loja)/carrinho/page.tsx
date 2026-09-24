import type { Metadata } from 'next'
import { PaginaCarrinho } from '@/components/carrinho/PaginaCarrinho'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'

export const metadata: Metadata = {
  title: 'Seu carrinho',
  robots: { index: false, follow: true },
}

export default async function Carrinho() {
  const config = await lerConfiguracoes()
  return <PaginaCarrinho whatsapp={config.whatsapp} />
}
