'use client'

import { useActionState, useTransition, type FormEvent } from 'react'

/*
 * Envio de formulário sem perder o que foi digitado.
 *
 * Com <form action={...}>, o React limpa os campos não controlados assim que a
 * ação termina, inclusive quando ela volta com erro de validação: a Edna
 * perderia a descrição inteira por causa de um preço errado. Enviando pelo
 * onSubmit dentro de uma transição, os campos ficam como estão e o erro
 * aparece ao lado deles.
 *
 * (Armadilha herdada da 065, onde ela custou uma sessão de depuração.)
 */

type Acao<E> = (estado: E, dados: FormData) => Promise<E>

export function useAcaoFormulario<E>(acao: Acao<E>, inicial: E) {
  /*
   * O useActionState trabalha com Awaited<E>. Nossos estados são objetos
   * simples (nunca uma Promise), então Awaited<E> é o próprio E — o cast só
   * conta isso ao TypeScript, que não tem como deduzir sozinho.
   */
  const [estado, executar] = useActionState(
    acao as unknown as (estado: Awaited<E>, dados: FormData) => Promise<Awaited<E>>,
    inicial as Awaited<E>,
  )
  const [pendente, startTransition] = useTransition()

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (pendente) return
    // O botão clicado precisa entrar no FormData (name/value dele)
    const enviador = (evento.nativeEvent as SubmitEvent).submitter as HTMLElement | null
    const dados = new FormData(evento.currentTarget, enviador as HTMLButtonElement | null)
    startTransition(() => executar(dados))
  }

  return { estado, aoEnviar, pendente }
}
