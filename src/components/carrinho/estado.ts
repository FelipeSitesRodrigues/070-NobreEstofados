'use client'

import { useSyncExternalStore } from 'react'
import { ID_VALIDO, MAX_ITENS, MAX_QUANTIDADE, chaveItem, type ItemCarrinho } from '@/lib/carrinho/tipos'
import { buscarTecido, ehLinha } from '@/lib/catalogo/tecidos'

/*
 * Estado do carrinho no navegador, o mesmo desenho da 065: um store pequeno
 * fora do React (useSyncExternalStore), guardado no localStorage e
 * sincronizado entre abas. O servidor renderiza sempre o carrinho vazio e o
 * navegador troca pelo guardado depois de hidratar.
 *
 * O localStorage pode ser editado por quem usa o navegador: tudo que sai dele
 * é validado e limitado antes de entrar no estado.
 */

const CHAVE = 'nobre:carrinho:v1'

type Estado = {
  itens: ItemCarrinho[]
  /** Já leu o que estava guardado. No servidor e na hidratação é sempre false. */
  carregado: boolean
  /** Último produto que entrou, pro aviso "foi para o carrinho". */
  ultimo: { nome: string; vez: number } | null
}

const VAZIO: Estado = { itens: [], carregado: false, ultimo: null }

let estado: Estado = VAZIO
let iniciado = false
const ouvintes = new Set<() => void>()
const emitir = () => ouvintes.forEach((ouvinte) => ouvinte())

/** Foto do próprio site ou do Storage do Supabase, e mais nada. */
const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL
const imagemPermitida = (src: string) =>
  /^\/(?!\/)[\w.~%/-]+$/.test(src) || (!!SUPABASE && src.startsWith(`${SUPABASE}/storage/v1/object/public/`))

const inteiroEntre = (valor: unknown, min: number, max: number): valor is number =>
  typeof valor === 'number' && Number.isInteger(valor) && valor >= min && valor <= max

const textoCurto = (valor: unknown, max: number): valor is string => typeof valor === 'string' && valor.length <= max

function itemValido(bruto: unknown): ItemCarrinho | null {
  if (typeof bruto !== 'object' || bruto === null) return null
  const b = bruto as Record<string, unknown>
  if (typeof b.produtoId !== 'string' || !ID_VALIDO.test(b.produtoId)) return null
  if (typeof b.variacaoId !== 'string' || !ID_VALIDO.test(b.variacaoId)) return null
  if (typeof b.slug !== 'string' || !ID_VALIDO.test(b.slug)) return null
  if (!textoCurto(b.nome, 120) || !b.nome.trim()) return null
  if (b.opcao !== null && !textoCurto(b.opcao, 80)) return null
  if (b.tamanho !== null && !textoCurto(b.tamanho, 80)) return null
  // Item guardado antes dos tecidos não tem esses campos: vale como sem tecido
  const tecido = b.tecido === undefined || b.tecido === null ? null : buscarTecido(String(b.tecido))?.codigo
  if (tecido === undefined) return null
  const linha = b.linha === undefined || b.linha === null ? null : ehLinha(b.linha) ? b.linha : undefined
  if (linha === undefined) return null
  if (b.precoCentavos !== null && !inteiroEntre(b.precoCentavos, 0, 100_000_000)) return null
  if (!inteiroEntre(b.quantidade, 1, 1000)) return null

  let imagem: ItemCarrinho['imagem'] = null
  if (b.imagem !== null) {
    if (typeof b.imagem !== 'object') return null
    const { src, largura, altura } = b.imagem as Record<string, unknown>
    if (typeof src !== 'string' || src.length > 300 || !imagemPermitida(src)) return null
    if (!inteiroEntre(largura, 1, 10_000) || !inteiroEntre(altura, 1, 10_000)) return null
    imagem = { src, largura, altura }
  }

  return {
    produtoId: b.produtoId,
    variacaoId: b.variacaoId,
    slug: b.slug,
    nome: b.nome,
    opcao: b.opcao as string | null,
    tamanho: b.tamanho as string | null,
    tecido,
    linha,
    precoCentavos: b.precoCentavos as number | null,
    imagem,
    quantidade: Math.min(b.quantidade, MAX_QUANTIDADE),
  }
}

/** Valida item por item, tira repetidos e limita o tamanho. */
export function validarItens(bruto: unknown): ItemCarrinho[] {
  if (!Array.isArray(bruto)) return []
  const vistos = new Set<string>()
  const itens: ItemCarrinho[] = []
  for (const item of bruto.slice(0, MAX_ITENS)) {
    const valido = itemValido(item)
    if (valido && !vistos.has(chaveItem(valido))) {
      vistos.add(chaveItem(valido))
      itens.push(valido)
    }
  }
  return itens
}

function lerGuardado(): ItemCarrinho[] {
  try {
    return validarItens(JSON.parse(window.localStorage.getItem(CHAVE) ?? '[]'))
  } catch {
    return []
  }
}

function guardar(itens: ItemCarrinho[]) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(itens))
  } catch {
    // Aba anônima ou storage cheio: o carrinho segue funcionando nesta visita
  }
}

function iniciar() {
  if (iniciado || typeof window === 'undefined') return
  iniciado = true
  estado = { ...estado, itens: lerGuardado(), carregado: true }
  window.addEventListener('storage', (evento) => {
    // key null: outra aba limpou o storage inteiro
    if (evento.key !== CHAVE && evento.key !== null) return
    estado = { ...estado, itens: lerGuardado() }
    emitir()
  })
}

function mudarItens(itens: ItemCarrinho[], ultimo = estado.ultimo) {
  estado = { ...estado, itens, ultimo }
  guardar(itens)
  emitir()
}

function assinar(ouvinte: () => void) {
  iniciar()
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

/** Estado do carrinho pra componente cliente. No servidor, sempre vazio. */
export function useCarrinho() {
  return useSyncExternalStore(assinar, () => estado, () => VAZIO)
}

export const carrinho = {
  adicionar(novo: ItemCarrinho) {
    iniciar()
    const chave = chaveItem(novo)
    const atual = estado.itens.find((i) => chaveItem(i) === chave)
    const item = itemValido({ ...novo, quantidade: Math.min((atual?.quantidade ?? 0) + novo.quantidade, MAX_QUANTIDADE) })
    if (!item) return
    const itens = atual ? estado.itens.map((i) => (chaveItem(i) === chave ? item : i)) : [...estado.itens, item].slice(-MAX_ITENS)
    mudarItens(itens, { nome: item.nome, vez: (estado.ultimo?.vez ?? 0) + 1 })
  },

  alterarQuantidade(chave: string, quantidade: number) {
    iniciar()
    if (!Number.isFinite(quantidade)) return
    if (quantidade < 1) return carrinho.remover(chave)
    mudarItens(estado.itens.map((i) => (chaveItem(i) === chave ? { ...i, quantidade: Math.min(Math.floor(quantidade), MAX_QUANTIDADE) } : i)))
  },

  remover(chave: string) {
    iniciar()
    mudarItens(estado.itens.filter((i) => chaveItem(i) !== chave))
  },

  /** Itens de agora, fora do ciclo de render (conferência). */
  itensAtuais(): ItemCarrinho[] {
    iniciar()
    return estado.itens
  },

  /** Troca pelos itens conferidos no servidor (preço e nome atuais). */
  substituir(itens: ItemCarrinho[]) {
    iniciar()
    const validos = validarItens(itens)
    // Nada mudou: não regrava o storage nem acorda as outras abas
    if (JSON.stringify(validos) === JSON.stringify(estado.itens)) return
    mudarItens(validos)
  },

  esquecerUltimo() {
    if (!estado.ultimo) return
    estado = { ...estado, ultimo: null }
    emitir()
  },
}
