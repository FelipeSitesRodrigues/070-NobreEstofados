/**
 * Dados fixos do negócio, usados no site inteiro.
 *
 * WhatsApp, Instagram, entrega e parcelas são da Edna e vêm das configurações
 * (lib/loja/configuracoes.ts), editadas no painel. Aqui só o que não muda.
 */
export const SITE = {
  nome: 'Nobre Estofados',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3070').replace(/\/+$/, ''),
  frase: 'Mais que estofados, conforto para a sua história.',
} as const

/**
 * Prazo de entrega da loja, passado pela Edna em 2026-09-24. Vale pra todo
 * sofá "Normal" no painel; sofá sob encomenda com prazo próprio usa o dele.
 * Fica aqui, e não no painel, até existir a coluna no banco.
 */
export const PRAZO_ENTREGA_DIAS = 25

/**
 * O Google só entra com o site no domínio de verdade. No endereço provisório
 * da Vercel e no localhost, robots.txt e meta robots pedem pra não indexar.
 */
export const SITE_INDEXAVEL = (() => {
  try {
    const { protocol, hostname } = new URL(SITE.url)
    return protocol === 'https:' && !hostname.endsWith('.vercel.app') && hostname !== 'localhost'
  } catch {
    return false
  }
})()

export const NAVEGACAO = [
  { rotulo: 'Início', href: '/' },
  { rotulo: 'Sofás', href: '/loja' },
  { rotulo: 'Poltronas', href: '/loja/poltronas' },
  { rotulo: 'Como comprar', href: '/#como-comprar' },
  { rotulo: 'Sobre nós', href: '/#sobre' },
  { rotulo: 'Contato', href: '#contato' },
] as const

/** Endereço completo de uma página do site: vai na mensagem do WhatsApp e no Google. */
export const urlAbsoluta = (caminho: string) => `${SITE.url}${caminho.startsWith('/') ? caminho : `/${caminho}`}`

export const formatarPreco = (centavos: number) =>
  (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** "5511900000000" vira "(11) 90000-0000". Número sem DDD aparece como veio. */
export function telefoneExibicao(digitos: string) {
  const local = digitos.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  const m = local.match(/^(\d{2})(\d{4,5})(\d{4})$/)
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : digitos
}
