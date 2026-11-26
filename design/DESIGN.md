---
version: alpha
name: ViajaJunto
description: Design system da interface web do ViajaJunto, planejador colaborativo de viagens. Paleta verde-terrosa da identidade visual do projeto, estética editorial de turismo (fotos em destaque, títulos em serifa, pílulas e cards flutuantes), tipografia DM Serif Display + Plus Jakarta Sans + Inter, escala de 4 px.
colors:
  primary: "#588157"
  primary-strong: "#3A5A40"
  on-primary: "#FFFFFF"
  secondary: "#A3B18A"
  on-secondary: "#1F1F1F"
  tertiary: "#344E41"
  on-tertiary: "#FFFFFF"
  neutral: "#DAD7CD"
  background: "#E8E3DC"
  surface: "#FFFFFF"
  on-surface: "#1F1F1F"
  on-surface-variant: "color-mix(in srgb, #1F1F1F 72%, #FFFFFF)"
  success-container: "#D9EAD8"
  warning-container: "#F1E2C7"
  error-container: "#EACACA"
  info-container: "#D9E7F4"
  photo-scrim: "rgba(52, 78, 65, 0.78)"
  tier-bronze: "#A8683A"
  tier-bronze-container: "#F0DCCB"
  tier-silver: "#8A96A0"
  tier-silver-container: "#E3E7EA"
  tier-gold: "#C29A1E"
  tier-gold-container: "#F3E6B8"
  tier-emerald: "#1F7A5C"
  tier-emerald-container: "#CDEBDF"
typography:
  display-hero:
    fontFamily: DM Serif Display
    fontSize: 64px
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: -0.01em
  display-hero-mobile:
    fontFamily: DM Serif Display
    fontSize: 40px
    fontWeight: 400
    lineHeight: 1.08
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.25
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: 0.06em
  label-overline:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.2em
  numeric-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "'tnum' 1"
  numeric-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "'tnum' 1"
rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  sm-plus: 12px
  md: 16px
  md-plus: 20px
  lg: 24px
  xl: 32px
  2xl: 40px
  3xl: 48px
  4xl: 64px
  5xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1200px
components:
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
  page-discovery:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
  app-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    height: 72px
    padding: "{spacing.md}"
  brand-tagline:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-sm}"
  nav-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-lg}"
    padding: "{spacing.sm}"
  nav-item-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-strong}"
  nav-indicator:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    size: 6px
  page-title:
    textColor: "{colors.primary-strong}"
    typography: "{typography.headline-lg}"
  page-title-mobile:
    textColor: "{colors.primary-strong}"
    typography: "{typography.headline-md}"
  hero-banner:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.display}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  button-primary:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 48px
    padding: "{spacing.lg}"
  button-primary-hover:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-strong}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 48px
    padding: "{spacing.lg}"
  button-secondary-hover:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.primary-strong}"
  button-compact:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    height: 36px
    padding: "{spacing.sm-plus}"
  button-danger:
    backgroundColor: "{colors.error-container}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: 48px
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: 48px
    padding: "{spacing.sm-plus}"
  input-label:
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
  input-helper:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-sm}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-title:
    textColor: "{colors.primary-strong}"
    typography: "{typography.headline-sm}"
  card-compact:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  list-item-title:
    textColor: "{colors.on-surface}"
    typography: "{typography.title-md}"
  overline:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-sm}"
  hero-overline:
    textColor: "{colors.primary-strong}"
    typography: "{typography.label-overline}"
  hero-title:
    textColor: "{colors.tertiary}"
    typography: "{typography.display-hero}"
  hero-title-mobile:
    textColor: "{colors.tertiary}"
    typography: "{typography.display-hero-mobile}"
  hero-title-accent:
    textColor: "{colors.primary}"
  hero-photo:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.xl}"
    height: 420px
  button-pill:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    height: 56px
    padding: "{spacing.lg}"
  button-pill-icon:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.full}"
    size: 40px
  button-circle:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.full}"
    size: 48px
  carousel-arrow:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    size: 40px
  floating-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  search-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    height: 80px
    padding: "{spacing.sm-plus}"
  search-field-icon:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.full}"
    size: 44px
  search-button:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 56px
  promo-banner:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.headline-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  promo-badge:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
  photo-card:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.lg}"
    height: 240px
  photo-card-caption:
    backgroundColor: "{colors.photo-scrim}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.title-md}"
  rating-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
  favorite-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.full}"
    size: 32px
  stats-strip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  stat-icon:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.full}"
    size: 48px
  stat-icon-warm:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.primary-strong}"
  stat-icon-cool:
    backgroundColor: "{colors.info-container}"
    textColor: "{colors.primary-strong}"
  stat-value:
    textColor: "{colors.on-surface}"
    typography: "{typography.numeric-lg}"
  money:
    textColor: "{colors.on-surface}"
    typography: "{typography.numeric-md}"
  chip:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xs}"
    height: 32px
    padding: "{spacing.sm-plus}"
  chip-selected:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
  badge-planning:
    backgroundColor: "{colors.info-container}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs}"
  badge-confirmed:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.on-surface}"
  badge-completed:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
  selo-locked:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    size: 96px
  selo-bronze:
    backgroundColor: "{colors.tier-bronze-container}"
    textColor: "{colors.on-surface}"
  selo-silver:
    backgroundColor: "{colors.tier-silver-container}"
    textColor: "{colors.on-surface}"
  selo-gold:
    backgroundColor: "{colors.tier-gold-container}"
    textColor: "{colors.on-surface}"
  selo-emerald:
    backgroundColor: "{colors.tier-emerald-container}"
    textColor: "{colors.on-surface}"
  alert-success:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  alert-warning:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.on-surface}"
  alert-error:
    backgroundColor: "{colors.error-container}"
    textColor: "{colors.on-surface}"
  alert-info:
    backgroundColor: "{colors.info-container}"
    textColor: "{colors.on-surface}"
  tab:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-lg}"
    height: 48px
  tab-active:
    textColor: "{colors.primary-strong}"
  progress-track:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    height: 8px
  progress-fill:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
  avatar:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    size: 40px
  divider:
    backgroundColor: "{colors.neutral}"
    height: 1px
  icon-accent:
    textColor: "{colors.primary}"
    size: 24px
  body-text-large:
    textColor: "{colors.on-surface}"
    typography: "{typography.body-lg}"
  layout-spacing:
    padding: "{spacing.margin-desktop}"
    width: "{spacing.container-max}"
---

# ViajaJunto — Design System

## Overview

O ViajaJunto é um planejador colaborativo de viagens: um grupo monta junto o roteiro (destinos e atividades), controla o orçamento, divide as despesas e descobre lugares bem avaliados. A interface é web, responsiva (desktop e celular) e em **português do Brasil**.

A personalidade é **acolhedora, natural e organizada**: lembra um caderno de viagem bem cuidado, não um painel corporativo. Os verdes vêm da natureza e da trilha; os tons de areia e linho dão calor sem cansar a vista. A interface deve passar calma e controle, porque planejar viagem em grupo já envolve muita negociação: cada tela tem uma ação principal clara, números de dinheiro são fáceis de ler e quem é quem no grupo fica sempre visível.

**Direção visual: editorial de turismo.** As telas de descoberta (painel inicial, catálogo de destinos) seguem a linguagem de sites de viagem premium, com a referência em [`references/painel-referencia.jpg`](references/painel-referencia.jpg): muito branco e respiro, **fotografia como protagonista** (recortada em forma orgânica no topo e em cards de foto com legenda sobre véu escuro), um título grande em **serifa** com a segunda linha em itálico colorido, **pílulas** para botões e busca, ícones dentro de **círculos tingidos** e cards brancos que **flutuam** sobre a foto com sombra ampla. Da referência copiamos a composição, as formas, a tipografia e o ritmo; as cores continuam sendo as da paleta abaixo, nunca o azul do exemplo. As telas de trabalho (detalhe da viagem, orçamento, despesas) usam a mesma linguagem de forma mais contida, sobre o fundo Linho.

Densidade **média**: cards espaçados, respiro generoso entre blocos e listas compactas só onde o usuário compara itens (despesas, atividades do dia).

Público: estudantes e jovens adultos planejando viagens em grupo, no celular e no computador. Não há senha nem cadastro: o login é só com o Google.

## Colors

A paleta é exatamente a da identidade visual do projeto (`docs/visual_id.md`): cinco verdes e neutros principais e sete cores de apoio. Nenhuma cor fora dela entra na interface; a única derivada é `on-surface-variant`, que é o próprio `#1F1F1F` misturado com branco.

- **Verde Folha — primary (#588157):** a cor da marca e do destaque. Usada em ícones de destaque, barra de progresso do orçamento, indicador da aba ativa e do menu, anel de foco, bordas de seleção, na marca e na **segunda linha em itálico do título do hero** (`hero-title-accent`). Como texto, só em tamanho grande (24 px ou mais), onde o mínimo AA é 3:1; sobre branco ela dá 4,48:1. **Não é usada como fundo de texto pequeno**: branco sobre ela também dá 4,48:1, abaixo dos 4,5:1 exigidos.
- **Verde Pinheiro — primary-strong (#3A5A40):** fundo dos botões principais (branco sobre ele dá 7,7:1), títulos de página e de card, links e o texto da aba ativa.
- **Verde Floresta — tertiary (#344E41):** a cor institucional. Título do hero, banners de destaque, véu das fotos (`photo-scrim`, Floresta a 78%) e o hover do botão principal.
- **Sálvia — secondary (#A3B18A):** elementos complementares: chips selecionados, avatares dos membros, ilustrações. Sempre com texto `#1F1F1F` (7,2:1).
- **Areia — neutral (#DAD7CD):** bordas, divisórias, trilha da barra de progresso, chips e botões compactos, e o fundo de fotos enquanto carregam.
- **Linho — background (#E8E3DC):** o fundo das telas de trabalho, atrás dos cards, e as formas orgânicas decorativas das telas de descoberta.
- **Branco — surface (#FFFFFF):** a barra superior, o fundo das telas de descoberta (`page-discovery`), cards, busca, campos, modais e menus.
- **Tinta — on-surface (#1F1F1F):** todo o texto principal. `on-surface-variant` (72% tinta, 28% branco) é o texto secundário: legendas, datas, textos de ajuda.
- **Estados:** `success-container` (#D9EAD8), `warning-container` (#F1E2C7), `error-container` (#EACACA) e `info-container` (#D9E7F4) são fundos de alertas e badges, sempre com texto `#1F1F1F` e um ícone que diga o estado. A cor nunca é o único sinal. Eles também tingem os **círculos de ícone** (`search-field-icon`, `stat-icon`, `stat-icon-warm`, `stat-icon-cool`), como os círculos coloridos claros da referência.

- **Níveis dos selos:** Bronze (`tier-bronze`, #A8683A), Prata (`tier-silver`, #8A96A0), Ouro (`tier-gold`, #C29A1E) e Esmeralda (`tier-emerald`, #1F7A5C), do mais fácil ao mais difícil. São as únicas cores fora da paleta principal e servem **só** para a moldura do selo e o ponto do nível; nunca como fundo de texto. O quadro da ilustração e o selinho do nível usam as versões claras `tier-*-container`, sempre com texto #1F1F1F, e o nível também vem escrito ("OURO").

Status da viagem (FR07): **Planejando** usa `info-container`, **Confirmada** usa `success-container` e **Concluída** usa `neutral`.

## Typography

Três famílias do Google Fonts, todas com acentos completos do português e carregadas com `next/font/google` no Next.js:

- **DM Serif Display** (só o título do hero, 400 normal e itálico): serifa de alto contraste, a mesma sensação editorial do "The world *is yours.*" da referência. Primeira linha em Floresta, segunda linha em **itálico** Folha (`hero-title-accent`). Nunca use em textos menores que 40 px nem fora do hero.
- **Plus Jakarta Sans** (títulos, 700–800): geométrica e amigável, com cantos suaves que combinam com os raios arredondados e o tom de viagem. Dá a hierarquia forte de títulos que a identidade visual pede.
- **Inter** (texto, rótulos e números, 400–600): muito legível em tamanhos pequenos e com algarismos tabulares (`'tnum' 1`), que mantêm colunas de valores alinhadas no orçamento e nas despesas.

Regras:

- O hero do painel usa `display-hero` (64 px) no desktop e `display-hero-mobile` (40 px) no celular, em duas linhas curtas (até ~18 caracteres cada).
- Acima do título do hero vai o `hero-overline`: três palavras em caixa alta com pontos ("PLANEJE. DIVIDA. VIAJE."), espaçamento de 0,2em, em Pinheiro, seguido de um avião (`airplane-tilt`) com rastro tracejado.
- Títulos de página em `headline-lg` (32 px) no desktop e `headline-md` (24 px) no celular. Títulos de seção do painel ("Minhas viagens", "Destinos mais bem avaliados") em `headline-sm` com o link "Ver todas" à direita. `display` (40 px) só no `hero-banner` (capa da viagem); no celular ele cai para `headline-lg`.
- Texto corrido em `body-md` (16 px). Nunca use menos de 14 px para texto e 12 px para rótulos em caixa alta (`label-sm`, com espaçamento de 0,06em).
- Botões, abas e itens de menu usam `label-lg` ou `label-md` (Inter 600), em caixa normal (só a primeira letra maiúscula).
- Todo valor em dinheiro, porcentagem ou contagem usa `numeric-lg` ou `numeric-md`, formatado em pt-BR: `R$ 1.250,00`, `23 %`, datas `12 mar. 2027`.
- No máximo três pesos de sans por tela: 400, 600 e 700 (800 só no `display`). A serifa do hero não conta.

## Layout

Grade de **12 colunas** no desktop (container máximo de 1200 px, margens de 32 px, gutter de 24 px) e **coluna única** no celular (margens de 16 px). Pontos de quebra: até 639 px celular, 640–1023 px tablet (8 colunas), a partir de 1024 px desktop.

Toda medida segue a escala de **múltiplos de 4**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.

- Padding de componentes pequenos (chips, botões compactos): 8 ou 12 px.
- Gap dentro de cards e formulários: 16 ou 24 px. Padding interno do card: 24 px (16 px no `card-compact`).
- Separação entre blocos da página: 32 ou 40 px.
- Alvos de toque com pelo menos 44 × 44 px no celular; botões e campos têm 48 px de altura.

Estrutura das telas logadas: barra superior clara (`app-bar`, 72 px, branca e sem sombra) com marca e slogan à esquerda, navegação no centro (item ativo em Pinheiro com um ponto Folha embaixo, `nav-indicator`) e notificações e avatar à direita; abaixo, o conteúdo dentro do container. No celular, a navegação vai para uma barra inferior fixa com até 4 destinos (Viagens, Descobrir, Notificações, Perfil).

**Composição das telas de descoberta** (detalhada para o painel em [`screens/painel.md`](screens/painel.md)):

- **Hero em duas colunas** (5 + 7 colunas): texto à esquerda; à direita, a foto recortada em forma orgânica que encosta na borda direita da tela e no topo, com uma forma Linho maior atrás dela.
- **Busca em pílula** sobrepondo a parte de baixo da foto em 40 px, centralizada e com largura de 10 colunas.
- **Faixas de conteúdo** abaixo: blocos alternados entre um card de destaque (4 colunas) e um carrossel de cards de foto (8 colunas), separados por 48–64 px.
- Os carrosséis rolam na horizontal com `scroll-snap`, mostram parte do próximo card como dica e têm setas circulares (`carousel-arrow`) que ficam metade para fora do trilho no desktop; no celular, só o gesto.

## Elevation & Depth

A profundidade vem primeiro de **camadas de tom** (cards brancos sobre o fundo linho) e só depois de sombras. As sombras são discretas, sempre pretas com pouca opacidade, e crescem com a importância do elemento:

- `shadow-sm` — `0 2px 4px rgba(0, 0, 0, 0.08)`: cards em repouso, chips flutuantes.
- `shadow-md` — `0 4px 8px rgba(0, 0, 0, 0.10)`: card em hover, barra inferior do celular.
- `shadow-lg` — `0 8px 16px rgba(0, 0, 0, 0.12)`: menus suspensos, popovers.
- `shadow-xl` — `0 12px 24px rgba(0, 0, 0, 0.14)`: modais e diálogos (com véu `rgba(31, 31, 31, 0.4)` atrás).

Nas telas de descoberta as sombras ficam mais presentes, como na referência: a busca em pílula e os cards que flutuam sobre a foto (`floating-card`) usam `shadow-xl`; os botões circulares (`button-circle`, `carousel-arrow`) usam `shadow-lg`; os cards de foto não têm sombra (a foto já dá o peso). Sobre fotos, a legenda fica sobre o véu `photo-scrim`, aplicado como gradiente de baixo para cima (de Floresta 78% para transparente, cobrindo o terço de baixo da foto).

Bordas de 1 px em `neutral` separam itens de lista e campos; não use sombra e borda forte no mesmo elemento.

## Shapes

Formas **suaves e acolhedoras**, todas na escala de 4 px:

- `xs` 4 px — chips, badges e inputs pequenos.
- `sm` 8 px — botões compactos, cards compactos e itens do menu.
- `md` 12 px — botões principais e secundários, campos de formulário e alertas.
- `lg` 16 px — cards principais, painéis e modais.
- `xl` 24 px — banners e cards grandes de destaque (capa da viagem).
- `full` — **pílulas** (botão principal do hero, busca, selos de destaque), círculos de ícone, botões circulares, avatares e barras de progresso.

Fotos de destinos seguem o raio do card que as contém: 16 px nos cards de foto, 24 px no banner de destaque. A foto do hero é a exceção: em vez de raio, ela usa um **recorte orgânico** (um `clip-path` com curvas suaves, como uma onda que desce da esquerda para a direita), sem cantos retos à vista, e uma forma Linho maior atrás criando a moldura.

## Motion

O movimento existe para dar **continuidade** (de onde veio, para onde foi) e **resposta** ao toque, nunca para enfeitar. Ele é curto, suave e sempre desligado quando o sistema pede menos movimento (`prefers-reduced-motion: reduce`).

- **Durações:** rápida 150 ms (hover, toque, chips), base 250 ms (abas, modais, cards) e lenta 450 ms (entrada de página e do hero). Nada passa de 600 ms, exceto o brilho dos esqueletos.
- **Curvas:** saída suave `cubic-bezier(0.2, 0.8, 0.2, 1)` para o que entra; padrão `cubic-bezier(0.4, 0, 0.2, 1)` para mudanças de estado. Sem quicar exagerado.
- **Entrada de página:** o conteúdo sobe 8 px e aparece (opacidade 0 → 1) em 450 ms. Listas e carrosséis entram em cascata, 40 ms entre itens, no máximo 12 itens animados.
- **Hover e toque:** cards clicáveis sobem 4 px e ganham `shadow-md`; a foto aproxima 4%. Botões e chips encolhem para 97% enquanto pressionados.
- **Hero:** as duas linhas do título entram em sequência; o rastro do avião se desenha; o card flutuante entra por último e flutua devagar (6 s, 4 px).
- **Modais:** o véu escurece e o modal cresce de 96% para 100% em 250 ms.
- **Fotos:** aparecem com fade quando terminam de carregar, sobre o fundo Areia.
- **Movimento reduzido:** sem deslocamento, escala, cascata ou flutuação; ficam só mudanças de cor e opacidade instantâneas.

## Components

Os tokens do cabeçalho são a referência normativa; abaixo, o comportamento de cada grupo.

- **Botões:** `button-primary` (Pinheiro, texto branco) para **uma** ação principal por tela ou card, como "Nova viagem" ou "Adicionar despesa". `button-secondary` (branco, borda de 1 px em `primary-strong`, texto Pinheiro) para ações alternativas. `button-compact` (Areia, 36 px) para ações dentro de listas e cards. `button-danger` (`error-container`) só para remover ou sair, sempre com confirmação. Ícone à esquerda do texto, 20 px, gap de 8 px. Estado desabilitado: opacidade de 40% e cursor padrão.
- **Campos (`input`):** rótulo acima (`input-label`), campo branco de 48 px com borda de 1 px em `neutral`, texto de ajuda abaixo (`input-helper`). No foco, borda de 2 px em `primary` mais anel de 3 px em `primary` com 35% de opacidade. No erro, borda e fundo do texto de ajuda em `error-container`, com ícone e mensagem que diga como corrigir.
- **Cards:** `card` para conteúdo principal (viagem, resumo do orçamento) e `card-compact` para itens repetidos (atividade, despesa). O título usa `card-title`. Card clicável inteiro ganha `shadow-md` no hover e foco visível.
- **Chips:** filtros e categorias de atividade (Passeio, Comida, Hospedagem, Transporte, Outros). `chip-selected` em Sálvia com ícone de check.
- **Badges de status:** `badge-planning`, `badge-confirmed` e `badge-completed`, em `label-sm` caixa alta, sempre com texto ("PLANEJANDO").
- **Alertas:** `alert-success`, `alert-warning`, `alert-error` e `alert-info`, com ícone Phosphor à esquerda e texto em `body-sm`.
- **Abas (`tab`, `tab-active`):** navegação dentro da viagem (Roteiro, Orçamento, Despesas, Membros). A aba ativa tem texto Pinheiro e sublinhado de 3 px em `primary`.
- **Barra de progresso:** trilha `progress-track` (Areia) e preenchimento `progress-fill` (Folha). Acima de 100% do orçamento, o preenchimento fica cheio e um `alert-warning` explica quanto passou.
- **Avatares:** iniciais em Sálvia, 40 px (32 px em listas densas), empilhados com sobreposição de 4 px e borda de 2 px na cor do fundo (branca nos cards).
- **Navegação:** `app-bar` branca; `nav-item` em `label-lg` cinza, o ativo em Pinheiro com o ponto `nav-indicator` (6 px) centralizado 6 px abaixo do texto.
- **Hero:** `hero-overline`, `hero-title` + `hero-title-accent` (ex.: "Sua viagem / *começa aqui.*"), um parágrafo `body-lg` em `on-surface-variant` (no máximo 2 linhas) e o `button-pill` com o `button-pill-icon` (círculo branco com seta) dentro, à direita do texto. Do lado da foto, um `floating-card` com um resumo social (avatares do grupo + número) e um `button-circle` com texto curvo ao redor ("ver no mapa") apoiado na borda da foto.
- **Busca em pílula (`search-bar`):** 4 campos separados por divisórias verticais de 1 px Areia; cada campo tem um `search-field-icon` (círculo Menta com ícone Pinheiro), um rótulo em `label-md` e o valor/placeholder em `body-sm` cinza, e um `caret-down` à direita; no fim, o `search-button` redondo com lupa. No celular vira um card de raio 24 px com os campos empilhados e o botão de largura total.
- **Cards de foto (`photo-card`):** foto cobrindo o card (proporção 4:5 no desktop), legenda na parte de baixo sobre o véu (`photo-card-caption`) com o nome em `title-md` branco e uma linha de apoio em `body-sm`; no canto de baixo à direita um `rating-pill` branco com estrela Folha; no canto de cima à direita o `favorite-button` (coração). Para viagens do usuário, o selo de status fica no canto de cima à esquerda e o lugar da nota é ocupado por uma pílula com o número de viajantes.
- **Banner de destaque (`promo-banner`):** foto com véu Floresta da esquerda para a direita, `promo-badge` em pílula no topo, título `headline-md` com a palavra-chave em `warning-container` (o "30% off" amarelo da referência vira, por exemplo, "faltam 87 dias") e um botão branco em pílula.
- **Faixa de números (`stats-strip`):** card branco em pílula larga (raio 24 px) com 3 números lado a lado, cada um com um `stat-icon` tingido (Menta, Areia quente, Azul claro) à esquerda, valor em `title-md` e legenda em `body-sm`.
- **Valores:** `stat-value` para números de destaque (orçamento total, saldo) e `money` para valores em listas, alinhados à direita.
- **Selos:** as conquistas são selos postais (84 × 100, 64 px de largura na prévia): papel branco com **picote** nas quatro bordas, moldura na cor do nível, quadro em `tier-*-container` com a ilustração em Pinheiro (Cristo Redentor, mapa do continente, carimbo, palmeira...) e faixa branca com o nível em caixa alta. Bloqueado: moldura Areia, ilustração apagada, faixa "BLOQUEADO" e cadeado. Abaixo do selo: nome em `title-md`, selinho do nível (`selo-<nível>`) e barra de progresso até o próximo nível ("3 de 5 países"). Clicar abre um diálogo com os quatro níveis e o que falta para cada um. No Início, a prévia é um **álbum de selos** aberto: duas páginas brancas sobre fundo Linho com a dobra no meio, os conquistados "colados" levemente tortos (até 6°), e os espaços vazios em retângulo tracejado Areia com "?". Para virar a página, o canto de baixo da folha fica **dobrado** (aba Areia sobre o fundo Linho, cresce no hover); clicar vira a folha na lombada em 900 ms, com frente e verso, leve curvatura e sombra que acompanha o giro. Sem setas.
- **Ícones:** biblioteca **Phosphor Icons**, estilo `regular` (ou `fill` para estado ativo), 20 px em botões e 24 px soltos (`icon-accent`). Exemplos: `airplane-tilt` (viagem), `map-pin` (destino), `calendar-blank` (datas), `wallet` (orçamento), `receipt` (despesa), `users-three` (membros), `bell` (notificações), `star` (avaliação).

## Do's and Don'ts

- Faça uma única ação principal (`button-primary`) por tela ou por card.
- Faça todo texto pequeno sobre fundo escuro em branco, sobre `primary-strong` ou `tertiary`, nunca sobre `primary`.
- Faça todos os valores em dinheiro com algarismos tabulares e formato pt-BR (`R$ 1.250,00`).
- Faça os estados (sucesso, aviso, erro, status da viagem) com ícone e texto além da cor.
- Faça o layout funcionar em 360 px de largura sem rolagem horizontal.
- Faça estados vazios úteis: ícone, uma frase do que fazer e o botão da ação ("Você ainda não tem viagens. Crie a primeira!").
- Mostre ações de edição apenas para quem pode editar (OWNER e EDITOR); para VIEWER, a mesma tela em modo leitura.
- Faça as telas de descoberta parecidas com a referência na composição (hero com foto orgânica, busca em pílula sobreposta, carrosséis de cards de foto, faixa de números), mas sempre com a paleta do ViajaJunto.
- Use fotos reais dos destinos (`photoUrl` da API, servida pelo S3) sempre que existirem; sem foto, use a cor Areia com o ícone do destino, nunca uma imagem genérica de banco de imagens.
- Não use cores fora da paleta, nem o azul da referência, gradientes chamativos ou sombras coloridas. O único gradiente permitido é o véu `photo-scrim` sobre fotos.
- Não use `secondary` (Sálvia) como cor de texto, nem `primary` (Folha) em texto menor que 24 px: o contraste fica abaixo do mínimo.
- Não use a serifa do hero fora do título do hero, nem crie mais de um hero por tela.
- Não misture raios fora da escala (como 6 px ou 10 px) nem cantos retos em componentes interativos.
- Não use emojis no lugar de ícones nem misture outra biblioteca de ícones com a Phosphor.
- Não escreva textos de interface em inglês: rótulos, mensagens e datas são em português do Brasil.
