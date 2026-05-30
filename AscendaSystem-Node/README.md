# Ascenda Backend

Backend Node.js separado dos frontends.

## Stack

- Node.js 20+
- Express
- Supabase PostgreSQL/Auth/Storage
- OpenAI Responses API para gerar atividades

## Setup

1. Copie `.env.example` para `.env`.
2. Para desenvolvimento sem Supabase, mantenha `DATA_PROVIDER=mock`.
3. Quando o Supabase estiver pronto, troque para `DATA_PROVIDER=supabase` e preencha as chaves.
4. No Supabase SQL Editor, rode `database/supabase_schema.sql`.
5. Instale dependencias:

```bash
npm install
```

6. Rode o backend:

```bash
npm run dev
```

API local:

```txt
http://localhost:4000/api
```

## Endpoints iniciais

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register-mentor`
- `POST /api/auth/register-intern`
- `GET /api/auth/session`
- `GET /api/me`
- `GET /api/mentors/public`
- `GET /api/mentors`
- `GET /api/interns`
- `PATCH /api/interns/:id/mentor`
- `PATCH /api/interns/:id/substitute-mentor`
- `GET /api/entities/:entity`
- `POST /api/entities/:entity`
- `PATCH /api/entities/:entity/:id`
- `DELETE /api/entities/:entity/:id`
- `POST /api/ai/generate-activities`

As rotas protegidas usam a sessao enviada em cookie HttpOnly:

```txt
Cookie: ascenda_session=<token>
```

O frontend deve chamar a API com `credentials: "include"`. O token de sessao nao e exposto para JavaScript e nao deve ser salvo em `localStorage`.

## Camadas de seguranca ja preparadas

- CORS por allowlist usando `CORS_ORIGIN`.
- Headers defensivos basicos (`nosniff`, `DENY`, `no-referrer`, `Permissions-Policy`).
- Rate limit em `/api/auth` e `/api/ai`.
- Validacao de payload antes de criar usuarios ou alterar vinculos.
- `service_role` isolada no backend.
- `DATA_PROVIDER=mock` para desenvolver sem chaves reais.
- Auditoria `npm run audit:hardcode` para bloquear credenciais, personas demo e armazenamento local sensivel antes do build.

## Observacao

As rotas genericas de `entities` existem para acelerar a migracao das telas atuais.
Depois que o fluxo principal estabilizar, a melhor evolucao e criar rotas especificas
para tarefas, cursos, atividades, ferias e chat.
