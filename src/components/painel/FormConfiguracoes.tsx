'use client'

import { Check, Warning } from '@phosphor-icons/react'
import { salvarConfiguracoes } from '@/lib/painel/acoes/configuracoes'
import type { EstadoForm } from '@/lib/painel/acoes/produtos'
import type { ConfiguracoesPainel } from '@/lib/painel/consultas'
import { telefoneExibicao } from '@/lib/site'
import s from '@/app/painel/painel.module.css'
import { useAcaoFormulario } from './useAcaoFormulario'

/*
 * Ajustes da loja. O WhatsApp é o campo mais importante do painel: é pra ele
 * que vai todo cliente que clica em qualquer botão do site.
 */

const EXEMPLO = '5511900000000'

export function FormConfiguracoes({ config }: { config: ConfiguracoesPainel }) {
  const { estado, aoEnviar, pendente } = useAcaoFormulario<EstadoForm>(salvarConfiguracoes, { erro: null, ok: null })

  return (
    <form onSubmit={aoEnviar} noValidate>
      <section className={s.cartao}>
        <h2 className={s.tituloCartao}>Contato</h2>

        <div className={s.campos}>
          <div className={s.campo}>
            <label htmlFor="whatsapp">WhatsApp da loja</label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              defaultValue={config.whatsapp ? telefoneExibicao(config.whatsapp) : ''}
              placeholder="(11) 90000-0000"
            />
            {config.whatsapp === EXEMPLO ? (
              <p className={s.erro}>
                <Warning aria-hidden weight="fill" />
                Esse ainda é um número de exemplo. Troque pelo seu antes de divulgar o site.
              </p>
            ) : (
              <p className={s.ajuda}>Com DDD. É esse número que recebe todas as mensagens do site.</p>
            )}
          </div>

          <div className={s.campo}>
            <label htmlFor="instagram">Instagram</label>
            <input id="instagram" name="instagram" defaultValue={config.instagram} placeholder="@nobreestofados" />
          </div>
        </div>
      </section>

      <section className={s.cartao}>
        <h2 className={s.tituloCartao}>Como a loja vende</h2>

        <div className={s.campos}>
          <div className={s.campo}>
            <label htmlFor="parcelas">Parcelas sem juros no cartão</label>
            <input
              id="parcelas"
              name="parcelas"
              type="number"
              min={2}
              max={24}
              defaultValue={config.parcelas ?? ''}
              placeholder="12"
            />
            <p className={s.ajuda}>
              Aparece embaixo do preço: &ldquo;em até 12x de R$ 290&rdquo;. Deixe vazio para não falar de parcela.
            </p>
          </div>

          <div className={s.campo}>
            <label htmlFor="texto_entrega">Área de entrega</label>
            <input
              id="texto_entrega"
              name="texto_entrega"
              defaultValue={config.textoEntrega}
              maxLength={80}
              placeholder="Entregamos em Irecê e região"
            />
            <p className={s.ajuda}>
              Guardado, mas ainda sem lugar no site: a faixa onde ele aparecia foi tirada. Fale comigo que eu ponho num
              lugar bom.
            </p>
          </div>
        </div>
      </section>

      <section className={s.cartao}>
        <h2 className={s.tituloCartao}>Recado no topo do site</h2>
        <p className={s.ajudaCartao}>Para avisar de feriado, mudança de horário ou promoção do mês.</p>

        <div className={s.campos}>
          <div className={s.campo}>
            <label htmlFor="aviso_texto">Recado</label>
            <input
              id="aviso_texto"
              name="aviso_texto"
              defaultValue={config.avisoTexto}
              maxLength={140}
              placeholder="Loja fechada dia 7. Pedidos pelo WhatsApp normalmente."
            />
          </div>

          <label className={s.caixa}>
            <input type="checkbox" name="aviso_ativo" defaultChecked={config.avisoAtivo} />
            Mostrar esse recado no site agora
          </label>
        </div>
      </section>

      {estado.erro && (
        <p className={s.erro} role="alert">
          <Warning aria-hidden weight="fill" />
          {estado.erro}
        </p>
      )}
      {estado.ok && (
        <p className={s.ok} role="status">
          <Check aria-hidden weight="bold" />
          {estado.ok} O site já está com os ajustes.
        </p>
      )}

      <div className={s.acoes}>
        <button type="submit" className={s.botao} disabled={pendente} aria-busy={pendente}>
          {pendente ? 'Salvando...' : 'Salvar ajustes'}
        </button>
      </div>
    </form>
  )
}
