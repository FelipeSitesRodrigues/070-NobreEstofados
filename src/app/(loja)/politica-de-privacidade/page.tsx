import type { Metadata } from 'next'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'
import s from './politica.module.css'

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: 'O que o site da Nobre Estofados guarda sobre você (quase nada) e como a conversa pelo WhatsApp é usada.',
  alternates: { canonical: '/politica-de-privacidade' },
}

/*
 * Texto curto e direto, como o resto do site. Descreve o que o site faz de
 * verdade: sem cadastro, sem cookie de propaganda, carrinho só no navegador e
 * contagem de pedidos no WhatsApp sem saber quem pediu. Se entrar pixel de
 * anúncio ou analytics, este texto muda junto.
 */
export default async function Politica() {
  const config = await lerConfiguracoes()

  return (
    <article className={`conteiner ${s.politica}`}>
      <h1>Política de privacidade</h1>
      <p className={s.atualizada}>Atualizada em setembro de 2026.</p>

      <h2>O que este site guarda</h2>
      <p>
        Para comprar na Nobre Estofados você não precisa fazer cadastro. O site não pede nome, telefone, e-mail nem CPF.
      </p>
      <p>
        O carrinho fica salvo só no seu navegador, no seu aparelho, para você não perder o que escolheu. A Nobre não recebe
        essa informação. Se você limpar os dados do navegador, o carrinho some.
      </p>
      <p>
        Quando você toca num botão do WhatsApp, o site conta qual modelo foi pedido e em que dia, sem saber quem pediu. Isso
        serve só para saber quais sofás são os mais procurados.
      </p>

      <h2>A conversa pelo WhatsApp</h2>
      <p>
        A mensagem com o seu pedido é enviada por você, pelo seu próprio WhatsApp. O que você conversar com a Nobre, como
        nome, telefone e endereço de entrega, é usado só para atender o seu pedido, combinar o pagamento e fazer a entrega.
        A conversa em si segue as regras de privacidade do WhatsApp.
      </p>

      <h2>Cookies</h2>
      <p>O site não usa cookies de propaganda nem de rastreamento.</p>

      <h2>Seus direitos</h2>
      <p>
        Pela Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir para ver, corrigir ou apagar os dados que a
        Nobre tem sobre você. É só pedir pelo WhatsApp {config.whatsappExibicao}.
      </p>
    </article>
  )
}
