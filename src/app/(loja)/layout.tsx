import { AvisoCarrinho } from '@/components/carrinho/AvisoCarrinho'
import { Cabecalho } from '@/components/loja/Cabecalho'
import { Rodape } from '@/components/loja/Rodape'
import { WhatsFlutuante } from '@/components/loja/WhatsFlutuante'
import { RevelarAoRolar } from '@/components/RevelarAoRolar'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'
import { linkWhatsApp } from '@/lib/whatsapp'

/*
 * Roda antes da primeira pintura: marca o <html> com .js pra que o CSS
 * esconda o que vai ser revelado ao rolar. Se o JS da página não subir em
 * 4 s, tira a marca e mostra tudo: conteúdo nunca fica preso invisível.
 * Fica aqui e não no layout raiz porque o painel usa CSP com nonce.
 */
const scriptInicial = `(function(){var d=document.documentElement;if(!('IntersectionObserver' in window))return;d.classList.add('js');setTimeout(function(){if(!d.classList.contains('revelar-pronto'))d.classList.remove('js')},4000)})();`

export default async function LayoutLoja({ children }: LayoutProps<'/'>) {
  const config = await lerConfiguracoes()

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: scriptInicial }} />
      <a href="#conteudo" className="pular">
        Pular para o conteúdo
      </a>
      {config.aviso && <p className="aviso-loja">{config.aviso}</p>}
      <Cabecalho />
      <main id="conteudo">{children}</main>
      <Rodape />
      <WhatsFlutuante link={linkWhatsApp(config.whatsapp, { tipo: 'ajuda' })} />
      <AvisoCarrinho />
      <RevelarAoRolar />
    </>
  )
}
