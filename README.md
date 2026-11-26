# ViajaJunto — frontend

React 19 + Vite + TypeScript + Tailwind CSS v4. Consome a API Spring Boot do ViajaJunto (repositório separado, `ws-viaja-junto`).

## Rodar

```bash
cd frontend
npm install
cp .env.example .env.local   # preencha VITE_FIREBASE_*
npm run dev                  # http://localhost:5173
npm test                     # Vitest (lógica, adaptadores e rotas/login)
```

A API precisa estar no ar (perfil `dev`, porta 8080): o CORS do perfil `dev` já libera `http://localhost:5173`.
Para usar outra URL, defina `VITE_API_URL`.

**Login:** só com Google, via Firebase Authentication (ative o provedor *Google* no console do Firebase e use o mesmo
`projectId` em `FIREBASE_PROJECT_ID` da API). Não há outro jeito de entrar: sem senha, sem token colado.
O login abre um popup do Google (libere pop-ups para localhost se o navegador bloquear).
`localhost` já vem autorizado no Firebase; outro domínio precisa ser adicionado em *Authentication › Configurações ›
Domínios autorizados*.

## Estrutura

```text
design/     UI_Agent copiado: DESIGN.md, AGENTS.md, screens/, tokens/, protótipo (fonte da verdade visual)
src/lib/    api.ts (fetch + erros pt-BR), auth.tsx (Firebase), adapters.ts (JSON da API -> modelos do app), queries.ts
src/components, src/pages
```

- **Tokens:** `design/tokens/*.css` são gerados do `design/DESIGN.md` (`npm run design:check`). Nunca edite à mão.
- **Adapters:** a API ainda devolve JSON em português (issue #39). Toda a tradução fica em `src/lib/adapters.ts`;
  quando os campos forem renomeados no backend, só esse arquivo muda.
- O `design/AGENTS.md` fala em Next.js; neste projeto a stack é Vite (Tailwind v4 e Phosphor seguem iguais;
  as fontes vêm de `@fontsource`).

## Atividades e hospedagem

Cada destino tem atividades: passeios (Cristo Redentor), cultura, gastronomia, transporte e **hospedagem**. Hospedagem
é uma atividade com `tipo = "Hospedagem"`; no roteiro ela aparece separada, como estadia: `dataHorario` é o check-in,
`duracaoMinutos` guarda as noites (noites × 1440) e `custoPrevisto` é o total da estadia. Os tipos seguem os do backend
(`Passeio`, `Cultura`, `Gastronomia`, `Hospedagem`, `Transporte`) e ficam em `src/lib/activityTypes.ts`.

## Regras do frontend

- **Só avalia quem foi:** destino ou atividade só pode ser avaliado por quem tem uma viagem *Concluída* com ele no
  roteiro (`src/lib/travelHistory.ts`). O backend ainda não aplica essa regra.
- **Países visitados** vêm das viagens concluídas. `GET /places/visited-countries` conta também viagens planejadas,
  por isso o painel não usa essa rota.

## Serviços externos (sem chave)

- **Clima:** [Open-Meteo](https://open-meteo.com) (localização da cidade, previsão de até 16 dias e histórico).
  Datas além da previsão mostram o "clima típico": as mesmas datas no ano anterior.
- **Câmbio:** [ExchangeRate-API](https://www.exchangerate-api.com) (`open.er-api.com`, cotação diária a partir do real).
- Só o nome da cidade e as datas saem do navegador. A moeda de cada país vem do pacote `country-to-currency`.

## Estado atual

| Tela | Rotas da API | Situação |
| --- | --- | --- |
| Login (Google) | Firebase | pronto |
| Início (`/`, pela logo, público) | `GET /trips`, `/places/featured`, `/places/visited-countries`, `/trips/{id}/destinations` | pronto, sem sino (a API não tem notificações) |
| Detalhe da viagem | `GET`/`PUT`/`DELETE /trips/{id}` | pronto, com edição de nome, datas, descrição e situação |
| Roteiro | destinos (`GET`/`POST`/`DELETE`), atividades (`GET`/`POST`/`DELETE`), `/activities/catalog` | pronto: por destino, hospedagem (check-in + noites) e atividades por dia |
| Orçamento | `GET`/`PUT /trips/{id}/budget` | pronto |
| Membros | `GET`/`PATCH`/`DELETE /trips/{id}/members` | pronto |
| Convite por link | `POST /trips/{id}/members/join` | pronto: `/convite/{id}?codigo=...` |
| Minhas viagens (`/viagens`) | `GET /trips`, destinos de cada viagem | pronto: lista com filtro por situação, "Nova viagem" e mapa de viagens |
| Descobrir e destino (público) | `GET /places`, `/places/{id}`, `GET`/`POST /places/{id}/reviews`, `/activities/catalog?q={cidade}` | pronto: "O que fazer" e "Onde ficar" |
| Atividade do catálogo (público) | `/activities/catalog/{id}`, `GET`/`POST /places/{id}/activities/{id}/reviews` | pronto, com "Adicionar à viagem" |
| Perfil | `GET`/`PATCH /users/me` | pronto |
| Mapa-múndi (painel) | destinos de todas as viagens | pronto: país de viagem concluída pintado; de viagem futura em tom claro |
| Despesas | — | aviso "em breve" (a API não tem `/expenses`, `/balances`, `/settlements`) |
| Mapa da viagem (aba Mapa) | `GET /trips/{id}/map` | pronto: Leaflet + OpenStreetMap; precisa da chave do Google Places na API |
| Entrar com código | `POST /trips/{id}/members/join` | pronto: aceita o link ou só o código |
