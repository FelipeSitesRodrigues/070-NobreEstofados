import type { Metadata } from 'next'
import { Banner } from '@/components/home/Banner'
import { Categorias } from '@/components/home/Categorias'
import { ComoComprar } from '@/components/home/ComoComprar'
import { Diferenciais } from '@/components/home/Diferenciais'
import { Hero } from '@/components/home/Hero'
import { MaisProcurados } from '@/components/home/MaisProcurados'
import { Sobre } from '@/components/home/Sobre'
import { Videos } from '@/components/home/Videos'
import { listarCategorias, listarComVideo, listarMaisProcurados, totalProdutos } from '@/lib/catalogo/consultas'
import { lerConfiguracoes } from '@/lib/loja/configuracoes'
import { serializarJsonLd } from '@/lib/seo'
import { SITE, urlAbsoluta } from '@/lib/site'
import { linkWhatsApp } from '@/lib/whatsapp'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function Inicio() {
  const [config, categorias, procurados, comVideo, total] = await Promise.all([
    lerConfiguracoes(),
    listarCategorias(),
    listarMaisProcurados(6),
    listarComVideo(4),
    totalProdutos(),
  ])
  const ajuda = linkWhatsApp(config.whatsapp, { tipo: 'ajuda' })

  // Dados da loja pro Google (nome, logo, cidade, contato)
  const dadosLoja = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: SITE.nome,
    url: SITE.url,
    logo: urlAbsoluta('/imagens/logo-nobre.png'),
    image: urlAbsoluta('/opengraph-image.jpg'),
    address: { '@type': 'PostalAddress', addressLocality: SITE.cidade, addressRegion: SITE.estado, addressCountry: 'BR' },
    areaServed: { '@type': 'City', name: `${SITE.cidade}, ${SITE.estado}` },
    ...(config.whatsappDeExemplo ? {} : { telephone: `+${config.whatsapp}` }),
    ...(config.instagram ? { sameAs: [config.instagram] } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(dadosLoja) }} />
      <Hero linkWhatsApp={ajuda} />
      <Diferenciais temVideo={comVideo.length > 0} total={total} />
      <Categorias categorias={categorias} />
      <MaisProcurados produtos={procurados} total={total} whatsapp={config.whatsapp} parcelas={config.parcelas} />
      <Videos produtos={comVideo} />
      <ComoComprar linkWhatsApp={ajuda} />
      <Banner />
      <Sobre />
    </>
  )
}
