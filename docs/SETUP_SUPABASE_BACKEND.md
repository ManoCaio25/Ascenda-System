# Setup Supabase + Backend Ascenda

Este guia acompanha os arquivos:

- `AscendaSystem-Node/database/supabase_schema.sql`
- `AscendaSystem-Node/`

## 1. Criar projeto Supabase

1. Crie uma conta no Supabase.
2. Crie um novo projeto.
3. Guarde a senha do banco em um local seguro.
4. Abra `Project Settings > API`.
5. Copie:
   - Project URL
   - anon public key
   - service_role key

Importante: a `service_role key` nunca deve ir para frontend.

## 2. Rodar SQL

1. Abra `SQL Editor`.
2. Cole todo o conteudo de `AscendaSystem-Node/database/supabase_schema.sql`.
3. Execute.

O SQL cria:

- tabelas principais do Ascenda;
- tipos/enums;
- indices;
- triggers de `updated_at`;
- Row Level Security;
- policies;
- bucket privado `course-files`;
- seeds basicos de forum e loja.

O perfil do intern possui `mentor_id` e `substitute_mentor_id`. O mentor substituto tambem tem acesso ao intern pelas policies de RLS.

Usuarios iniciais:

O repositório não versiona mais usuários ou senhas demo. Crie os usuários reais pelo Supabase Auth ou pelo fluxo de cadastro da aplicação. O arquivo `AscendaSystem-Node/database/seed_ascenda_users.sql` agora é apenas uma nota segura com o comando para promover o primeiro mentor.

## 3. Configurar Auth

Em `Authentication > Providers`:

1. Habilite Email/Password para desenvolvimento.
2. Depois podemos habilitar Google OAuth.

Em `Authentication > URL Configuration`, adicione os redirects locais:

```txt
http://localhost:5173
http://localhost:5174
http://localhost:5175
```

Depois de criar sua primeira conta, rode no SQL Editor para tornar esse usuario padrinho:

```sql
update public.profiles
set role = 'mentor'
where email = 'seu-email@exemplo.com';
```

## 4. Configurar backend

Entre na pasta:

```bash
cd AscendaSystem-Node
```

Crie `.env` a partir de `.env.example`:

```bash
copy .env.example .env
```

Preencha:

```txt
DATA_PROVIDER=mock
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
YOUTUBE_API_KEY=
```

Enquanto o Supabase nao estiver pronto, mantenha `DATA_PROVIDER=mock`. Quando terminar o setup do Supabase, altere para:

```txt
DATA_PROVIDER=supabase
```

Instale e rode:

```bash
npm install
npm run dev
```

Teste:

```txt
GET http://localhost:4000/api/health
```

## 5. Variaveis futuras do frontend

Os frontends usam um unico arquivo em `AscendaSystem-React/.env`:

```txt
VITE_API_URL=http://localhost:4000/api
VITE_ALLOW_LOCAL_AUTH_FALLBACK=false
VITE_ALLOW_LOCAL_DATA_FALLBACK=false
```

## 6. Fluxo esperado da IA

1. Mentor informa tema, texto, documento ou link.
2. Para o fluxo simples, o frontend chama `POST /api/ai/generate-activities`.
3. Para o fluxo completo do padrinho, o frontend chama `POST /api/ai/generate-learning-package`.
4. Backend extrai o pacote estruturado com desafios, perguntas e videoaulas recomendadas.
5. Se `persist=false`, o backend devolve uma pre-visualizacao para revisao.
6. Se `persist=true`, o backend cria `learning_paths`, `contents`, `activities` e `activity_questions` para aparecer no portal do estagiario.
7. Quando `YOUTUBE_API_KEY` estiver configurada, as videoaulas recebem links reais do YouTube; sem ela, recebem links de busca.

## 7. Ordem de trabalho sugerida

1. Confirmar SQL rodando no Supabase.
2. Rodar backend local.
3. Implementar login real no frontend.
4. Manter entidades e autenticacao via chamadas HTTP; `localStorage` fica restrito a preferencias visuais.
5. Migrar tela por tela: usuarios, estagiarios, cursos, atividades, chat.
6. Ligar gerador de IA na tela do padrinho.

## 8. Links oficiais

- Supabase Docs: https://supabase.com/docs
- Supabase Pricing: https://supabase.com/pricing
- OpenAI Responses API: https://platform.openai.com/docs/api-reference/responses
- OpenAI Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
