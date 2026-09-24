import Link from 'next/link'
import { InstagramLogo, WhatsappLogo } from '@phosphor-icons/react/dist/ssr'
import b from '@/components/ui/botao.module.css'
import { listarCategorias } from '@/lib/catalogo/consultas'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'
import { SITE, SITE_INDEXAVEL } from '@/lib/site'
import { linkWhatsApp } from '@/lib/whatsapp'
import s from './Rodape.module.css'

export async function Rodape() {
  const [config, categorias] = await Promise.all([lerConfiguracoes(), listarCategorias()])
  const ajuda = linkWhatsApp(config.whatsapp, { tipo: 'ajuda' })

  return (
    <footer id="contato" className={s.rodape}>
      <div className={`conteiner ${s.colunas}`}>
        <div className={s.marca}>
          {/* eslint-disable-next-line @next/next/no-img-element -- logo pequeno, já no tamanho certo */}
          <img src="/imagens/logo-nobre.png" alt="Nobre Estofados" width={480} height={119} loading="lazy" />
          <p>{SITE.frase}</p>
        </div>

        <nav aria-labelledby="rodape-loja" className={s.lista}>
          <h2 id="rodape-loja">Loja</h2>
          <ul>
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link href={`/loja/${c.slug}`}>{c.nome}</Link>
              </li>
            ))}
            <li>
              <Link href="/loja">Todos os modelos</Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="rodape-ajuda" className={s.lista}>
          <h2 id="rodape-ajuda">Ajuda</h2>
          <ul>
            <li>
              <Link href="/#como-comprar">Como comprar</Link>
            </li>
            <li>
              <Link href="/carrinho">Meu carrinho</Link>
            </li>
            <li>
              <Link href="/politica-de-privacidade">Política de privacidade</Link>
            </li>
          </ul>
        </nav>

        <div className={s.contato}>
          <h2>Fale com a gente</h2>
          <a href={ajuda} target="_blank" rel="noopener" className={s.numero}>
            <WhatsappLogo aria-hidden />
            {config.whatsappExibicao}
          </a>
          {config.whatsappDeExemplo && <p className={s.exemplo}>Número de exemplo: a Edna troca pelo dela no painel.</p>}
          <a href={ajuda} target="_blank" rel="noopener" className={`${b.botao} ${b.contorno}`}>
            <WhatsappLogo aria-hidden weight="fill" />
            Chamar no WhatsApp
          </a>
          {config.instagram ? (
            <a href={config.instagram} target="_blank" rel="noopener" className={s.instagram}>
              <InstagramLogo aria-hidden />
              {config.instagramUsuario ?? 'Nos siga no Instagram'}
            </a>
          ) : (
            // Fora do domínio de verdade, o que falta cadastrar aparece marcado; no ar, a linha some
            !SITE_INDEXAVEL && (
              <p className={`${s.instagram} ${s.exemplo}`}>
                <InstagramLogo aria-hidden />
                Instagram: a Edna cadastra no painel
              </p>
            )
          )}
        </div>
      </div>

      <div className={s.base}>
        <div className={`conteiner ${s.baseLinha}`}>
          <p>© {new Date().getFullYear()} Nobre Estofados</p>
          <p>
            Site por{' '}
            <a href="https://www.instagram.com/credialta.sites/" target="_blank" rel="noopener">
              Credialta Sites
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
