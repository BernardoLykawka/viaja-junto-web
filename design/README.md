# ViajaJunto — T3: ambiente de design para agentes de IA

Ambiente que orienta agentes de IA a gerar a interface web do ViajaJunto de forma consistente.

| Entregável | Arquivo |
| ---------- | ------- |
| Design system (cores, fontes, estilo) | [`DESIGN.md`](DESIGN.md), no formato [google-labs-code/design.md](https://github.com/google-labs-code/design.md) |
| Diretrizes para o agente | seções em prosa do `DESIGN.md` (Overview → Do's and Don'ts) |
| Como o agente aplica o `DESIGN.md` | [`AGENTS.md`](AGENTS.md) |
| Instruções do painel inspirado na referência | [`screens/painel.md`](screens/painel.md) + [`references/painel-referencia.jpg`](references/painel-referencia.jpg) |
| Protótipo em HTML usando o design system | [`prototype/index.html`](prototype/index.html) + [`prototype/screenshots/`](prototype/screenshots) |

## Design system em resumo

- **Cores:** a paleta da identidade visual do projeto: Floresta `#344E41`, Pinheiro `#3A5A40`, Folha `#588157`, Sálvia `#A3B18A`, Areia `#DAD7CD`, mais Linho `#E8E3DC`, branco, tinta `#1F1F1F` e as cores de estado (`#D9EAD8`, `#F1E2C7`, `#EACACA`, `#D9E7F4`).
- **Fontes:** DM Serif Display (título do hero, com itálico), Plus Jakarta Sans (títulos) e Inter (texto, rótulos e números com algarismos tabulares).
- **Estilo:** editorial de turismo (fotos em recorte orgânico, títulos em serifa, pílulas, cards flutuantes), acolhedor e natural; escala de espaçamento e raios em múltiplos de 4; ícones Phosphor; WCAG AA.

## Como usar

Requer Node.js 20 ou mais novo.

```bash
npm install
npm run design:lint     # valida o DESIGN.md (precisa dar 0 erros e 0 avisos)
npm run design:tokens   # gera tokens/tokens.css, tokens.root.css e tokens.json
npm run design:check    # os dois acima
```

Para ver o protótipo, abra `prototype/index.html` no navegador (funciona offline: fontes e ícones estão em `prototype/assets/`). Ele tem duas telas navegáveis:

- **Painel** (FR06, FR25): hero com foto, busca em pílula, próxima viagem, números, carrosséis de viagens e de destinos mais bem avaliados — segue `screens/painel.md`.
- **Detalhe da viagem**: abas Roteiro, Orçamento, Despesas e Membros. Abra "Eurotrip 2027" (você é dono), "Buenos Aires e Mendoza" (modo somente leitura de visualizador) e "Chapada Diamantina" (estados vazios).

Para gerar uma tela nova com um agente, use o modelo de pedido da seção 7 do `AGENTS.md`.

## Créditos

Fontes DM Serif Display, Plus Jakarta Sans e Inter (SIL Open Font License, via Fontsource) e Phosphor Icons (MIT); as licenças estão em `prototype/assets/`.
