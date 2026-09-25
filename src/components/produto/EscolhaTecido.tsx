'use client'

import { useId } from 'react'
import { LINHAS, NOME_LINHA, amostra, bolinha, buscarTecido, tecidosDaLinha } from '@/lib/catalogo/tecidos'
import t from './EscolhaTecido.module.css'

/*
 * O mostruário na página do sofá: uma bolinha por cor, com a textura de
 * verdade (public/tecidos, recortadas das páginas do Mostruário 26/27).
 *
 * As cores vêm separadas por linha (Veludo, Linho, Premium), só com o nome: a
 * Edna pediu que o mostruário não mostre preço, é pra ver as cores que existem.
 * O preço do sofá, lá em cima, acompanha a cor escolhida.
 *
 * Rádio de verdade por baixo de cada bolinha: teclado, leitor de tela e o
 * "voltar" do celular funcionam como em qualquer formulário.
 */

type Props = {
  escolhido: string | null
  onEscolher: (codigo: string) => void
}

export function EscolhaTecido({ escolhido, onEscolher }: Props) {
  const id = useId()
  const tecido = buscarTecido(escolhido)

  return (
    <fieldset className={t.tecidos}>
      <legend>Escolha o tecido</legend>

      <div className={t.escolhido} aria-live="polite">
        {tecido ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- amostra fixa, já no tamanho */}
            <img src={amostra(tecido)} alt="" width={96} height={96} className={t.amostra} style={{ background: tecido.fundo }} />
            <div>
              <p className={t.nomeEscolhido}>{tecido.nome}</p>
              {/* O nome já diz a linha ("Linho 304"): repetir seria "linha Linho" */}
              <p className={t.detalheEscolhido}>A cor pode variar um pouco da tela.</p>
            </div>
          </>
        ) : (
          <p className={t.detalheEscolhido}>
            Toque numa bolinha para ver o tecido de perto. Sem escolher, o valor é o do veludo e a cor você combina na
            conversa.
          </p>
        )}
      </div>

      {LINHAS.map((linha) => {
        return (
          <div key={linha} role="group" aria-labelledby={`${id}-${linha}`} className={t.linha}>
            <p className={t.cabecalhoLinha}>
              <span id={`${id}-${linha}`} className={t.nomeLinha}>
                {NOME_LINHA[linha]}
              </span>
            </p>

            <div className={t.bolinhas}>
              {tecidosDaLinha(linha).map((cor) => (
                <label key={cor.codigo} className={t.bolinha} title={cor.nome} style={{ background: cor.fundo }}>
                  <input
                    type="radio"
                    name="tecido"
                    value={cor.codigo}
                    checked={escolhido === cor.codigo}
                    onChange={() => onEscolher(cor.codigo)}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element -- bolinha de 96 px, fixa */}
                  <img src={bolinha(cor)} alt="" width={48} height={48} loading="lazy" decoding="async" />
                  <span className="visualmente-oculto">{cor.nome}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </fieldset>
  )
}
