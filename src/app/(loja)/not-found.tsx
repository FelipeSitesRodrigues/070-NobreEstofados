import Link from 'next/link'
import b from '@/components/ui/botao.module.css'
import s from './nao-encontrado.module.css'

/** Página que não existe (ou produto que saiu do catálogo), com cabeçalho e rodapé da loja. */
export default function NaoEncontrado() {
  return (
    <div className={`conteiner ${s.pagina}`}>
      <h1 className={s.titulo}>Não encontramos esta página.</h1>
      <p className={s.texto}>O endereço pode ter mudado, ou o modelo saiu do catálogo. Os sofás continuam todos aqui:</p>
      <div className={s.acoes}>
        <Link href="/loja" className={`${b.botao} ${b.principal}`}>
          Ver todos os modelos
        </Link>
        <Link href="/" className={`${b.botao} ${b.contorno}`}>
          Ir para o início
        </Link>
      </div>
    </div>
  )
}
