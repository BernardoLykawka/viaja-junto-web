# Tela: Painel inicial ("Minhas viagens")

Especificação da tela inicial logada do ViajaJunto. Ela deve ficar **visualmente semelhante à referência** [`references/painel-referencia.jpg`](../references/painel-referencia.jpg) (site de turismo "Travorra"), trocando o conteúdo de agência de viagens pelo conteúdo do ViajaJunto e as cores azuis pela paleta do [`DESIGN.md`](../DESIGN.md).

O protótipo [`prototype/index.html`](../prototype/index.html) (rota `#/viagens`) implementa esta especificação e é a referência de pixel. Os nomes entre crases são componentes e tokens do `DESIGN.md`.

- **Requisitos:** FR06 (painel com as viagens do usuário), FR04 (criar viagem), FR18 (entrar com código), FR10/FR24 (buscar destinos), FR11 (países no mapa), FR25 (destinos mais bem avaliados).
- **Ação principal:** "Nova viagem" (é o único `button-pill` Pinheiro da tela).
- **Fundo:** `page-discovery` (branco).

## 1. O que copiar da referência

Copie a **composição e o acabamento**, não o conteúdo nem as cores:

| Na referência | No ViajaJunto |
| ------------- | ------------- |
| Fundo branco com uma grande forma azul-clara atrás da foto | Fundo branco com uma forma orgânica **Linho** atrás da foto |
| Título serifado "The world / *is yours.*" com a 2ª linha em itálico azul | "Sua viagem / *começa aqui.*" em DM Serif Display, 2ª linha em itálico Folha |
| Sobretítulo "EXPLORE. DREAM. DISCOVER." + avião com rastro tracejado | "PLANEJE. DIVIDA. VIAJE." em Pinheiro + `airplane-tilt` com rastro tracejado Folha |
| Botão azul em pílula com seta num círculo branco | `button-pill` "Nova viagem" com `button-pill-icon` |
| Foto de Santorini recortada em curva, sangrando até a borda direita e o topo | Foto do destino da próxima viagem (ex.: Londres) no mesmo recorte orgânico |
| Card flutuante "Happy Travelers 28K+" com avatares | `floating-card` "Próxima viagem · Eurotrip 2027 · faltam 87 dias" com os avatares do grupo |
| Botão redondo "Watch travel story" com texto curvo | `button-circle` com ícone de mapa e texto curvo "ver no mapa" (abre o mapa de países, FR11) |
| Barra de busca em pílula com 4 campos + botão redondo | `search-bar`: Para onde? · Ida · Volta · Viajantes + `search-button` (inicia uma viagem com esses dados) |
| Banner "Get up to 30% off" com foto e selo "LIMITED TIME OFFER" | `promo-banner` da próxima viagem: selo "PRÓXIMA VIAGEM", "Eurotrip 2027 *faltam 87 dias*", botão "Abrir roteiro" |
| Faixa "120+ Destinations · 2000+ Experiences · 18K+ Travelers" | `stats-strip`: viagens · países visitados · companheiros de viagem |
| Carrossel "Featured destinations" com nota e coração | Carrossel "Minhas viagens" (selo de status) e carrossel "Destinos mais bem avaliados" (nota + coração) |

Não copie: logotipo, textos em inglês, preços em dólar, o azul, o seletor de idioma (a interface é só pt-BR) nem o menu hambúrguer no desktop.

## 2. Estrutura (desktop, 1440 px)

```text
┌ app-bar 72px ─ marca + slogan │ Minhas viagens• Descobrir Avaliações │ 🔔 avatar ┐
│                                                                                │
│  PLANEJE. DIVIDA. VIAJE. ✈┄┄       ╭──────── foto orgânica (7 col) ────────────┤
│  Sua viagem                        │                        ┌ floating-card ┐  │
│  começa aqui.  (itálico Folha)     │                        └───────────────┘  │
│  texto de apoio (2 linhas)    (◯ ver no mapa)                                 │
│  [ Nova viagem  (→) ]  Entrar com código                                      │
│        ╭──────────────── search-bar (10 col, sobe 40px sobre a foto) ───────╮  │
│        │ (📍) Para onde? ˅ │ (📅) Ida ˅ │ (📅) Volta ˅ │ (👥) Viajantes ˅ (🔍)│  │
│        ╰────────────────────────────────────────────────────────────────────╯  │
│  ┌ promo-banner (5 col) ─┐  Minhas viagens                     Ver todas ›     │
│  │ PRÓXIMA VIAGEM        │ (‹) [foto][foto][foto]… (›)   (7 col)                │
│  └───────────────────────┘                                                     │
│  ┌ stats-strip (5 col) ──┐                                                     │
│  Destinos mais bem avaliados                                  Ver todos ›     │
│  (‹) [foto ★4,8 ♡][foto][foto][foto][foto]… (›)               (12 col)         │
└────────────────────────────────────────────────────────────────────────────────┘
```

Medidas (todas da escala de 4 px):

1. **Barra superior** — `app-bar` 72 px, branca, sem sombra nem borda. Marca: ícone `compass` (fill, Folha) dentro de um círculo Menta de 40 px + "ViajaJunto" em `headline-sm` + slogan "Viagens em grupo" em `brand-tagline`. Navegação 64 px depois da marca, com 32 px entre itens, terminando antes de a foto começar; notificações e avatar encostados à direita, sobre a foto (o sino num `button-circle` branco).
2. **Hero** — 520 px de altura. Coluna de texto (5 col) começa 64 px abaixo da barra; 24 px entre sobretítulo e título, 24 px entre título e parágrafo, 32 px até os botões. A foto (7 col + a margem direita) começa no topo da página, atrás da barra, com recorte orgânico: a borda esquerda é uma curva em "S" e a de baixo sobe da esquerda para a direita. A forma Linho atrás é ~10% maior e deslocada 24 px para a esquerda e para baixo. O `floating-card` fica a 24 px do canto superior direito da foto; o `button-circle` fica sobre a curva esquerda, na metade da altura.
3. **Busca** — `search-bar` de 80 px, centralizada, 10 colunas, sobrepondo a foto em 40 px, `shadow-xl`. Campos com 16 px de padding horizontal e divisórias de 1 px Areia com 40 px de altura.
4. **Primeira faixa** — começa 48 px abaixo da busca. Coluna esquerda (5 col): `promo-banner` com 200 px de altura e, 24 px abaixo, a `stats-strip`. Coluna direita (7 col): título de seção + carrossel de `photo-card` de 200 × 240 px com gap de 16 px.
5. **Segunda faixa** — 64 px abaixo: "Destinos mais bem avaliados" ocupando 12 colunas, cards de 220 × 260 px.
6. Final da página com 80 px de respiro (sem rodapé pesado).

## 3. Conteúdo e dados

| Bloco | Conteúdo | Fonte na API |
| ----- | -------- | ------------ |
| Saudação | "Olá, Gustavo" no `floating-card` ou como `overline` acima do título no celular | `GET /api/auth/me` |
| Foto do hero | Foto do primeiro destino da próxima viagem; sem viagem, a do destino mais bem avaliado | `photoUrl` do destino (`GET /api/destination-catalog/:id`) |
| Card flutuante | Nome da próxima viagem, "faltam N dias", até 4 avatares + "+N" | `GET /api/trips` (a com `startDate` futura mais próxima) |
| Busca | "Para onde?" busca no catálogo; datas e viajantes vão para o formulário de nova viagem | `GET /api/destination-catalog?q=` e `POST /api/trips` |
| Banner | Próxima viagem: dias que faltam, quanto do orçamento ainda está livre, botão "Abrir roteiro" | `GET /api/trips/:id/budget/summary` |
| Números | Viagens em andamento · países visitados · pessoas com quem viajou | `GET /api/trips`, `GET /api/users/me/visited-countries` |
| Minhas viagens | Card de foto por viagem: selo de status no canto superior esquerdo, nome e datas na legenda e, no lugar da nota, uma pílula com o número de viajantes | `GET /api/trips` |
| Mais bem avaliados | Card de foto: cidade e país na legenda, nota média (`★ 4,8`) no `rating-pill`, coração no canto superior direito | `GET /api/destination-catalog/top?limit=8` |
| Sino | Número de não lidas | `GET /api/notifications/unread-count` |

Datas e valores sempre com `Intl` em pt-BR ("12 de mar.", "R$ 6.864,60", "4,8").

## 4. Estados

- **Carregando:** esqueleto com as mesmas formas (pílula da busca, retângulos dos cards em Areia) e animação de brilho suave; o título do hero já aparece.
- **Sem viagens:** o banner vira "Sua primeira viagem começa com um destino" com o botão "Nova viagem"; o carrossel "Minhas viagens" dá lugar a um estado vazio; o card flutuante some.
- **Sem foto:** o card de foto usa fundo Areia com o ícone do destino em Pinheiro no centro; o véu e a legenda continuam.
- **Erro de rede:** `alert-error` acima da primeira faixa com "Tentar de novo"; os blocos que carregaram continuam visíveis.

## 5. Celular (390 px)

- Barra superior: marca à esquerda, sino e avatar à direita; a navegação vai para a barra inferior.
- Hero empilhado: a foto vem primeiro, com 240 px de altura e o recorte orgânico só na borda de baixo; depois o texto, com `hero-title-mobile` (40 px) e o botão em largura total.
- A busca vira um card branco de raio 24 px com os 4 campos empilhados (56 px cada, separados por divisórias) e o `search-button` vira uma pílula de largura total "Buscar" em Menta (`success-container` com texto Pinheiro), para "Nova viagem" continuar sendo o único botão Pinheiro da tela.
- Banner e faixa de números em largura total (no banner, o véu Floresta cobre 60% da largura para o texto nunca ficar sobre a parte clara da foto); a faixa de números mantém os 3 itens lado a lado, com ícones de 40 px.
- Carrosséis com rolagem por gesto, `scroll-snap` e o próximo card aparecendo pela metade; setas escondidas.

## 6. Critérios de aceite

- [ ] Lado a lado com a referência, a estrutura é reconhecível: hero com título serifado e foto orgânica, busca em pílula sobreposta, banner + números à esquerda e carrossel à direita.
- [ ] Nenhuma cor fora do `DESIGN.md` (nada de azul); itálico do título em `primary`, demais textos com contraste AA.
- [ ] Só um botão Pinheiro em pílula ("Nova viagem"); "Entrar com código" é link/botão secundário.
- [ ] Cards de foto com véu e texto legível mesmo em fotos claras.
- [ ] Carrosséis navegáveis por teclado (setas com `aria-label`, cards focáveis) e por gesto.
- [ ] Funciona em 360 px sem rolagem horizontal da página.
