# AGENTS.md — Interface do ViajaJunto

Instruções para agentes de IA (Claude, Copilot, Gemini, Cursor, Stitch...) que geram ou alteram a interface web do ViajaJunto. Leia este arquivo inteiro antes da primeira tarefa e siga-o em todas as outras.

## 1. Fonte da verdade

| Arquivo | Papel |
| ------- | ----- |
| [`DESIGN.md`](DESIGN.md) | **Design system.** Os tokens do cabeçalho YAML são normativos; as seções em prosa dizem como aplicá-los. |
| [`tokens/`](tokens) | Tokens gerados do `DESIGN.md` (`npm run design:tokens`). **Nunca edite à mão.** |
| [`screens/`](screens) | Especificação de cada tela (estrutura, medidas, dados da API, estados, celular e critérios de aceite). Comece por [`screens/painel.md`](screens/painel.md). |
| [`references/`](references) | Imagens de referência visual. [`painel-referencia.jpg`](references/painel-referencia.jpg) é o modelo de estilo das telas de descoberta. |
| [`prototype/index.html`](prototype/index.html) | Protótipo de referência: mostra o design system aplicado ao painel e ao detalhe da viagem. |
| Backend: `docs/requirements.md` e `/docs` da API | O que cada tela precisa fazer (FR/BR) e os contratos REST que ela consome. |

Quando houver conflito, vale nesta ordem: **tokens do `DESIGN.md` → prosa do `DESIGN.md` → especificação da tela em `screens/` → protótipo → imagem de referência → seu próprio gosto**. A imagem de referência dita composição, formas, tipografia e ritmo; **nunca** as cores, os textos ou a marca dela. Se o `DESIGN.md` não cobre um caso, decida pelo espírito da seção *Overview* e registre a decisão no PR (ou proponha a mudança no `DESIGN.md`, ver seção 6).

## 2. Antes de gerar qualquer tela

1. Leia o `DESIGN.md` inteiro, inclusive *Do's and Don'ts*.
2. Se a tela tem especificação em `screens/`, leia e siga seção por seção; se ela cita uma imagem em `references/`, abra a imagem e compare o seu resultado com ela no final.
3. Abra o protótipo e reutilize os padrões que já existem (barra superior, cards, abas, listas, estados vazios) antes de inventar um novo.
4. Identifique os requisitos atendidos (ex.: FR06, FR15–FR17) e as regras de permissão (BR02–BR06).
5. Liste os estados da tela: carregando, vazio, erro, sucesso, somente leitura (VIEWER) e celular.

## 3. Stack e como consumir os tokens

- **App:** Next.js (App Router) + TypeScript, como definido no documento de arquitetura.
- **Estilo:** Tailwind CSS v4. Importe `tokens/tokens.css` (bloco `@theme`) no `app/globals.css`; as cores viram classes como `bg-primary-strong`, `text-on-surface`, `bg-background`, e os raios `rounded-md`, `rounded-lg`.
- **CSS puro** (protótipos, e-mails, páginas estáticas): use `tokens/tokens.root.css`, que tem as mesmas variáveis em `:root` mais as sombras (`--shadow-sm` … `--shadow-xl`).
- **Tipografia:** use as classes `.type-<token>` (ex.: `.type-headline-lg`, `.type-body-md`, `.type-numeric-md`), que juntam família, tamanho, peso, altura de linha, espaçamento e `font-feature-settings` do token. Elas estão no protótipo e devem ser copiadas para o `globals.css` do app. Não combine família, tamanho e peso soltos.
- **Fontes:** `next/font/google` com `DM_Serif_Display` (400, estilos `normal` e `italic`, só para o título do hero), `Plus_Jakarta_Sans` (700 e 800) e `Inter` (400, 600 e 700), `display: 'swap'`, subset `latin` (cobre os acentos do português).
- **Fotos:** `next/image` com a `photoUrl` que a API devolve (bucket S3); libere o host do bucket em `images.remotePatterns`. Use `fill` + `object-fit: cover` nos cards de foto e `priority` só na foto do hero.
- **Ícones:** `@phosphor-icons/react` (no HTML puro, `@phosphor-icons/web`). Nenhuma outra biblioteca de ícones.

Mapa rápido de token para uso:

| Precisa de… | Use | Não use |
| ----------- | --- | ------- |
| Fundo da página | `--color-background` | `#F5F5F5`, `bg-gray-100` |
| Card / campo | `--color-surface` + `--radius-lg` / `--radius-md` | `bg-white rounded-[10px]` |
| Botão principal | componente `button-primary` (`--color-primary-strong`, texto `--color-on-primary`) | `--color-primary` como fundo de texto |
| Texto secundário | `--color-on-surface-variant` | cinzas inventados, opacidade no texto |
| Espaço | `--spacing-*` (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80) | 10 px, 15 px, 18 px |
| Sombra | `--shadow-sm` … `--shadow-xl` | sombras coloridas ou mais fortes |
| Valor em dinheiro | `.type-numeric-md` + `Intl.NumberFormat('pt-BR', { style: 'currency', currency })` | `toFixed(2)`, `"R$" + valor` |
| Botão ou busca da tela de descoberta | `button-pill`, `search-bar` (`--radius-full`) | `rounded-3xl`, raios inventados |
| Texto sobre foto | véu `--color-photo-scrim` em gradiente + texto `--color-on-tertiary` | texto branco direto na foto, sombra de texto |
| Título do hero | `.type-display-hero` + `<em>` com `.hero-title-accent` | serifa em qualquer outro texto |

## 4. Regras obrigatórias

**Design**

- Nada de valores soltos: toda cor, raio, espaço, fonte e sombra vem de um token. Se faltar um token, pare e proponha a mudança no `DESIGN.md`.
- Uma única ação principal (`button-primary`) por tela ou card.
- Contraste mínimo WCAG AA (4,5:1 para texto). Na prática: texto branco só sobre `primary-strong` ou `tertiary`; nunca texto sobre `primary` ou `secondary`.
- Estados sempre com ícone e texto, além da cor. Status da viagem: Planejando (`badge-planning`), Confirmada (`badge-confirmed`), Concluída (`badge-completed`).

**Conteúdo**

- Toda a interface em português do Brasil, tom amigável e direto ("Adicionar despesa", não "Submit"). Datas e valores com `Intl` em `pt-BR`.
- Estados vazios com ícone, uma frase e a ação ("Nenhuma despesa ainda. Registre a primeira!").
- Mensagens de erro dizem o que aconteceu e o que fazer. Mapeie as respostas da API: `401` → voltar ao login; `403` → "Você não tem permissão para…"; `404` → "Viagem não encontrada"; `409` → explique o conflito; `422` → mostre cada mensagem no campo certo; `429` → "Muitas tentativas, tente de novo em N segundos" (`Retry-After`).

**Comportamento**

- Respeite as permissões da viagem: OWNER gerencia membros; OWNER e EDITOR editam roteiro, orçamento e despesas; VIEWER vê tudo em modo leitura, **sem** botões de edição (não basta desabilitar).
- Login só com Google ("Entrar com Google"); não crie telas de senha ou cadastro.

**Acessibilidade e responsividade**

- HTML semântico (`header`, `nav`, `main`, `section`, `button`, `a`), um `h1` por página, ordem lógica de títulos.
- Todo campo com `<label>`; todo botão só com ícone com `aria-label`; imagens com `alt`.
- Foco visível em tudo que é interativo (anel em `--color-primary`), navegação completa por teclado.
- Funciona de 360 px a 1440 px sem rolagem horizontal; alvos de toque com 44 px ou mais.

## 5. Fluxo para gerar uma tela

1. Escreva em 3–5 linhas o objetivo da tela, os requisitos e a ação principal.
2. Monte a estrutura com os componentes do `DESIGN.md` (seção *Components*), começando pelo celular.
3. Aplique os tokens; confira os estados da seção 2.
4. Revise contra a checklist abaixo e as *Do's and Don'ts*.
5. Gere uma captura em 1440 px e outra em 390 px e compare com o protótipo e, se houver, com a imagem de referência da tela.

**Checklist de entrega (todas as respostas "sim")**

- [ ] Só tokens do `DESIGN.md` (nenhum hex, px fora da escala ou fonte avulsa no código)?
- [ ] Uma ação principal por tela/card e hierarquia clara de títulos?
- [ ] Contraste AA em todo texto, foco visível e navegação por teclado?
- [ ] Textos em pt-BR, valores e datas com `Intl`?
- [ ] Estados de carregando, vazio, erro e VIEWER implementados?
- [ ] Funciona em 360 px sem rolagem horizontal?
- [ ] Ícones só da Phosphor, no tamanho certo (20 ou 24 px)?

## 6. Alterando o design system

O `DESIGN.md` muda antes do código, nunca o contrário.

1. Edite o `DESIGN.md` (token no YAML e a explicação na seção correspondente).
2. Rode `npm run design:check` (lint + regeneração dos tokens). O lint precisa terminar com **0 erros e 0 avisos**; aviso de `contrast-ratio` bloqueia a mudança.
3. Atualize o protótipo se a mudança afetar algo que ele mostra.
4. Faça o commit do `DESIGN.md` e dos `tokens/` juntos, com a justificativa na mensagem.

## 7. Modelo de pedido para o agente

```text
Leia AGENTS.md e DESIGN.md. Gere a tela "<nome>" do ViajaJunto em Next.js + Tailwind,
usando apenas os tokens do DESIGN.md e os componentes já existentes no protótipo.
Requisitos: <FRxx, BRxx>. Ação principal: <ação>. Endpoints: <GET /api/...>.
Inclua os estados de carregando, vazio, erro e somente leitura (VIEWER), versão celular,
e termine com a checklist da seção 5 do AGENTS.md preenchida.
```

## 8. Estrutura desta pasta

```text
.
├── AGENTS.md              # este arquivo: como os agentes aplicam o DESIGN.md
├── DESIGN.md              # design system (tokens + diretrizes)
├── screens/
│   └── painel.md          # especificação do painel inicial
├── references/
│   └── painel-referencia.jpg  # referência visual das telas de descoberta
├── package.json           # scripts design:lint, design:tokens, design:check
├── scripts/build-tokens.mjs
├── tokens/
│   ├── tokens.css         # Tailwind v4 (@theme)
│   ├── tokens.root.css    # CSS puro (:root) + sombras
│   └── tokens.json        # DTCG (Figma, Style Dictionary)
└── prototype/
    ├── index.html         # painel "Minhas viagens" + detalhe da viagem
    └── screenshots/       # capturas desktop e celular
```
