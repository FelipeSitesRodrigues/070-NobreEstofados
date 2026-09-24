import { notFound } from 'next/navigation'

/**
 * Qualquer endereço que não existe cai aqui e mostra o not-found da loja, com
 * cabeçalho, rodapé e WhatsApp. Sem isso o Next usaria a página de erro crua
 * do layout raiz.
 */
export default function Resto() {
  notFound()
}
