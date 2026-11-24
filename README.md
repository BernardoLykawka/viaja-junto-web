# ViajaJunto — frontend

React 19 + Vite + TypeScript + Tailwind CSS v4. Consome a API Spring Boot do ViajaJunto (repositório separado, `ws-viaja-junto`).

## Rodar

```bash
cd frontend
npm install
cp .env.example .env.local   # preencha VITE_FIREBASE_*
npm run dev                  # http://localhost:5173
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

## Estado atual

| Tela | Situação |
| --- | --- |
| Login (Google) | pronto |
| Painel "Minhas viagens" | pronto, sem sino de notificações (a API não tem essa rota) |
| Detalhe da viagem: Roteiro, Orçamento, Membros | prontos, com modo somente leitura para VIEWER |
| Detalhe da viagem: Despesas | aviso "em breve" (a API ainda não tem `/expenses`, `/balances`, `/settlements`) |
| Descobrir, Perfil | básicos |
| Entrar com código de convite | pendente: `POST /trips/{id}/members/join` exige o ID da viagem |
