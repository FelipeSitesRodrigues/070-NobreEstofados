'use server'

import { redirect } from 'next/navigation'
import { atualizarCatalogo } from '@/lib/painel/loja'
import { centavosDeTexto, LIMITE_CENTAVOS, textoDeCentavos } from '@/lib/painel/dinheiro'
import { exigirAdmin } from '@/lib/painel/sessao'

/*
 * Gravar sofá. Duas portas: a edição rápida de preço, da lista, e o formulário
 * inteiro.
 *
 * Quem grava é sempre a sessão da Edna, nunca a chave secreta: o banco confere
 * o perfil admin de novo (RLS e o eh_admin dentro de salvar_produto). Produto e
 * variações vão juntos, numa transação só, pela função salvar_produto — assim
 * não existe sofá salvo com preço pela metade.
 *
 * Depois de gravar, atualizarCatalogo limpa o catálogo em cache: a loja mostra o preço
 * novo na hora, não daqui a 5 minutos.
 */

export type EstadoForm = { erro: string | null; ok: string | null }

const texto = (dados: FormData, campo: string, maximo: number) =>
  String(dados.get(campo) ?? '')
    .trim()
    .slice(0, maximo)

/** Campo de medida em centímetros: vazio vira ausente, "2,50" e "250" viram 250. */
function medida(dados: FormData, campo: string): number | undefined {
  const bruto = String(dados.get(campo) ?? '').trim().replace(',', '.')
  if (!bruto) return undefined
  const numero = Number(bruto)
  if (!Number.isFinite(numero) || numero <= 0) return undefined
  // A Edna pode digitar em metro ("2,5"); abaixo de 10 é metro, não centímetro
  const cm = numero < 10 ? numero * 100 : numero
  return Math.round(cm)
}

/** Uma peça por linha, no formato "Sofá 3 lugares: 210". Só pros conjuntos. */
function pecas(dados: FormData) {
  const linhas = String(dados.get('pecas') ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 6)

  const lista = linhas
    .map((linha) => {
      const [nome, valor] = linha.split(':')
      const comprimento = Number((valor ?? '').trim().replace(',', '.'))
      if (!nome?.trim() || !Number.isFinite(comprimento) || comprimento <= 0) return null
      return { nome: nome.trim().slice(0, 40), comprimento: Math.round(comprimento < 10 ? comprimento * 100 : comprimento) }
    })
    .filter((p): p is { nome: string; comprimento: number } => p !== null)

  return lista.length ? lista : undefined
}

function montarMedidas(dados: FormData) {
  const medidas: Record<string, unknown> = {
    altura: medida(dados, 'altura'),
    comprimento: medida(dados, 'comprimento'),
    comprimentoLado: medida(dados, 'comprimentoLado'),
    profundidade: medida(dados, 'profundidade'),
    profundidadeAberto: medida(dados, 'profundidadeAberto'),
    profundidadeChaise: medida(dados, 'profundidadeChaise'),
    pecas: pecas(dados),
  }
  for (const [chave, valor] of Object.entries(medidas)) if (valor === undefined) delete medidas[chave]
  return medidas
}

type VariacaoForm = {
  id: string | null
  nome: string | null
  preco_centavos: number | null
  preco_cheio_centavos: null
  precos_tecido: { veludo: number; linho: number; premium: number } | null
  /** Só Linho ou Premium preenchido, sem os três: o formulário avisa. */
  incompleta: boolean
}

/*
 * As variações chegam como listas paralelas (variacaoId[], variacaoNome[]...),
 * que é como o HTML manda vários campos com o mesmo nome.
 *
 * Preço por tecido é tudo ou nada: com os três (Veludo, Linho, Premium) vira
 * tabela por tecido e a página mostra as bolinhas; só o Veludo é preço único;
 * dois de três é erro, senão o tecido que faltou apareceria com o preço do
 * veludo. Linha sem preço nenhum é válida: "Consulte o valor no WhatsApp".
 *
 * Promoção ("de R$ X por R$ Y") saiu do formulário junto com os preços por
 * tecido: um preço antigo só não diz de qual tecido é. A coluna continua no
 * banco e volta aqui se a Edna pedir.
 */
function montarVariacoes(dados: FormData): VariacaoForm[] {
  const ids = dados.getAll('variacaoId').map(String)
  const nomes = dados.getAll('variacaoNome').map(String)
  const veludos = dados.getAll('variacaoPreco').map(String)
  const linhos = dados.getAll('variacaoPrecoLinho').map(String)
  const premiums = dados.getAll('variacaoPrecoPremium').map(String)

  const variacoes = ids
    .map((id, i): VariacaoForm => {
      const nome = (nomes[i] ?? '').trim().slice(0, 80)
      const veludo = centavosDeTexto(veludos[i] ?? '')
      const linho = centavosDeTexto(linhos[i] ?? '')
      const premium = centavosDeTexto(premiums[i] ?? '')
      const completa = veludo !== null && linho !== null && premium !== null
      return {
        id: id || null,
        nome: nome || null,
        preco_centavos: veludo,
        preco_cheio_centavos: null,
        precos_tecido: completa ? { veludo, linho, premium } : null,
        incompleta: !completa && (linho !== null || premium !== null),
      }
    })
    .filter((v, i) => v.id || v.nome || v.preco_centavos !== null || v.incompleta || i === 0)

  return variacoes.length
    ? variacoes
    : [{ id: null, nome: null, preco_centavos: null, preco_cheio_centavos: null, precos_tecido: null, incompleta: false }]
}

export async function salvarProduto(_estado: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin()

  const id = texto(dados, 'id', 40) || null
  const nome = texto(dados, 'nome', 120)
  const categoriaId = texto(dados, 'categoria_id', 40)
  if (!nome) return { erro: 'O sofá precisa de um nome.', ok: null }
  if (!categoriaId) return { erro: 'Escolha a categoria do sofá.', ok: null }

  /*
   * Com mais de um tamanho, cada um precisa de nome: é o que o cliente escolhe
   * na página ("2,00 m", "2,50 m") e o que chega escrito na mensagem do
   * WhatsApp. Sem nome, a opção aparece em branco no site.
   */
  const variacoes = montarVariacoes(dados)
  if (variacoes.length > 1 && variacoes.some((v) => !v.nome)) {
    return { erro: 'Dê um nome a cada tamanho, por exemplo "2,00 m" e "2,50 m".', ok: null }
  }
  const incompleta = variacoes.find((v) => v.incompleta)
  if (incompleta) {
    return {
      erro: `${incompleta.nome ?? 'O tamanho'}: preencha Veludo, Linho e Premium, ou só o Veludo se o preço for único.`,
      ok: null,
    }
  }
  const acimaDoTeto = variacoes.some((v) =>
    [v.preco_centavos, ...Object.values(v.precos_tecido ?? {})].some((c) => (c ?? 0) > LIMITE_CENTAVOS),
  )
  if (acimaDoTeto) return { erro: 'Tem preço acima de R$ 1.000.000. Confira se não sobrou número.', ok: null }

  const disponibilidade = texto(dados, 'disponibilidade', 20) || 'disponivel'
  const prazo = texto(dados, 'prazo_dias', 4)

  const payload = {
    nome,
    categoria_id: categoriaId,
    subtitulo: texto(dados, 'subtitulo', 80),
    descricao: texto(dados, 'descricao', 2000),
    medidas: montarMedidas(dados),
    disponibilidade,
    // O banco só aceita prazo quando é sob encomenda
    prazo_dias: disponibilidade === 'sob-encomenda' ? prazo : '',
    fixado: texto(dados, 'fixado', 2),
    status: texto(dados, 'status', 20) || 'rascunho',
    ordem: texto(dados, 'ordem', 6),
    meta_titulo: texto(dados, 'meta_titulo', 70),
    meta_descricao: texto(dados, 'meta_descricao', 170),
    variacoes: variacoes.map((v) => ({
      id: v.id,
      nome: v.nome,
      preco_centavos: v.preco_centavos,
      preco_cheio_centavos: v.preco_cheio_centavos,
      precos_tecido: v.precos_tecido,
    })),
  }

  const { data, error } = await supabase.rpc('salvar_produto', { p_id: id, p_dados: payload })
  if (error) return { erro: `Não consegui salvar: ${traduzir(error.message)}`, ok: null }

  atualizarCatalogo()

  // Sofá novo: vai pra própria página, onde ela sobe as fotos
  if (!id) redirect(`/painel/sofa/${data}?novo=1`)
  return { erro: null, ok: 'Salvo.' }
}

/**
 * Estado da edição rápida: além do recado, o preço que está gravado agora. Erro
 * não grava nada, então devolve o gravado de antes: a tela sempre sabe com o
 * que comparar, e o botão "Salvar" aparece quando o campo difere do banco.
 */
export type EstadoPreco = EstadoForm & { gravado: string }

/** Edição rápida de preço, da lista: uma variação, um campo, sem sair da página. */
export async function salvarPrecoRapido(estado: EstadoPreco, dados: FormData): Promise<EstadoPreco> {
  const { supabase } = await exigirAdmin()
  const falhou = (erro: string): EstadoPreco => ({ erro, ok: null, gravado: estado.gravado })

  const variacaoId = texto(dados, 'variacaoId', 40)
  if (!variacaoId) return falhou('Variação não encontrada.')

  const bruto = String(dados.get('preco') ?? '').trim()
  const preco = bruto ? centavosDeTexto(bruto) : null
  if (bruto && preco === null) return falhou('Preço que não entendi. Digite assim: 3.490')
  if (preco !== null && preco > LIMITE_CENTAVOS) return falhou('Esse preço passa de R$ 1.000.000. Confira se não sobrou número.')

  // Só preço único: o de tabela por tecido tem três valores, e um campo só
  // desalinharia o Veludo dos outros dois. Esse vai pela página do sofá.
  const { data, error } = await supabase
    .from('variacoes')
    .update({ preco_centavos: preco, preco_cheio_centavos: null })
    .eq('id', variacaoId)
    .is('precos_tecido', null)
    .select('id')
  if (error) return falhou(`Não consegui salvar: ${traduzir(error.message)}`)
  if (!data?.length) return falhou('Esse sofá tem preço por tecido: mude na página dele.')

  atualizarCatalogo()
  return { erro: null, ok: preco === null ? 'Preço apagado.' : 'Preço salvo.', gravado: textoDeCentavos(preco) }
}

/** Publicar, tirar do ar ou voltar pra rascunho. */
export async function mudarStatus(_estado: EstadoForm, dados: FormData): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin()

  const id = texto(dados, 'id', 40)
  const status = texto(dados, 'status', 20)
  if (!id || !['rascunho', 'ativo', 'arquivado'].includes(status)) {
    return { erro: 'Não entendi o que fazer com esse sofá.', ok: null }
  }

  const { error } = await supabase.from('produtos').update({ status }).eq('id', id)
  if (error) return { erro: `Não consegui salvar: ${traduzir(error.message)}`, ok: null }

  atualizarCatalogo()
  return { erro: null, ok: status === 'ativo' ? 'No ar.' : 'Fora do ar.' }
}

/** Erro do banco em português de gente. */
function traduzir(mensagem: string) {
  if (mensagem.includes('sem_permissao')) return 'esse login não tem permissão.'
  if (mensagem.includes('produtos_fixado_unico')) return 'já tem outro sofá nessa posição dos mais procurados.'
  if (mensagem.includes('variacoes_promocao')) return 'o preço "de" precisa ser maior que o "por".'
  if (mensagem.includes('preco_centavos_check')) return 'tem preço acima de R$ 1.000.000. Confira se não sobrou número.'
  if (mensagem.includes('produtos_prazo_so_encomenda')) return 'o prazo só vale para sofá sob encomenda.'
  if (mensagem.includes('produtos_slug_check') || mensagem.includes('nome_check')) return 'o nome tem caractere que o site não aceita.'
  return mensagem
}
