import 'server-only'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { SITE_INDEXAVEL, telefoneExibicao } from '@/lib/site'
import { clientePublico } from '@/lib/supabase/publico'

/*
 * Configurações que a Edna muda no painel: WhatsApp, Instagram, entrega,
 * parcelas e a faixa de aviso.
 *
 * Vem do banco (tabela configuracoes, uma linha só) em cache com a tag
 * "configuracoes"; o painel limpa a tag ao salvar. Se o banco não responder,
 * o site usa os valores padrão abaixo em vez de cair.
 *
 * TODO(cliente): o WhatsApp do banco ainda é o de exemplo. A Edna troca pelo
 * dela no painel (sites/070 - Nobre Estofados/memoria.md).
 */

export const TAG_CONFIGURACOES = 'configuracoes'

export type ConfiguracoesLoja = {
  /** Só dígitos, com DDI: "5511900000000". */
  whatsapp: string
  whatsappExibicao: string
  /** Ainda é o número de exemplo: o rodapé avisa, e no domínio de verdade o build para. */
  whatsappDeExemplo: boolean
  instagram: string | null
  instagramUsuario: string | null
  /**
   * Frase de entrega ("Entregamos em Irecê e região"). Hoje não tem onde
   * aparecer: era da faixa do topo, tirada em 2026-09-22. Precisa de lugar no
   * site antes de a Edna preencher.
   */
  textoEntrega: string | null
  /** Parcelas sem juros no cartão ("em até 12x"). null esconde a linha do card. */
  parcelas: number | null
  /** Faixa de aviso no topo da loja ("Fechados dia 7"). null esconde. */
  aviso: string | null
}

const WHATSAPP_EXEMPLO = '5511900000000'

export const CONFIGURACOES_PADRAO: ConfiguracoesLoja = {
  whatsapp: WHATSAPP_EXEMPLO,
  whatsappExibicao: telefoneExibicao(WHATSAPP_EXEMPLO),
  whatsappDeExemplo: true,
  instagram: null,
  instagramUsuario: null,
  textoEntrega: null,
  parcelas: null,
  aviso: null,
}

/** "@nobreestofados" a partir do endereço do perfil. */
export function usuarioInstagram(url: string) {
  const usuario = url.match(/instagram\.com\/([\w.]+)/i)?.[1]
  return usuario ? `@${usuario}` : null
}

type LinhaConfiguracoes = {
  whatsapp: string
  instagram: string
  texto_entrega: string
  parcelas: number | null
  aviso_texto: string
  aviso_ativo: boolean
}

async function consultar(): Promise<ConfiguracoesLoja> {
  const { data, error } = await clientePublico()
    .from('configuracoes')
    .select('whatsapp, instagram, texto_entrega, parcelas, aviso_texto, aviso_ativo')
    .maybeSingle<LinhaConfiguracoes>()

  if (error || !data) return CONFIGURACOES_PADRAO

  const whatsapp = data.whatsapp || WHATSAPP_EXEMPLO
  return {
    whatsapp,
    whatsappExibicao: telefoneExibicao(whatsapp),
    whatsappDeExemplo: whatsapp === WHATSAPP_EXEMPLO,
    instagram: data.instagram || null,
    instagramUsuario: data.instagram ? usuarioInstagram(data.instagram) : null,
    textoEntrega: data.texto_entrega || null,
    parcelas: data.parcelas,
    aviso: data.aviso_ativo && data.aviso_texto ? data.aviso_texto : null,
  }
}

/** Site no domínio de verdade com o WhatsApp de exemplo: melhor não publicar do que mandar cliente pra um número errado. */
function conferir(config: ConfiguracoesLoja) {
  if (SITE_INDEXAVEL && config.whatsappDeExemplo) {
    throw new Error('O WhatsApp da loja ainda é o de exemplo. Cadastre o número da Edna no painel antes de publicar.')
  }
  return config
}

const emCache = unstable_cache(consultar, ['configuracoes-nobre'], {
  tags: [TAG_CONFIGURACOES],
  revalidate: 300,
})

export const lerConfiguracoes = cache(async (): Promise<ConfiguracoesLoja> => conferir(await emCache()))
