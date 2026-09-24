---
name: Nobre Estofados
description: Showroom de estofados em madeira e creme, onde a foto do sofá é o produto e o WhatsApp é o caixa.
colors:
  cor-madeira: "#7a5e44"
  cor-madeira-hover: "#654c36"
  cor-acento: "#b89a72"
  cor-fundo: "#f3efe7"
  cor-superficie: "#faf8f4"
  cor-bege: "#e8e1d6"
  cor-bege-quente: "#cfc1b0"
  cor-borda: "#d7d0c5"
  cor-marrom: "#3a2920"
  cor-nogueira: "#4a3428"
  cor-taupe: "#81766a"
  cor-texto: "#1c1b19"
  cor-texto-suave: "#6e6961"
  cor-no-escuro: "#f3efe7"
  cor-no-escuro-suave: "#cfc1b0"
  cor-linha-escura: "rgba(207, 193, 176, 0.22)"
  cor-sucesso: "#3f7a4f"
  cor-alerta: "#9a3b2e"
typography:
  titulo-hero:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 1.55rem + 2.25vw, 3.3rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  titulo-pagina:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.6rem + 1.4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.012em"
  titulo-secao:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.42rem + 1.35vw, 2.625rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.012em"
  titulo-card:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.18rem + 0.3vw, 1.4375rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.005em"
  preco:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.4rem + 0.45vw, 1.8125rem)"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: '"tnum"'
  texto-grande:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.12rem + 0.35vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.55
  texto-corpo:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.08rem + 0.22vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  texto-menor:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  rotulo:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.005em"
  rotulo-icone:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.1
  frase-destaque:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.75rem, 1.2rem + 1.4vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.2
rounded:
  raio: "12px"
  raio-controle: "8px"
spacing:
  largura: "1320px"
  margem: "clamp(20px, 4.2vw, 60px)"
  espaco-secao: "clamp(56px, 3.6vw + 28px, 84px)"
  altura-topo: "40px"
  altura-header: "84px"
components:
  button-principal:
    backgroundColor: "{colors.cor-madeira}"
    textColor: "#ffffff"
    typography: "{typography.rotulo}"
    rounded: "{rounded.raio-controle}"
    padding: "0 26px"
    height: "56px"
  button-principal-hover:
    backgroundColor: "{colors.cor-madeira-hover}"
  button-comprar:
    backgroundColor: "{colors.cor-madeira}"
    textColor: "#ffffff"
    rounded: "{rounded.raio-controle}"
    padding: "0 26px"
    height: "64px"
  button-contorno:
    backgroundColor: "{colors.cor-superficie}"
    textColor: "{colors.cor-texto}"
    typography: "{typography.rotulo}"
    rounded: "{rounded.raio-controle}"
    padding: "0 26px"
    height: "56px"
  button-contorno-hover:
    backgroundColor: "#ffffff"
  button-acento:
    backgroundColor: "{colors.cor-acento}"
    textColor: "{colors.cor-texto}"
    typography: "{typography.rotulo}"
    rounded: "{rounded.raio-controle}"
    padding: "0 26px"
    height: "56px"
  button-acento-hover:
    backgroundColor: "{colors.cor-bege-quente}"
  whats-flutuante:
    backgroundColor: "{colors.cor-madeira}"
    textColor: "#ffffff"
    typography: "{typography.rotulo}"
    rounded: "28px"
    padding: "0 22px 0 18px"
    height: "56px"
  whats-flutuante-hover:
    backgroundColor: "{colors.cor-madeira-hover}"
  card-produto:
    backgroundColor: "{colors.cor-superficie}"
    textColor: "{colors.cor-texto}"
    rounded: "{rounded.raio}"
    padding: "18px 20px 20px"
  card-escuro:
    backgroundColor: "rgba(250, 248, 244, 0.05)"
    textColor: "{colors.cor-no-escuro}"
    rounded: "{rounded.raio}"
    padding: "16px 12px 18px"
  medida-item:
    backgroundColor: "{colors.cor-superficie}"
    textColor: "{colors.cor-texto}"
    rounded: "{rounded.raio}"
    padding: "18px 18px 16px"
  input-busca:
    backgroundColor: "{colors.cor-superficie}"
    textColor: "{colors.cor-texto}"
    rounded: "{rounded.raio-controle}"
    padding: "0 18px"
    height: "56px"
  chip-tipo:
    backgroundColor: "{colors.cor-superficie}"
    textColor: "{colors.cor-texto}"
    rounded: "{rounded.raio-controle}"
    padding: "0 15px"
    height: "48px"
  chip-tipo-ativo:
    backgroundColor: "{colors.cor-madeira}"
    textColor: "#ffffff"
  opcao-compra:
    backgroundColor: "{colors.cor-superficie}"
    textColor: "{colors.cor-texto}"
    rounded: "{rounded.raio-controle}"
    padding: "10px 16px"
    height: "60px"
  opcao-compra-marcada:
    backgroundColor: "#ffffff"
  cabecalho:
    backgroundColor: "{colors.cor-superficie}"
    textColor: "{colors.cor-texto}"
    height: "{spacing.altura-header}"
  faixa-topo:
    backgroundColor: "{colors.cor-bege}"
    textColor: "{colors.cor-texto}"
    typography: "{typography.texto-menor}"
    height: "{spacing.altura-topo}"
  contador-carrinho:
    backgroundColor: "{colors.cor-madeira}"
    textColor: "#ffffff"
    typography: "{typography.rotulo-icone}"
    rounded: "11px"
    height: "22px"
---

# Design System: Nobre Estofados

## Overview

**Creative North Star: "O Showroom de Madeira e Creme"**

A loja da Nobre é um showroom, não um marketplace. A foto real do catálogo é o produto e ocupa o lugar principal de cada tela: de ponta a ponta no hero, grande no card e na galeria. O resto (o creme, a madeira, o texto) existe pra deixar o sofá à vista e levar a pessoa até o WhatsApp, que faz o papel do caixa. O caminho é sempre o mesmo: ver o sofá, conferir as medidas, tocar em "Comprar pelo WhatsApp" e mandar a mensagem, que já sai escrita. Não há pagamento no site, então não há tela de checkout: o fim de todo caminho é um botão cor de madeira com a palavra WhatsApp.

A superfície alterna creme e off-white com seções inteiras de madeira escura, como piso claro e painel de madeira numa sala. Uma cor de ação só, a madeira média, que vira champanhe quando entra no escuro. Montserrat em tudo, de 400 a 700, e uma única frase em serifada itálica, no banner, como no mockup aprovado. A densidade é baixa e os alvos são grandes, porque o público tem muita gente de idade, sem costume de comprar pela internet, que chega pelo celular: texto corrido de 18 a 20px, nada abaixo de 16px, contraste alto e botão de 56px sempre com a ação escrita.

Rejeições confirmadas: o molde de marketplace carregado de filtros (a loja filtra só por tipo de sofá), a identidade inicial em preto e prata (trocada pelo marrom e creme a pedido da Edna) e qualquer texto desbotado, seja cinza claro, seja opacidade reduzida.

**Key Characteristics:**
- Foto real do catálogo como protagonista: de ponta a ponta no hero, grande no card, na galeria e no banner.
- Seções claras (creme e off-white) alternando com seções de madeira escura.
- Uma cor de ação: madeira no claro, champanhe no escuro.
- Montserrat de 400 a 700 em tudo; uma frase serifada itálica, só no banner.
- Medidas pensadas pro leitor idoso: corpo de 18 a 20px, piso de 16px, botão de 56px.
- WhatsApp à vista em toda tela, sempre com texto ao lado.
- Sombra tingida de marrom; raio de 12px na superfície e de 8px no controle.

## Colors

Neutros quentes de sala (creme, off-white, bege) com a madeira em dois papéis: escura como seção inteira e média como a única cor de ação.

### Primária
- **Madeira de Ação** (#7a5e44, `cor-madeira`): fundo do botão principal, do chip ativo, do botão da busca, do contador do carrinho e do WhatsApp flutuante; cor do anel de foco, do fio do menu, da borda da opção marcada, dos links com seta e do "Consulte o valor no WhatsApp". Dá 5,98:1 com texto branco e 5,6:1 como texto sobre o off-white. O texto em cima dela é branco puro (#fff, escrito direto nos módulos, sem variável).
- **Madeira de Ação, hover** (#654c36, `cor-madeira-hover`): só o hover da madeira (botão, busca, flutuante). 7,95:1 com branco.

### Secundária
- **Champanhe** (#b89a72, `cor-acento`): a madeira quando entra numa seção marrom. Link com seta, anel de foco e o botão da seção escura (hoje, o do banner), com texto grafite (6,5:1). Sobre o marrom dá 5,2:1.

### Neutras
- **Creme de Parede** (#f3efe7, `cor-fundo`): fundo da página e das seções claras de conteúdo (mais procurados, sobre), o véu do hero no desktop e o fundo dos campos do cabeçalho e do menu.
- **Off-white de Estofado** (#faf8f4, `cor-superficie`): card, cabeçalho, faixa de diferenciais, seção "Como comprar", rodapé, menu do celular e fundo do botão contorno. É também a cor de tema do navegador.
- **Bege de Linho** (#e8e1d6, `cor-bege`): faixa do topo, fundo de foto enquanto carrega, disco dos números dos passos e aviso do carrinho.
- **Bege Quente** (#cfc1b0, `cor-bege-quente`): seleção de texto, hover do botão champanhe e borda do aviso do carrinho.
- **Linha de Costura** (#d7d0c5, `cor-borda`): borda de 1px de card e campo, divisória entre os itens de uma faixa e fio das seções off-white.
- **Madeira Escura** (#3a2920, `cor-marrom`): fundo das seções `escuro` (categorias, vídeos, banner), com um brilho de champanhe a 10% no canto superior direito; também a faixa de aviso da loja, o diálogo de vídeo e o fundo do hero no celular.
- **Nogueira** (#4a3428, `cor-nogueira`): ícones ilustrativos no claro, número dos passos e fundo da foto dos cards no escuro.
- **Taupe** (#81766a, `cor-taupe`): borda de hover do contorno e dos chips, barra de rolagem e ponto de disponibilidade neutro. Não é cor de texto.
- **Grafite Quente** (#1c1b19, `cor-texto`): todo texto principal no claro (15:1 no creme) e fundo do selo "Indisponível no momento" do card.
- **Marrom Acinzentado** (#6e6961, `cor-texto-suave`): texto de apoio (descrição, tipo e largura do card, parcelas, notas, links do rodapé). 4,75:1 no creme e 5,1:1 no off-white.
- **Creme no Escuro** (#f3efe7, `cor-no-escuro`): título e texto sobre o marrom (12:1).
- **Bege no Escuro** (#cfc1b0, `cor-no-escuro-suave`): texto de apoio sobre o marrom (7,8:1).
- **Linha no Escuro** (rgba(207, 193, 176, 0.22), `cor-linha-escura`): borda dos cards nas seções marrons.

### Estado
- **Verde de Estoque** (#3f7a4f, `cor-sucesso`): o ponto de 10px de "Pronta entrega" no painel de compra.
- **Tijolo** (#9a3b2e, `cor-alerta`): o ponto de "Indisponível", o marcador de dado de exemplo no topo e no rodapé ("número de exemplo", que a Edna troca pelo dela no painel) e o hover do "Remover" no carrinho. 5,3:1 no bege.

### Regras
**A Regra da Madeira Escurecida.** A cor de ação é #7a5e44: o #937659 do mockup escurecido até 5,98:1 com texto branco, porque o original dá 4,2:1. Texto branco nunca vai sobre o tom do mockup, e botão novo não inventa outra madeira.

**A Regra da Madeira no Escuro.** Sobre o marrom, a madeira some (2,3:1). Dentro de uma seção `escuro`, link, anel de foco e botão viram champanhe, e o botão champanhe leva texto grafite.

**A Regra do Texto Firme.** Todo texto passa de 4,5:1 contra o fundo onde está. No claro, o mais claro permitido é `cor-texto-suave`, e só sobre creme ou off-white (no bege cai pra 4,2:1). No escuro, só `cor-no-escuro` e `cor-no-escuro-suave`. Texto nunca ganha opacidade reduzida, e cinza frio escuro (do tipo #5E646E, 2,3:1 no marrom) nunca vira texto sobre madeira.

**A Regra do Estado no Ponto.** Verde e tijolo só marcam estado: o ponto de disponibilidade, o marcador de dado de exemplo e o hover de remover. Nunca viram fundo de seção, botão ou selo; até o selo de indisponível do card é grafite, não vermelho.

## Typography

**Fonte de títulos e de texto:** Montserrat (com system-ui, sans-serif), carregada pelo next/font como variável e usada via `--fonte`. Uma família só, do título do hero ao rótulo de 14px.
**Fonte de destaque:** Cormorant Garamond itálica 500 (com Georgia, serif), via `--fonte-destaque`, num peso só e sem preload.

**Caráter:** uma sans geométrica e calorosa, que se lê sem esforço em tamanho grande, com a serifada entrando uma vez só, como assinatura da loja. Preço, medida e quantidade usam números tabulares; título equilibra as linhas (`text-wrap: balance`) e parágrafo evita palavra sozinha na última linha (`text-wrap: pretty`).

### Hierarquia
- **Display, `titulo-hero`** (400, de 38 a 53px, linha 1,08, -0,02em): só o h1 do hero, em três linhas a partir de 1024px e com quebra livre no celular.
- **Título de página, `titulo-pagina`** (500, de 32 a 48px, linha 1,1): h1 da loja, do carrinho, da política e da página de erro. Hoje é um valor repetido em cada módulo, sem variável no `globals.css`. O nome do sofá na página do produto usa uma escala quase igual (de 32 a 46px).
- **Título de seção, `titulo-secao`** (500, de 28 a 42px, linha 1,15): o h2 de cada seção, à esquerda, com o link "Ver todos" à direita quando há. Blocos internos (Medidas, Descrição) usam de 24 a 30px no mesmo peso.
- **Nome do card, `titulo-card`** (700, de 20 a 23px, linha 1,25): nome do sofá no card e no carrinho.
- **Preço, `preco`** (700, de 24 a 29px, linha 1,1, tabular): preço do card e total do carrinho; na página do produto sobe pra 32 a 40px.
- **Texto grande, `texto-grande`** (400, de 19 a 22px, linha 1,55): subtítulo do hero. Em 600 e 700 vira título de caixa (resumo do carrinho, "Prefere comprar conversando?") e o número do WhatsApp no rodapé.
- **Corpo, `texto-corpo`** (400, de 18 a 20px, linha 1,6): todo texto corrido, com 60 a 62 caracteres por linha.
- **Texto menor, `texto-menor`** (400, 16px): o piso. Tipo e largura do card, parcelas, notas, selos, faixa do topo, trilha e base do rodapé.
- **Rótulo, `rotulo`** (600, 17px, linha 1,2, +0,005em): texto de botão. O mesmo 17px aparece em 500 nos links do menu e em 700 nos títulos curtos (colunas do rodapé, passos, nome da categoria e do vídeo).
- **Rótulo de ícone, `rotulo-icone`** (600, 14px, linha 1,1): só a palavra embaixo dos ícones do cabeçalho e o número do contador do carrinho, abaixo de 1180px.
- **Frase de destaque, `frase-destaque`** (Cormorant 500 itálica, de 28 a 40px, linha 1,2): a frase do banner, e nada mais.

### Regras
**A Regra do Grande e Leve.** Quanto maior o texto, mais leve o peso. O título do hero é 400, títulos de seção e de página são 500, e o 700 fica pro que é pequeno e precisa ser achado rápido: nome do sofá, preço, títulos curtos de 16 e 17px. Display nunca vai em 700.

**A Regra dos 16 Pixels.** Texto corrido fica entre 18 e 20px e nada desce de 16px. As duas únicas exceções têm 14px e só existem abaixo de 1180px: o número do contador do carrinho e a palavra embaixo dos ícones do cabeçalho.

**A Regra da Serifada Única.** A Cormorant itálica aparece uma vez no site: "Seu lar, mais completo com Nobre.", no banner, alinhada à direita, só a partir de 1024px e escondida do leitor de tela. Nenhuma outra serifada, nenhuma segunda frase itálica.

## Layout

O conteúdo vive num contêiner de até 1320px (`largura`) com margem fluida de 20 a 60px (`margem`) dos dois lados. Cada seção tem de 56 a 84px de respiro vertical (`espaco-secao`), e o cabeçalho de seção põe o título à esquerda e o link "Ver todos" à direita, com 24 a 40px até o conteúdo. No topo ficam a faixa de 40px (`altura-topo`, some abaixo de 768px) e o cabeçalho fixo de 84px (`altura-header`, 68px abaixo de 1180px); a rolagem até uma âncora desconta o cabeçalho e mais 16px.

A home segue a ordem do mockup: hero, faixa de diferenciais, categorias (marrom), mais procurados (creme), vídeos (marrom, só quando há vídeo), como comprar (off-white), banner (marrom), sobre (creme) e rodapé (off-white).

- **Hero:** foto de ponta a ponta, de 500 a 680px de altura, enquadrada em 50% 76% pra base do sofá não sumir. No desktop, o texto ocupa até 640px à esquerda sobre um véu creme que vai de 97% a zero até 48% da largura (no tablet o véu chega a 96% e o texto a 520px). No celular, a foto fica em pé no hero inteiro (a altura da tela menos o cabeçalho, até 860px), o texto claro sobe pro alto sobre um véu marrom que desce de 84% a zero, os botões empilham na largura toda e o sofá aparece embaixo.
- **Faixa de diferenciais:** quatro itens separados por fios de 1px, logo abaixo do hero; vira 2 por 2 abaixo de 1024px e ícone sobre texto abaixo de 480px.
- **Grades:** produtos em 3 colunas, 2 abaixo de 1024px e 1 abaixo de 640px, com 18 a 28px de vão; na home do celular ficam 3 cards e um botão "Ver todos os 25 modelos" (o número vem do catálogo) na largura toda. Categorias (5 colunas) e vídeos (4) viram uma fileira que desliza com encaixe abaixo de 1024px, com o próximo card aparecendo na borda. Passos em 4 colunas, depois 2 e 1, ligados por uma linha vertical no celular. Rodapé em 4 colunas, depois 2 e empilhado, com o contato primeiro.
- **Produto e carrinho:** galeria (1,25fr) e informação (1fr) lado a lado, com a informação grudada logo abaixo do cabeçalho. Abaixo de 1024px vira uma coluna, a galeria vai de ponta a ponta e o botão de compra desce pra uma barra fixa no pé. No carrinho, itens e resumo (de 340 a 430px, também grudado) viram uma coluna abaixo de 1024px.
- **Pontos de quebra:** 480, 640, 768, 1024, 1180 e 1440px, mais 560px no aviso do carrinho (que empilha) e uma consulta de contêiner de 480px no card.

### Regras
**A Regra da Alternância.** As seções se revezam entre claro (creme ou off-white) e madeira escura, nunca duas marrons seguidas. A seção off-white leva um fio de 1px em `cor-borda` na borda de cima (a faixa de diferenciais, na de baixo); a marrom dispensa fio.

## Elevation & Depth

O sistema é híbrido. No claro, a profundidade vem de sombras baixas, largas e tingidas de marrom, com espalhamento negativo pra pousar embaixo do objeto e não em volta dele. No escuro, vem de camadas de tom (véu creme translúcido e fio champanhe), sem sombra. O cabeçalho só ganha sombra depois que a página rola, e as camadas seguem uma escala fixa: `--z-header` 50, `--z-flutuante` 60, `--z-menu` 70, `--z-aviso` 80 e `--z-dialogo` 90.

### Vocabulário de sombra
- **Card em repouso** (`--sombra-card`, `box-shadow: 0 1px 2px rgba(58, 41, 32, 0.05), 0 10px 28px -14px rgba(58, 41, 32, 0.2)`): card de produto e resumo do carrinho.
- **Card levantado** (`--sombra-card-alta`, `box-shadow: 0 2px 6px rgba(58, 41, 32, 0.06), 0 24px 48px -20px rgba(58, 41, 32, 0.32)`): hover do card (junto com 3px de subida), retrato do Sobre e aviso do carrinho.
- **Flutuante** (`--sombra-flutuante`, `box-shadow: 0 6px 18px -6px rgba(28, 20, 15, 0.35), 0 2px 6px rgba(28, 20, 15, 0.15)`): o WhatsApp flutuante.
- **Botão principal** (`box-shadow: 0 1px 2px rgba(58, 41, 32, 0.18)` parado e `0 10px 22px -12px rgba(58, 41, 32, 0.55)` no hover): a madeira mal descola da página até o cursor chegar.
- **Cabeçalho ao rolar** (`box-shadow: 0 10px 30px -18px rgba(58, 41, 32, 0.35)`): entra nos primeiros 120px de rolagem, por animação ligada à rolagem, onde o navegador suporta.
- **Gaveta e barra** (menu, `18px 0 48px -24px rgba(28, 20, 15, 0.5)`; barra de compra do celular, `0 -12px 30px -20px rgba(28, 20, 15, 0.45)`): a sombra sai do lado que abre.
- **Anel do campo** (`box-shadow: 0 0 0 3px rgba(122, 94, 68, 0.18)`): junto com a borda madeira, no foco da busca.

### Regras
**A Regra da Sombra de Madeira.** Sombra de elevação é sempre tingida de marrom (rgba(58, 41, 32, ...) ou rgba(28, 20, 15, ...)), baixa e com espalhamento negativo. Preto só entra como sombra de texto de legenda sobre foto.

**A Regra do Escuro sem Sombra.** Nas seções marrons não há sombra: o card é um véu creme de 5% com borda `cor-linha-escura`, e o hover sobe o véu pra 9%, a borda pra 55% e o card 3px.

## Shapes

Dois raios fazem quase todo o trabalho, com pílula e círculo reservados pro que flutua e pro que marca.

- **Raios:** 12px (`raio`) nas superfícies e 8px (`raio-controle`) nos controles.
- **Pílula e círculo:** WhatsApp flutuante e play da galeria em pílula (28px de raio em 56px de altura), contador do carrinho em pílula de 22px, número dos passos em círculo de 52px, play do vídeo em círculo de 64px com borda branca de 2px e ponto de disponibilidade em círculo de 10px.
- **Cantos menores:** 6px nos selos sobre a foto do card, 4px no anel de foco de link e no logo, 2px no fio do menu.
- **Borda:** 1px de `cor-borda` em superfície e campo; 2px em controle que muda de estado (botão, opção de compra, miniatura atual).
- **Foto:** sempre recortada pra preencher (`object-fit: cover`): 16:9 no card, 16:10 na galeria, na capa de vídeo e no carrinho, 16:11 na categoria e no banner do celular, 312:470 no retrato da Edna. No celular a galeria perde o raio e vai de ponta a ponta.

**A Regra dos Dois Raios.** 12px pra superfície que guarda conteúdo (card, bloco de medida, galeria, resumo, aviso, diálogo, retrato) e 8px pra tudo que se toca (botão, campo, chip, opção, quantidade, miniatura). Pílula e círculo ficam pro que flutua sobre foto ou conteúdo (WhatsApp flutuante, play, contador) e pros marcadores (número do passo, ponto de disponibilidade).

## Components

### Botões
Largos, firmes e escritos: cada botão diz a ação e aguenta o dedo de quem não tem pressa.
- **Forma:** cantos de 8px (`raio-controle`), borda de 2px, altura mínima de 56px, 26px de respiro lateral e texto em `rotulo` (17px, 600) numa linha só; ícone de 22px antes do texto (logo do WhatsApp) ou seta depois (vai pra outra página).
- **Principal:** madeira com texto branco e sombra de 1px. "Ver os sofás", "Ver este sofá", "Buscar", "Ver carrinho".
- **Hover / Foco / Toque:** o hover escurece pra `cor-madeira-hover`, a sombra desce pra 10px e a seta anda 4px; o foco é um contorno de 3px em madeira a 3px de distância (champanhe no escuro); o toque encolhe o botão pra 98%. Cor em 160ms, sombra e seta em 260ms.
- **Contorno:** off-white com borda `cor-borda` e texto grafite; no hover a borda vira taupe e o fundo, branco. É o par do principal: "Perguntar no WhatsApp" no card, "Adicionar ao carrinho" no produto e o WhatsApp do rodapé. Depois de adicionar, borda e texto viram madeira.
- **Comprar:** o principal com 64px de altura, um por tela. "Comprar pelo WhatsApp" no produto (texto de 19px, ícone de 26px) e "Enviar pedido pelo WhatsApp" no carrinho (texto de 17px, que pode quebrar em duas linhas).
- **Champanhe:** só em seção marrom (hoje, o banner): champanhe com texto grafite e hover em bege quente.
- **Contorno sobre foto:** o WhatsApp do hero. No desktop, borda grafite sobre creme a 72%; no celular, borda creme a 85% sobre marrom a 30%, com desfoque de 6px e texto creme.
- **Link com seta:** madeira, 16px, 600, alvo de 44px; sublinha no hover e a seta anda 4px. Champanhe no escuro. É o "Ver todos" das seções.

**A Regra dos 56.** Todo botão de ação tem pelo menos 56px e a ação escrita (o de compra, 64px). Ícone sozinho só em controle preso a um campo ou contador (lupa da busca, mais e menos da quantidade), na miniatura da galeria e no X que fecha o aviso, sempre com nome pro leitor de tela e alvo de 44px ou mais.

### Chips
- **Estilo:** os tipos de sofá na loja: 48px de altura, 15px de respiro, cantos de 8px, borda `cor-borda`, fundo off-white e texto em 600 no tamanho do corpo, com a quantidade de modelos ao lado em `cor-texto-suave` 500.
- **Estado:** no hover a borda vira taupe; o tipo atual fica em madeira com texto branco. No celular a fileira desliza de lado e vaza até a borda da tela.

**A Regra do Filtro Único.** A loja tem um campo de busca e uma fileira de chips por tipo de sofá, e só. Sem barra lateral de filtros, sem ordenação, sem faixa de preço: é isso que separa o showroom do molde de marketplace.

### Cards / Containers
- **Card de produto:** cantos de 12px, off-white, borda de 1px `cor-borda` e `--sombra-card`. Foto 16:9 sobre bege, com selos de 6px por cima: "Tem vídeo" à esquerda (grafite a 80%, texto branco) e a disponibilidade à direita (off-white, ou grafite quando indisponível). Corpo com 18px em cima e 20px nos lados e embaixo: nome em `titulo-card` (sublinhado de 2px no hover), tipo e largura em `texto-menor` suave, preço em `preco` com "a partir de" em 16px 500 e parcelas embaixo, ou "Consulte o valor no WhatsApp" em madeira (18px, 600) quando a Edna não cadastrou preço. No pé, "Ver este sofá" (principal) e "Perguntar no WhatsApp" (contorno), empilhados, e lado a lado (0,85fr e 1,15fr) quando o card passa de 480px. No hover o card sobe 3px, ganha `--sombra-card-alta` e a foto cresce 3,5% em 700ms.
- **Card no escuro (categorias e vídeos):** cantos de 12px, véu creme de 5%, borda `cor-linha-escura` e nenhuma sombra. Foto 16:11 (categoria) ou 16:10 (vídeo) sobre nogueira, nome em 17px 700 creme e contagem em `cor-no-escuro-suave`; o play do vídeo é um círculo de 64px com borda branca de 2px.
- **Caixas de apoio:** "Prefere comprar conversando?" e o contato do rodapé no celular: creme, cantos de 12px, borda de 1px e de 20 a 30px de respiro (24px no rodapé).
- **Estado vazio:** off-white, cantos de 12px, borda, de 22 a 36px de respiro, título em `texto-grande` 700 e botões na largura toda no celular.

### Inputs / Fields
- **Estilo:** a busca da loja tem 56px, borda de 1px `cor-borda`, cantos de 8px, fundo off-white, texto de 17px e rótulo visível em 600 acima do campo; o placeholder usa `cor-texto-suave` com opacidade cheia. No cabeçalho (a partir de 1440px) o campo tem 48px sobre creme, com um botão de lupa em madeira colado à direita; no menu do celular, 56px com rótulo.
- **Foco:** a borda vira madeira e ganha um anel de 3px de madeira a 18% (20% na loja).
- **Opção de compra:** cada variação é um cartão de 60px com borda de 2px `cor-borda`, cantos de 8px e fundo off-white, com o rádio de verdade (22px) por baixo, pro teclado e pro leitor de tela. Marcada, a borda vira madeira e o fundo, branco; o foco é um contorno de 3px em madeira. Nome em 600 e preço em 700 tabular.
- **Quantidade:** grupo com borda de 1px, cantos de 8px e fundo branco, com botões de mais e menos de 48px e o número em 18px 700 tabular.

### Navigation
- **Faixa do topo:** bege, 40px, texto de 16px: o WhatsApp com o número em 600 à esquerda e a entrega à direita. Some abaixo de 768px.
- **Cabeçalho:** fixo no topo, off-white, com fio inferior `cor-borda` e 84px de altura. Logo de 50px; links de 17px 500 com um fio de madeira de 2px que cresce da esquerda no hover (260ms) e fica na página atual, que vai em 700. Busca de 48px a partir de 1440px e "Carrinho (2)" em 17px 600.
- **Celular e tablet (abaixo de 1180px):** 68px, grade de três colunas com o menu à esquerda, o logo (40px) no meio e as ferramentas à direita. O botão "Menu" leva a palavra; busca e carrinho mostram a palavra embaixo do ícone em `rotulo-icone`, com alvo de 60 por 56px. O contador vira uma pílula madeira de 22px, só aparece com item e dá um pulo de 420ms quando entra um. Abaixo de 480px a busca sai do cabeçalho e fica no menu e na loja.
- **Menu do celular:** gaveta que entra pela esquerda em 260ms (até 420px ou 90% da tela), off-white, com o fundo escurecido a 45%. Busca de 56px com rótulo, links em linhas de 60px (20px, 500) separadas por fios e o WhatsApp principal na largura toda, no pé.
- **Rodapé:** off-white com fio no topo e quatro colunas (marca, loja, ajuda, contato). Títulos em 17px 700; links em `cor-texto-suave` com alvo de 40px, que no hover viram grafite sublinhado; o número do WhatsApp em `texto-grande` 600 com ícone de 26px e o botão contorno do WhatsApp. No celular o contato vem primeiro, num cartão creme, e a base ganha 76px embaixo pro flutuante não cobrir a última linha.

### WhatsApp flutuante
A pílula que mantém o caixa à vista em qualquer ponto da página: 56px de altura, madeira, logo de 28px e a palavra "WhatsApp" em `rotulo`, no canto inferior direito respeitando a área segura do celular, com `--sombra-flutuante`. Aparece depois de 320px de rolagem (acende e sobe 16px em 260ms), escurece no hover e encolhe pra 97% no toque. Some no produto e no carrinho, que têm o próprio botão de compra fixo.

**A Regra do WhatsApp à Vista.** Toda tela tem um caminho escrito pro WhatsApp: faixa do topo, botão do hero, "Perguntar no WhatsApp" em cada card, caixa do "Como comprar", rodapé e o flutuante depois de 320px. O logo do WhatsApp nunca aparece sozinho: sempre tem texto ao lado.

### Medidas
A assinatura da página do produto, onde se responde "cabe na minha sala?". Título "Medidas" com uma régua de 34px (traço light) em madeira; grade de duas colunas de blocos off-white com cantos de 12px e borda de 1px. Em cada bloco, o rótulo em 16px 600, o valor em 24 a 30px 700 tabular ("2,30 m") e o detalhe em 16px suave ("De um braço ao outro"). Embaixo, a dica de medir a sala e a porta.

### Painel de compra
Preço de 32 a 40px em 700 tabular (ou "Consulte o valor no WhatsApp" em madeira), a disponibilidade numa linha de 16px com um ponto de 10px (taupe pra sob encomenda, verde pra pronta entrega, tijolo pra indisponível), as opções, o botão de comprar de 64px, o contorno de adicionar ao carrinho e uma nota de 16px com o essencial em grafite. Abaixo de 1024px o botão de compra desce pra uma barra fixa off-white, com fio no topo e sombra pra cima, que entra deslizando.

### Faixa de diferenciais e passos
- **Diferenciais:** ícone de 42px (traço light, nogueira), título em 16px 700 e texto em 16px suave, separados por fios de 1px.
- **Como comprar:** número num disco bege de 52px (nogueira, 22px, 600, tabular), ícone de 40px em traço light, título em 17px 700 e texto em 16px suave; no celular, os passos numa coluna ligados por uma linha de 1px.

### Banner
A pausa de ambiente entre a compra e o Sobre: seção marrom com a foto nos 64% da direita, apagando no marrom pelos dois lados; título de 28 a 38px em 500 (até 20 caracteres por linha), parágrafo em `cor-no-escuro-suave`, botão champanhe e a frase serifada à direita. No celular a foto sobe pro alto (16:11) e desbota pra baixo no marrom, com o texto 48px por cima do fim da foto.

### Ícones
Phosphor, sempre com `aria-hidden` e com texto ao lado. Traço light nos ícones ilustrativos (diferenciais, passos, pilares do Sobre, régua das medidas), em nogueira na faixa e nos passos e em madeira no Sobre, nas medidas e no carrinho; fill só no logo do WhatsApp e no play; traço normal nas setas e na lupa.

### Movimento
- **Curvas e tempos:** `--ease-saida` (cubic-bezier(0.23, 1, 0.32, 1)) pra entrada, subida e revelação; `--ease-suave` (cubic-bezier(0.33, 1, 0.68, 1)) pra cor e borda; `--duracao-rapida` 160ms (cor), `--duracao-media` 260ms (sombra, fio, gaveta, flutuante) e `--duracao-revelar` 720ms.
- **Revelar ao rolar:** `data-revelar` sai de opacidade zero e 18px abaixo, em 720ms, com atraso por `--atraso`; `data-revelar="fade"` só acende. Só vale com a classe `js` no html e sem pedido de movimento reduzido. Parado, o elemento se esconde só com opacidade, nunca recortado com clip-path, que impede o IntersectionObserver de disparar.
- **Entrada do hero:** a foto assenta de 106% pra 100% em 1600ms e o texto sobe 16px em sequência, 90ms entre um bloco e outro.
- **Movimento reduzido:** tudo cai pra 0,01ms e a rolagem suave desliga.

## Do's and Don'ts

### Faça:
- **Use** a madeira (#7a5e44) como a única cor de ação no claro e o champanhe (#b89a72) como a única no escuro.
- **Mantenha** o texto corrido em `texto-corpo` (18 a 20px) e nada abaixo de 16px, fora as duas exceções de 14px do cabeçalho abaixo de 1180px.
- **Dê** a todo botão de ação 56px de altura e a ação escrita; o de compra pelo WhatsApp tem 64px.
- **Alterne** seções claras e marrons, com fio de 1px `cor-borda` na seção off-white.
- **Use** foto real do catálogo recortada pra preencher, com fundo bege (no claro) ou nogueira (no escuro) enquanto carrega.
- **Tinja** toda sombra de elevação de marrom, baixa e com espalhamento negativo.
- **Use** 12px nas superfícies e 8px nos controles.
- **Use** números tabulares em preço, medida e quantidade.
- **Mostre** "Consulte o valor no WhatsApp" em madeira quando não houver preço cadastrado.

### Não faça:
- **Não use** o #937659 do mockup com texto branco (4,2:1).
- **Não ponha** a madeira de ação dentro de seção marrom (2,3:1).
- **Não use** texto com opacidade reduzida, nem cinza frio escuro (do tipo #5E646E) como texto sobre o marrom.
- **Não ponha** `cor-texto-suave` sobre `cor-bege` (4,2:1).
- **Não use** verde nem tijolo como fundo, botão ou selo: eles só marcam estado.
- **Não adicione** filtro lateral, ordenação ou faixa de preço na loja.
- **Não use** outra serifada, nem a Cormorant fora da frase do banner.
- **Não ponha** título grande em 700: display e seção ficam em 400 e 500.
- **Não use** sombra preta neutra; preto só em sombra de texto de legenda sobre foto.
- **Não crie** botão de ação só com ícone.
- **Não ponha** rótulo miúdo acima do título (eyebrow): o título abre a seção sozinho.
- **Não volte** ao preto e prata da identidade inicial.
