'use client'

import { useState } from 'react'
import { Check, Warning } from '@phosphor-icons/react'
import { salvarPrecoRapido, type EstadoPreco } from '@/lib/painel/acoes/produtos'
import { centavosDeTexto, textoDeCentavos } from '@/lib/painel/dinheiro'
import s from '@/app/painel/painel.module.css'
import { useAcaoFormulario } from './useAcaoFormulario'

/*
 * Preço editável na lista.
 *
 * O botão "Salvar" só aparece quando o campo difere do que está gravado: sem
 * isso a tela fica com botões pedindo pra serem clicados. O "Salvo" fica no
 * lugar do botão e some sozinho quando ela mexe no campo de novo.
 *
 * Campo vazio é uma decisão, não um esquecimento: apaga o preço e o site volta
 * a dizer "Consulte o valor no WhatsApp".
 */

export function PrecoRapido({
  variacaoId,
  precoCentavos,
  nome,
}: {
  variacaoId: string
  precoCentavos: number | null
  nome: string
}) {
  const daPagina = textoDeCentavos(precoCentavos)
  const [valor, setValor] = useState(daPagina)
  /*
   * estado.gravado é o preço que está no banco agora: começa com o da página e
   * a ação devolve o novo a cada "Salvar" (ou o mesmo, quando dá erro). Sem
   * isto, quem salva 3.490 e depois quer apagar não veria o botão: o campo
   * vazio "bateria" com o valor velho da página, que era vazio.
   */
  const { estado, aoEnviar, pendente } = useAcaoFormulario<EstadoPreco>(salvarPrecoRapido, {
    erro: null,
    ok: null,
    gravado: daPagina,
  })

  // Em centavos: "3.490" e "3.490,00" são o mesmo preço. Texto que não é
  // número conta como mudança, pro botão aparecer e o servidor explicar.
  const centavos = (texto: string) => (texto.trim() ? (centavosDeTexto(texto) ?? NaN) : null)
  const mudou = centavos(valor) !== centavos(estado.gravado)
  const mostrarSalvo = Boolean(estado.ok) && !mudou && !pendente
  const mostrarBotao = mudou || pendente

  return (
    <form onSubmit={aoEnviar} className={s.precoLinha}>
      <input type="hidden" name="variacaoId" value={variacaoId} />

      <label className={s.dinheiro}>
        <span>R$</span>
        <input
          name="preco"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          inputMode="decimal"
          placeholder="a consultar"
          aria-label={`Preço do ${nome}`}
        />
      </label>

      {mostrarBotao && (
        <button type="submit" className={s.salvarPreco} disabled={pendente}>
          {pendente ? 'Salvando' : 'Salvar'}
        </button>
      )}

      {mostrarSalvo && (
        <span className={s.etiqueta} role="status">
          <Check aria-hidden weight="bold" />
          {estado.ok}
        </span>
      )}

      {estado.erro && !pendente && (
        <span className={s.etiqueta} role="alert">
          <Warning aria-hidden weight="fill" />
          {estado.erro}
        </span>
      )}
    </form>
  )
}
