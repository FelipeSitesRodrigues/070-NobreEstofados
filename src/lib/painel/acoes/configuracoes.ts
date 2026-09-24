'use server'

import { atualizarConfiguracoes } from '@/lib/painel/loja'
import { normalizarInstagram, normalizarWhatsapp } from '@/lib/painel/contato'
import { exigirAdmin } from '@/lib/painel/sessao'
import type { EstadoForm } from './produtos'

/*
 * Configurações da loja: WhatsApp, Instagram, parcelas, entrega e a faixa de
 * aviso. É uma linha só no banco, que já existe.
 *
 * O WhatsApp é o campo mais importante do painel inteiro: é pra ele que vai
 * todo cliente do site. Por isso ele é conferido com rigor e, enquanto for o
 * número de exemplo, o site avisa no rodapé e o build de produção para.
 */

export async function salvarConfiguracoes(_estado: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin()

  const whatsapp = normalizarWhatsapp(String(dados.get('whatsapp') ?? ''))
  if (whatsapp && (whatsapp.length < 12 || whatsapp.length > 13)) {
    return { erro: 'O WhatsApp precisa ter DDD e número, assim: (11) 90000-0000.', ok: null }
  }

  const instagramBruto = String(dados.get('instagram') ?? '').trim()
  const instagram = normalizarInstagram(instagramBruto)
  if (instagramBruto && !instagram) {
    return { erro: 'O Instagram precisa ser o nome do perfil (@nobreestofados) ou o link dele.', ok: null }
  }

  const parcelasBruto = String(dados.get('parcelas') ?? '').trim()
  const parcelas = parcelasBruto ? Number(parcelasBruto) : null
  if (parcelas !== null && (!Number.isInteger(parcelas) || parcelas < 2 || parcelas > 24)) {
    return { erro: 'As parcelas vão de 2 a 24. Deixe vazio para não mostrar parcelas.', ok: null }
  }

  const { error } = await supabase
    .from('configuracoes')
    .update({
      whatsapp,
      instagram,
      texto_entrega: String(dados.get('texto_entrega') ?? '').trim().slice(0, 80),
      parcelas,
      aviso_texto: String(dados.get('aviso_texto') ?? '').trim().slice(0, 140),
      aviso_ativo: dados.get('aviso_ativo') === 'on',
    })
    .eq('id', true)

  if (error) return { erro: `Não consegui salvar: ${error.message}`, ok: null }

  atualizarConfiguracoes()
  return { erro: null, ok: 'Salvo.' }
}
