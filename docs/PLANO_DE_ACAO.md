# Plano de acao Ascenda

Este documento e o roteiro de trabalho para transformar a simulacao atual em um sistema com backend, banco real e IA.

## Decisao tecnica principal

- Backend: Node.js com Express, em uma pasta separada chamada `AscendaSystem-Node`.
- Banco gratuito: Supabase, usando PostgreSQL, Auth, Row Level Security e Storage.
- IA: OpenAI chamada somente pelo backend. A chave da OpenAI nunca deve ir para o frontend.

## Estrutura de pastas

```txt
Ascenda-System/
  AscendaSystem-React/
    Padrinho/
    Estagiario/
    Login/
    LoadingPage/

  AscendaSystem-Node/
    src/
    package.json
    .env.example
    database/

  docs/
```

## O que ja foi criado

- `AscendaSystem-Node/database/supabase_schema.sql`: schema completo para rodar no SQL Editor do Supabase.
- `AscendaSystem-Node/`: API Node/Express inicial.
- `AscendaSystem-Node/.env.example`: variaveis necessarias para rodar o backend.
- `AscendaSystem-Node/README.md`: instrucoes do backend.
- `docs/SETUP_SUPABASE_BACKEND.md`: passo a passo de configuracao do Supabase e backend.
- `.env.example` nos dois frontends: variaveis futuras para API e Supabase.

## O que voce precisa criar no Supabase

1. Crie um projeto no Supabase.
2. Abra `SQL Editor`.
3. Cole e rode todo o arquivo `AscendaSystem-Node/database/supabase_schema.sql`.
4. Va em `Project Settings > API` e pegue:
   - `Project URL`
   - `anon public key`
   - `service_role key`
5. A `service_role key` deve ficar somente no `AscendaSystem-Node/.env`. Nunca coloque essa chave em arquivo do frontend.

## Variaveis do backend

Crie `AscendaSystem-Node/.env` a partir de `AscendaSystem-Node/.env.example`.

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

OPENAI_API_KEY=sua_openai_key
OPENAI_MODEL=gpt-4.1-mini
```

## Ordem de implementacao

1. Validar Supabase
   - Rodar o SQL.
   - Criar um usuario mentor.
   - Confirmar se a tabela `profiles` foi preenchida automaticamente.
   - Se o primeiro usuario nascer como `intern`, promover com:

```sql
update public.profiles
set role = 'mentor'
where email = 'seu-email@exemplo.com';
```

2. Subir backend local
   - Instalar dependencias dentro de `AscendaSystem-Node`.
   - Rodar `npm run dev`.
   - Testar `GET /api/health`.

3. Migrar autenticacao
   - Remover login fake do `AscendaSystem-React/Login`.
   - Usar Supabase Auth.
   - Redirecionar usuario por role: `mentor` para Padrinho, `intern` para Estagiario.

4. Migrar dados do Padrinho
   - Trocar `localStorage` e stores fake por chamadas ao backend.
   - Prioridade: interns, courses, course_assignments, tasks, chat_messages, vacation_requests.

5. Migrar dados do Estagiario
   - Ler somente dados autorizados pelo RLS.
   - Prioridade: perfil, atividades, tarefas, cursos, forum e feedback.

6. Ativar IA
   - O padrinho envia tema, texto, documento ou link para o backend.
   - Backend chama OpenAI.
   - Backend salva o job em `ai_generation_jobs`.
   - Depois salvamos as atividades geradas em `activities`, `activity_questions` e, quando aplicavel, `tasks`.

## Fluxo da IA

Entrada do padrinho:

- Titulo ou tema.
- Texto/documentacao.
- Link de apoio, quando existir.
- Quantidade de atividades.
- Quantidade de perguntas.
- Estagiario alvo, opcional.

Saida esperada:

- Resumo do conteudo.
- Lista de atividades praticas.
- Objetivos de aprendizado.
- Perguntas abertas, checklist ou multipla escolha.
- Rubrica/correcao para o padrinho revisar.

Regra importante: a IA deve gerar sugestoes. O padrinho revisa e publica.

## Polimento inicial feito no frontend

- Chat do Padrinho ficou mais robusto contra falhas de carregamento/envio.
- Avatar do chat agora aceita URL de imagem, emoji ou iniciais.
- `eventBus` agora retorna uma funcao de unsubscribe.
- Sidebar agora acusa erro se for usada fora do provider correto.
- Notas de curso em `ActiveAssignments` agora renderizam o texto real.
- `index.html` dos dois frontends agora apontam para `/src/main.jsx`, como esperado pelo Vite em desenvolvimento.
- `ActivityGenerator` agora possui os helpers de leitura de arquivo que faltavam e usa texto extraido de arquivos simples no planejamento local.

## Proximos arquivos que precisam de migracao

- `AscendaSystem-React/Padrinho/src/entities/store.js`
- `AscendaSystem-React/Estagiario/src/Entities/store.js`
- `AscendaSystem-React/Login/index.html`
- `AscendaSystem-React/LoadingPage/script.js`
- `AscendaSystem-React/Padrinho/src/pages/AscendaIA/services/ascendaIAClient.js`
- `AscendaSystem-React/Padrinho/src/pages/ActivityGenerator.jsx`

## Criterio de pronto da primeira fase

- Usuario consegue criar conta/login real.
- Mentor consegue cadastrar estagiario.
- Mentor consegue criar curso.
- Mentor consegue atribuir curso para estagiario.
- Estagiario enxerga somente seus dados.
- Chat e ferias usam banco real.
- IA gera sugestoes e salva historico no Supabase.
