# Ascenda Backend

Backend Node.js separado dos frontends.

## Stack

- Node.js 20+
- Express
- Supabase PostgreSQL/Auth/Storage
- OpenAI Responses API para gerar atividades

## Setup

1. Copie `.env.example` para `.env`.
2. Preencha as chaves do Supabase e da OpenAI.
3. No Supabase SQL Editor, rode `database/supabase_schema.sql`.
4. Instale dependencias:

```bash
npm install
```

5. Rode o backend:

```bash
npm run dev
```

API local:

```txt
http://localhost:4000/api
```

## Endpoints iniciais

- `GET /api/health`
- `GET /api/me`
- `GET /api/entities/:entity`
- `POST /api/entities/:entity`
- `PATCH /api/entities/:entity/:id`
- `DELETE /api/entities/:entity/:id`
- `POST /api/ai/generate-activities`

As rotas protegidas esperam:

```txt
Authorization: Bearer <supabase_access_token>
```

## Observacao

As rotas genericas de `entities` existem para acelerar a migracao das telas atuais.
Depois que o fluxo principal estabilizar, a melhor evolucao e criar rotas especificas
para tarefas, cursos, atividades, ferias e chat.
