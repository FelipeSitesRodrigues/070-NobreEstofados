# Nobre Estofados · loja virtual

Loja de sofás da Edna com compra pelo WhatsApp. Next 16, CSS modules, Supabase (banco, fotos e
vídeos). Memória do cliente em `../070 - Nobre Estofados/memoria.md`.

## Rodar

```
npm install
npm run fotos        # gera as fotos do catálogo e as imagens do site a partir de Recursos Site
npm run dev          # http://localhost:3070
```

`.env.local` (não vai pro git): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY` e `NEXT_PUBLIC_SITE_URL`. O token de acesso do Supabase, pra aplicar
migração, fica em `.env.supabase.local`.

## Banco

```
node --env-file=.env.local --env-file=.env.supabase.local scripts/aplicar-migracao.mjs supabase/migrations/<arquivo>.sql
node --env-file=.env.local scripts/semear.mjs     # sobe o catálogo 26/27 (pode repetir)
node --env-file=.env.local scripts/backup.mjs backup
```

## Conferir antes de mostrar

```
node scripts/print.mjs / --largura 1440 --inteira --saida revisao/home.png
node scripts/print.mjs / --largura 390 --inteira --saida revisao/home-celular.png
node scripts/testar.mjs     # rola cada página com animação ligada e confere revelação, fotos,
                            # estouro horizontal, links do WhatsApp e erros no console
```

## Onde está cada coisa

- `src/lib/whatsapp.ts`: a única função que monta as mensagens do WhatsApp
- `src/lib/catalogo/consultas.ts`: toda leitura do catálogo passa por aqui
- `src/lib/carrinho/`: carrinho no navegador e a conferência de preço no servidor
- `src/app/globals.css`: cores, tipografia e espaços (nenhum componente usa cor solta)
- `semente/catalogo.json`: os 25 modelos do catálogo, com medidas em centímetros
