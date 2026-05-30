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
    MentorPortal/
    InternPortal/
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
- `AscendaSystem-Node/database/seed_ascenda_users.sql`: nota segura para promover o primeiro mentor, sem usuarios ou senhas versionados.
- `AscendaSystem-Node/`: API Node/Express inicial.
- `AscendaSystem-Node/.env.example`: variaveis necessarias para rodar o backend.
- `AscendaSystem-Node/README.md`: instrucoes do backend.
- `docs/SETUP_SUPABASE_BACKEND.md`: passo a passo de configuracao do Supabase e backend.
- `docs/ESTRUTURA_DE_PASTAS.md`: mapa de pastas e regra de onde modificar cada coisa.
- `docs/DEPLOY.md`: checklist e variaveis para publicar em dominio real.
- `AscendaSystem-React/.env.example`: variaveis compartilhadas dos frontends.
- `AscendaSystem-React/Login`: Access Hub em React para login/cadastro via API.
- `AscendaSystem-React/LoadingPage`: Launch Bridge em React para transicao entre portais.
- Backend agora suporta `DATA_PROVIDER=mock`, permitindo desenvolver sem Supabase pronto.
- Backend ja possui rotas especificas de auth, mentors, interns e IA em modo mock-ready.
- Frontends ja possuem camada `services/` para falar com API sem acoplar tela diretamente ao backend.

## Passo a passo completo para criar no Supabase

Use este roteiro com o Dashboard do Supabase aberto. A ideia e criar o projeto uma vez, rodar o SQL completo e depois conectar backend/frontend sem recriar tabelas manualmente.

### 1. Criar o projeto

1. Entre em `https://supabase.com/dashboard`.
2. Clique em `New project`.
3. Escolha ou crie uma organizacao.
4. Use um nome claro, por exemplo `ascenda-system`.
5. Crie uma senha forte para o banco e guarde em local seguro. Essa senha nao e a mesma senha do login dos usuarios.
6. Escolha uma regiao proxima dos usuarios principais. Para desenvolvimento, qualquer regiao estavel serve; para producao no Brasil, escolha a mais proxima disponivel no momento.
7. Clique em `Create new project` e espere o projeto terminar de provisionar.

Checklist desta etapa:

- Projeto criado.
- Senha do banco guardada.
- Dashboard do projeto acessivel.

### 2. Rodar o schema do Ascenda

1. No menu lateral do Supabase, abra `SQL Editor`.
2. Clique em `New query`.
3. Abra localmente o arquivo `AscendaSystem-Node/database/supabase_schema.sql`.
4. Copie todo o conteudo do arquivo.
5. Cole no `SQL Editor`.
6. Clique em `Run`.
7. Aguarde a execucao terminar sem erro.

O SQL cria:

- extensao `pgcrypto`;
- enums do dominio Ascenda;
- tabelas principais (`profiles`, `intern_profiles`, `courses`, `course_assignments`, `activities`, `tasks`, `chat_messages`, `notifications`, `ai_generation_jobs` e outras);
- indices;
- funcoes e triggers, incluindo criacao automatica de perfil quando um usuario nasce no Supabase Auth;
- Row Level Security;
- policies de acesso;
- bucket privado `course-files`;
- seeds basicos para forum e loja.

Se der erro:

1. Nao crie tabelas manualmente pelo `Table Editor`.
2. Copie a mensagem completa do erro.
3. Veja em qual linha ele parou.
4. Se o erro for de objeto ja existente, pode ser que parte do SQL ja tenha rodado. Nesse caso, me envie o erro antes de apagar algo.

Checklist desta etapa:

- SQL executado.
- Tabelas aparecem em `Table Editor`.
- Bucket `course-files` aparece em `Storage`.

### 3. Conferir as tabelas principais

Abra `Table Editor` e confirme se existem pelo menos:

- `profiles`
- `intern_profiles`
- `courses`
- `course_assignments`
- `activities`
- `tasks`
- `chat_messages`
- `notifications`
- `ai_generation_jobs`

Depois rode esta query no `SQL Editor`:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

As tabelas publicas do sistema devem aparecer com `rowsecurity = true`.

### 4. Configurar Auth por email/senha

1. No menu lateral, abra `Authentication`.
2. Entre em `Providers`.
3. Habilite `Email`.
4. Para desenvolvimento local, voce pode desabilitar temporariamente confirmacao obrigatoria de email para acelerar testes.
5. Para producao, vamos reativar confirmacao de email, configurar templates e usar dominio real.

Configuracao recomendada para desenvolvimento:

- Email provider: habilitado.
- Signup: habilitado.
- Confirm email: opcional em desenvolvimento; recomendado em producao.

### 5. Configurar URLs de redirecionamento

Em `Authentication > URL Configuration`, configure:

```txt
Site URL:
http://localhost:5173/AscendaSystem-React/Login/
```

Adicione tambem em `Redirect URLs`:

```txt
http://localhost:5173/**
http://localhost:5174/**
http://localhost:5175/**
http://localhost:5176/**
http://127.0.0.1:5173/**
http://127.0.0.1:5174/**
http://127.0.0.1:5175/**
http://127.0.0.1:5176/**
```

Essas URLs cobrem os apps locais:

- `5173`: Login / Access Hub.
- `5174`: LoadingPage / Launch Bridge.
- `5175`: MentorPortal.
- `5176`: InternPortal.

Quando publicarmos em producao, vamos adicionar a URL real do dominio, por exemplo:

```txt
https://app.seudominio.com/**
```

### 6. Criar o primeiro usuario mentor

O primeiro usuario deve ser criado no Supabase Auth. O trigger do schema cria automaticamente uma linha em `public.profiles`.

O repositorio nao versiona usuarios ou senhas iniciais. Crie o primeiro usuario no Supabase Auth e promova esse perfil para mentor/admin com um SQL privado ou pelo Dashboard.

Opcao manual pelo Dashboard:

1. Abra `Authentication > Users`.
2. Clique em `Add user`.
3. Informe email e senha.
4. Marque `Auto Confirm User`, se estiver testando localmente.
5. Salve.

Depois rode no `SQL Editor`, trocando o email:

```sql
update public.profiles
set
  role = 'mentor',
  full_name = 'Seu Nome'
where email = 'seu-email@exemplo.com';
```

Confirme:

```sql
select id, email, full_name, role
from public.profiles
where email = 'seu-email@exemplo.com';
```

Se nao aparecer registro em `profiles`, o usuario pode ter sido criado antes do trigger. Nesse caso, use:

```sql
insert into public.profiles (id, email, full_name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', email),
  'mentor'::public.app_role
from auth.users
where email = 'seu-email@exemplo.com'
on conflict (id) do update
set
  full_name = excluded.full_name,
  role = excluded.role;
```

### 7. Criar mentor substituto

Crie outro usuario em `Authentication > Users` e promova para mentor:

```sql
update public.profiles
set
  role = 'mentor',
  full_name = 'Nome do Mentor Substituto'
where email = 'substituto@exemplo.com';
```

Confirme:

```sql
select id, email, full_name, role
from public.profiles
where email in ('seu-email@exemplo.com', 'substituto@exemplo.com');
```

### 8. Criar usuario intern e vincular ao mentor

Crie o usuario intern em `Authentication > Users`. Depois garanta o papel `intern`:

```sql
update public.profiles
set
  role = 'intern',
  full_name = 'Nome do Intern'
where email = 'intern@exemplo.com';
```

Agora crie o perfil operacional em `intern_profiles`, vinculando ao mentor principal e ao mentor substituto:

```sql
insert into public.intern_profiles (
  user_id,
  mentor_id,
  substitute_mentor_id,
  created_by,
  full_name,
  email,
  track,
  cohort,
  start_date
)
select
  intern.id,
  mentor.id,
  substitute.id,
  mentor.id,
  'Nome do Intern',
  'intern@exemplo.com',
  'Trilha inicial',
  'Turma 2026.1',
  current_date
from public.profiles intern
join public.profiles mentor
  on mentor.email = 'seu-email@exemplo.com'
left join public.profiles substitute
  on substitute.email = 'substituto@exemplo.com'
where intern.email = 'intern@exemplo.com'
on conflict (user_id) do update
set
  mentor_id = excluded.mentor_id,
  substitute_mentor_id = excluded.substitute_mentor_id,
  created_by = excluded.created_by,
  full_name = excluded.full_name,
  email = excluded.email,
  track = excluded.track,
  cohort = excluded.cohort,
  start_date = excluded.start_date;
```

Se ainda nao existir mentor substituto, use `null`:

```sql
update public.intern_profiles
set substitute_mentor_id = null
where email = 'intern@exemplo.com';
```

Para trocar ou designar substituto depois:

```sql
update public.intern_profiles intern
set substitute_mentor_id = substitute.id
from public.profiles substitute
where intern.email = 'intern@exemplo.com'
  and substitute.email = 'substituto@exemplo.com'
  and substitute.role in ('mentor', 'admin');
```

Regra esperada:

- O mentor principal ve o intern no board.
- O mentor substituto tambem ve o intern no board.
- O intern ve o mentor principal e o substituto em sua propria tela.

### 9. Validar vinculos de mentor, substituto e intern

Rode:

```sql
select
  intern.full_name as intern_name,
  intern.email as intern_email,
  mentor.full_name as mentor_name,
  mentor.email as mentor_email,
  substitute.full_name as substitute_name,
  substitute.email as substitute_email
from public.intern_profiles intern
left join public.profiles mentor
  on mentor.id = intern.mentor_id
left join public.profiles substitute
  on substitute.id = intern.substitute_mentor_id
order by intern.created_at desc;
```

Rode tambem:

```sql
select email, full_name, role, created_at
from public.profiles
order by created_at desc;
```

### 10. Pegar chaves do projeto

Abra `Project Settings > API`.

Copie:

- `Project URL`
- chave publica do projeto (`anon public key` ou `publishable key`, dependendo da tela do Supabase)
- chave secreta para backend (`service_role key` ou `secret key`, dependendo da tela do Supabase)

Uso correto:

- Chave publica: pode ir no frontend quando ligarmos Supabase Auth direto no React.
- Chave secreta/service role: somente no backend, em `AscendaSystem-Node/.env`.
- Nunca cole chave secreta em React, GitHub, print publico, issue ou documentacao versionada.

### 11. Configurar `.env` do backend

Crie `AscendaSystem-Node/.env` a partir de `AscendaSystem-Node/.env.example`.

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176
DATA_PROVIDER=mock
JSON_BODY_LIMIT=2mb
AUTH_TOKEN_TTL_HOURS=12
EXPOSE_ERROR_DETAILS=true
ALLOW_PUBLIC_MENTOR_SIGNUP=true
ALLOW_PUBLIC_INTERN_SIGNUP=true

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta_de_backend

OPENAI_API_KEY=sua_openai_key
OPENAI_MODEL=gpt-4.1-mini
```

Depois rode:

```bash
cd AscendaSystem-Node
npm install
npm run dev
```

Teste:

```txt
GET http://localhost:4000/api/health
```

Resposta esperada:

```json
{
  "ok": true
}
```

### 12. Variaveis futuras do frontend

Os apps React usam um unico arquivo em `AscendaSystem-React/.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_ALLOW_LOCAL_AUTH_FALLBACK=false
VITE_ALLOW_LOCAL_DATA_FALLBACK=false
```

Regra:

- Variavel com prefixo `VITE_` fica disponivel no navegador.
- Chaves privadas ficam somente em `AscendaSystem-Node/.env`.
- `SUPABASE_SERVICE_ROLE_KEY` nunca pode ter prefixo `VITE_`.

### 13. Validar Storage

Abra `Storage` e confira o bucket `course-files`.

Tambem pode validar por SQL:

```sql
select id, name, public
from storage.buckets
where id = 'course-files';
```

Resultado esperado:

- `id = course-files`
- `public = false`

O bucket deve continuar privado. O backend vai controlar upload/download quando ligarmos arquivos reais.

### 14. Validar seguranca de acesso

O schema usa RLS para proteger os dados:

- Intern acessa seus proprios dados.
- Mentor acessa dados dos interns vinculados a ele.
- Mentor substituto acessa dados dos interns onde ele foi definido como substituto.
- Admin acessa tudo.
- Backend com chave secreta pode executar operacoes administrativas.

Teste funcional esperado quando ligarmos o frontend real:

1. Logar como mentor principal.
2. Ver o intern vinculado no board.
3. Logar como mentor substituto.
4. Ver o mesmo intern no board.
5. Logar como intern.
6. Ver mentor principal e mentor substituto na tela do intern.

### 15. Erros comuns

`relation already exists`

- Alguma parte do SQL ja rodou. Nao apague tabelas sem revisar. Me envie a mensagem para ajustarmos com seguranca.

`permission denied for schema auth`

- Rode pelo `SQL Editor` do projeto Supabase, nao por uma conexao limitada.

`profiles` vazio depois de criar usuario

- O usuario pode ter sido criado antes do trigger. Use o `insert into public.profiles ... select from auth.users` da etapa 6.

`Invalid API key` ou `JWT malformed`

- Chave errada no `.env`, espaco extra, aspas indevidas ou backend nao reiniciado depois da alteracao.

Erro de CORS no navegador

- Confirme `CORS_ORIGIN` no backend e reinicie `npm run dev`.

Login nao redireciona

- Confira `Authentication > URL Configuration` e adicione as URLs locais com `localhost` e `127.0.0.1`.

### 16. Checklist final do Supabase

- Projeto Supabase criado.
- SQL do arquivo `supabase_schema.sql` executado.
- Tabelas aparecem no `Table Editor`.
- RLS aparece ativo nas tabelas publicas.
- Bucket `course-files` existe e esta privado.
- Email Auth habilitado.
- URLs locais cadastradas no Auth.
- Primeiro mentor criado e promovido em `profiles`.
- Intern de teste criado em `auth.users`.
- Intern vinculado em `intern_profiles` ao mentor principal.
- Mentor substituto definido ou campo deixado como `null`.
- `Project URL`, chave publica e chave secreta copiadas.
- `.env` do backend preenchido.
- Backend responde `GET /api/health`.

Referencias oficiais uteis:

- Supabase Docs: `https://supabase.com/docs`
- SQL Editor: `https://supabase.com/features/sql-editor`
- Auth redirects: `https://supabase.com/docs/guides/auth/redirect-urls`
- API keys: `https://supabase.com/docs/guides/getting-started/api-keys`
- Row Level Security: `https://supabase.com/docs/guides/database/postgres/row-level-security`

## Resumo das variaveis do backend

Crie `AscendaSystem-Node/.env` a partir de `AscendaSystem-Node/.env.example`.

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta_de_backend

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
   - Enquanto Supabase nao estiver pronto, manter `DATA_PROVIDER=mock`.
   - Rodar `npm run dev`.
   - Testar `GET /api/health`.

3. Migrar autenticacao
   - O `Login` ja possui camada de servico para chamar `VITE_API_URL`.
   - `VITE_API_URL` e obrigatorio para login/cadastro.
   - Quando Supabase estiver pronto, o backend troca `DATA_PROVIDER=mock` para `DATA_PROVIDER=supabase`.
   - Redirecionar usuario por role: `mentor` para MentorPortal, `intern` para InternPortal.
   - Manter o vinculo `mentor_id` e `substitute_mentor_id` no perfil do intern.

4. Migrar dados do MentorPortal
   - Manter dados de negocio em chamadas ao backend; fallback local deve ser apenas em memoria.
   - Prioridade: interns, courses, course_assignments, tasks, chat_messages, vacation_requests.

5. Migrar dados do InternPortal
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
- Intern alvo, opcional.

Saida esperada:

- Resumo do conteudo.
- Lista de atividades praticas.
- Objetivos de aprendizado.
- Perguntas abertas, checklist ou multipla escolha.
- Rubrica/correcao para o padrinho revisar.

Regra importante: a IA deve gerar sugestoes. O padrinho revisa e publica.

## Polimento inicial feito no frontend

- Chat do MentorPortal ficou mais robusto contra falhas de carregamento/envio.
- Avatar do chat agora aceita URL de imagem, emoji ou iniciais.
- `eventBus` agora retorna uma funcao de unsubscribe.
- Sidebar agora acusa erro se for usada fora do provider correto.
- Notas de curso em `ActiveAssignments` agora renderizam o texto real.
- `index.html` dos dois frontends agora apontam para `/src/main.jsx`, como esperado pelo Vite em desenvolvimento.
- `ActivityGenerator` agora possui os helpers de leitura de arquivo que faltavam e usa texto extraido de arquivos simples no planejamento local.
- Padrinho/Estagiario foram renomeados tecnicamente para `MentorPortal` e `InternPortal`.
- Login e LoadingPage foram convertidos para React.
- Cadastro via API agora cria mentors e interns, vinculando intern ao mentor principal e ao mentor substituto.
- Login agora exige `VITE_API_URL` e usa sessao em cookie HttpOnly.
- MentorPortal e InternPortal ja tem clientes de API preparados para usar cookie de sessao com `credentials: "include"`.
- Backend recebeu headers defensivos, rate limit, validacao de payload e modo mock para desenvolvimento sem chaves reais.

## Proximos arquivos que precisam de migracao

- `AscendaSystem-React/MentorPortal/src/entities/store.js`
- `AscendaSystem-React/InternPortal/src/Entities/store.js`
- `AscendaSystem-React/Login/index.html`
- `AscendaSystem-React/LoadingPage/script.js`
- `AscendaSystem-React/MentorPortal/src/pages/AscendaIA/services/ascendaIAClient.js`
- `AscendaSystem-React/MentorPortal/src/pages/ActivityGenerator.jsx`

## Criterio de pronto da primeira fase

- Usuario consegue criar conta/login real.
- Mentor consegue cadastrar estagiario.
- Mentor consegue criar curso.
- Mentor consegue atribuir curso para estagiario.
- Intern enxerga somente seus dados.
- Chat e ferias usam banco real.
- IA gera sugestoes e salva historico no Supabase.

## Preparacao de deploy

- Scripts centralizados foram adicionados na raiz em `package.json`.
- `npm run build` na raiz builda os quatro frontends.
- Os frontends usam bases configuraveis por ambiente:
  - `VITE_LOGIN_BASE`
  - `VITE_LOADING_BASE`
  - `VITE_MENTOR_BASE`
  - `VITE_INTERN_BASE`
- Os redirecionamentos usam caminhos configuraveis:
  - `VITE_LOGIN_PATH`
  - `VITE_LOADING_PATH`
  - `VITE_MENTOR_PATH`
  - `VITE_INTERN_PATH`
- Guia completo: `docs/DEPLOY.md`.
