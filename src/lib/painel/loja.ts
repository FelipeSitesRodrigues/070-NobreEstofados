import 'server-only'
import { revalidatePath, updateTag } from 'next/cache'
import { TAG_CATALOGO } from '@/lib/catalogo/consultas'
import { TAG_CONFIGURACOES } from '@/lib/loja/configuracoes'

/*
 * Avisa a loja de que algo mudou. Só pode ser chamado dentro de Server Action.
 *
 * updateTag joga fora o catálogo em cache na hora (a Edna salva e já vê);
 * revalidatePath refaz as páginas prontas, que são a home, a loja e as de
 * produto. Sem o segundo, o preço novo só apareceria na próxima revalidação.
 */

export function atualizarCatalogo() {
  updateTag(TAG_CATALOGO)
  revalidatePath('/', 'layout')
}

export function atualizarConfiguracoes() {
  updateTag(TAG_CONFIGURACOES)
  revalidatePath('/', 'layout')
}
