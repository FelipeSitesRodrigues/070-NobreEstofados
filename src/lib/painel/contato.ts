/*
 * Arruma o que a Edna digita nos campos de contato. Fica fora do arquivo de
 * ações porque lá só pode morar função assíncrona ("use server").
 */

/** "(11) 90000-0000" vira "5511900000000". Número que já vem com 55 fica como está. */
export function normalizarWhatsapp(bruto: string) {
  const digitos = bruto.replace(/\D/g, '')
  if (!digitos) return ''
  if (digitos.length >= 12 && digitos.startsWith('55')) return digitos.slice(0, 13)
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`
  return digitos.slice(0, 13)
}

/** Aceita "@nobreestofados", "nobreestofados" ou o link inteiro do perfil. */
export function normalizarInstagram(bruto: string) {
  const limpo = bruto.trim().replace(/^@/, '')
  if (!limpo) return ''
  if (/^https?:\/\//i.test(limpo)) {
    const usuario = limpo.match(/instagram\.com\/([\w.]+)/i)?.[1]
    return usuario ? `https://instagram.com/${usuario}` : ''
  }
  return /^[\w.]+$/.test(limpo) ? `https://instagram.com/${limpo}` : ''
}
