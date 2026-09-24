import type { Metadata } from 'next'

/*
 * Casca do painel inteiro, inclusive a tela de entrar.
 *
 * Aqui não tem trava de login: quem tranca é o proxy (cookie) e o
 * exigirAdmin() de cada página. O layout de dentro, em (privado), é que
 * desenha o cabeçalho de quem já entrou.
 */

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false, nocache: true },
}

export default function LayoutPainel({ children }: LayoutProps<'/painel'>) {
  return children
}
