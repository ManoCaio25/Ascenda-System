# Deploy com dominio gratuito

Este guia usa uma opcao principal, sem espalhar alternativas: dominio gratuito em `is-a.dev` e hospedagem no Render.

## Dominio escolhido

```txt
https://ascenda-system.is-a.dev      -> frontend React
https://api.ascenda-system.is-a.dev  -> backend Node/Express
```

`ascenda-system.is-a.dev` parecia uma boa opcao na pesquisa, mas a disponibilidade real so e confirmada quando o pull request no repositorio `is-a-dev/register` for aceito.

Referencias oficiais:

- is-a.dev docs: https://docs.is-a.dev/
- Estrutura dos arquivos is-a.dev: https://docs.is-a.dev/domain-structure/
- is-a.dev com Render: https://docs.is-a.dev/guides/render/
- Render Blueprints: https://render.com/docs/blueprint-spec
- Render custom domains: https://render.com/docs/custom-domains
- Render free deploy: https://render.com/docs/free

## O que ja esta preparado no projeto

- `render.yaml` na raiz cria dois servicos no Render:
  - `ascenda-system-api`: backend Node.
  - `ascenda-system-web`: frontend estatico.
- `npm run build` agora gera uma saida unica em `dist/`:
  - `/` para Login.
  - `/loading/` para LoadingPage.
  - `/mentor/` para MentorPortal.
  - `/intern/` para InternPortal.
- `AscendaSystem-React/.env.production.example` ja aponta para `https://api.ascenda-system.is-a.dev/api`.
- `AscendaSystem-Node/.env.production.example` ja limita CORS para `https://ascenda-system.is-a.dev`.
- As chaves sensiveis do Supabase ficam como `sync: false` no `render.yaml`; o Render vai pedir os valores no painel, sem gravar no Git.
- Para a demonstracao, o cadastro publico esta habilitado no `render.yaml`. Antes de uso real, volte `ALLOW_PUBLIC_MENTOR_SIGNUP` e `ALLOW_PUBLIC_INTERN_SIGNUP` para `false`.

## Passo 1 - Subir o projeto para GitHub

1. Crie um repositorio privado ou publico no GitHub.
2. Envie esta pasta `Ascenda-System` para o repositorio.
3. Confira antes do push:

```bash
git status
git check-ignore -v AscendaSystem-Node/.env AscendaSystem-React/.env
```

Os arquivos `.env` precisam continuar ignorados.

## Passo 2 - Criar os servicos no Render

1. Acesse https://dashboard.render.com.
2. Clique em `New > Blueprint`.
3. Conecte o repositorio do Ascenda System.
4. Selecione o arquivo `render.yaml` na raiz.
5. O Render criara:
   - `ascenda-system-api`
   - `ascenda-system-web`
6. Quando o Render pedir variaveis com `sync: false`, preencha:

```txt
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

`OPENAI_API_KEY` e obrigatoria para IA em producao. Sem ela, a rota de IA responde `503`.

## Passo 3 - Validar as URLs temporarias do Render

Depois do primeiro deploy, o Render entregara URLs parecidas com:

```txt
https://ascenda-system-web.onrender.com
https://ascenda-system-api.onrender.com
```

Se o deploy do backend falhar com `Exited with status 1`, confira primeiro as variaveis de ambiente do servico `ascenda-system-api`.

No Render:

1. Abra `ascenda-system-api`.
2. Va em `Environment`.
3. Adicione ou confira exatamente estas variaveis:

```txt
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

`SUPABASE_URL` deve ser a URL base do projeto, sem `/rest/v1`:

```txt
https://seu-projeto.supabase.co
```

Nao cole assim no campo de valor:

```txt
SUPABASE_URL=https://seu-projeto.supabase.co
https://seu-projeto.supabase.co/rest/v1/
seu-projeto.supabase.co
```

No Render o preenchimento correto e:

```txt
Key:   SUPABASE_URL
Value: https://seu-projeto.supabase.co
```

Para as chaves, use `Settings > API Keys` no Supabase:

```txt
Key:   SUPABASE_PUBLISHABLE_KEY
Value: sb_publishable_...

Key:   SUPABASE_SECRET_KEY
Value: sb_secret_...
```

Se aparecer `Invalid API key`, geralmente uma destas coisas aconteceu:

- `SUPABASE_PUBLISHABLE_KEY` recebeu a secret key por engano.
- `SUPABASE_SECRET_KEY` recebeu a publishable key por engano.
- A chave foi copiada truncada, com `...`, aspas, espaco ou quebra de linha.
- Foi copiado o nome da variavel junto no campo de valor, como `SUPABASE_PUBLISHABLE_KEY=...`.
- A key foi regenerada no Supabase e o Render ainda esta usando a antiga.

Durante teste com as URLs temporarias do Render, deixe `CORS_ORIGIN` assim:

```txt
https://ascenda-system.is-a.dev,https://ascenda-system-web.onrender.com
```

Enquanto o dominio `is-a.dev` ainda nao estiver aprovado, no servico `ascenda-system-web` configure temporariamente:

```txt
VITE_API_URL=https://api.ascenda-system.is-a.dev/api
```

Depois que `api.ascenda-system.is-a.dev` estiver funcionando, volte para:

```txt
VITE_API_URL=https://api.ascenda-system.is-a.dev/api
```

Teste:

```txt
https://ascenda-system-api.onrender.com/api/health
```

Tambem abra:

```txt
https://ascenda-system-web.onrender.com
https://ascenda-system-web.onrender.com/loading/
https://ascenda-system-web.onrender.com/mentor/
https://ascenda-system-web.onrender.com/intern/
```

## Passo 4 - Registrar o dominio gratuito no is-a.dev

1. Acesse https://github.com/is-a-dev/register.
2. Faca um fork do repositorio.
3. No fork, crie dois arquivos dentro da pasta `domains/`.

Arquivo `domains/ascenda-system.json`:

```json
{
  "owner": {
    "username": "SEU_USUARIO_GITHUB",
    "email": "SEU_EMAIL_PUBLICO"
  },
  "records": {
    "A": ["216.24.57.1"]
  }
}
```

Arquivo `domains/api.ascenda-system.json`:

```json
{
  "owner": {
    "username": "SEU_USUARIO_GITHUB",
    "email": "SEU_EMAIL_PUBLICO"
  },
  "records": {
    "A": ["216.24.57.1"]
  }
}
```

4. Abra um pull request para `is-a-dev/register`.
5. Inclua no PR a URL temporaria do Render como preview do site.
6. Aguarde revisao e merge.

## Passo 5 - Conferir dominios no Render

O `render.yaml` ja declara:

```txt
ascenda-system.is-a.dev
api.ascenda-system.is-a.dev
```

Depois que o PR do is-a.dev for aceito:

1. Entre no servico `ascenda-system-web`.
2. Va em `Settings > Custom Domains`.
3. Clique em `Verify` para `ascenda-system.is-a.dev`.
4. Entre no servico `ascenda-system-api`.
5. Va em `Settings > Custom Domains`.
6. Clique em `Verify` para `api.ascenda-system.is-a.dev`.

O Render gerencia TLS automaticamente apos verificacao.

## Passo 6 - Atualizar Supabase Auth

No Supabase:

1. Va em `Authentication > URL Configuration`.
2. Configure `Site URL`:

```txt
https://ascenda-system.is-a.dev
```

3. Em `Redirect URLs`, adicione:

```txt
https://ascenda-system.is-a.dev/**
```

4. Mantenha os redirects locais enquanto estivermos desenvolvendo:

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

## Passo 7 - Checklist final

- `https://api.ascenda-system.is-a.dev/api/health` responde `ok`.
- Login do mentor funciona.
- Login dos estagiarios funciona.
- Mentor ve os estagiarios `SAP HR` e `DEV WEB`.
- Portal do estagiario mostra mentor/substituto quando configurado.
- Para teste/demo, o cadastro publico pode ficar habilitado:

```txt
ALLOW_PUBLIC_MENTOR_SIGNUP=true
ALLOW_PUBLIC_INTERN_SIGNUP=true
```

- Antes de uso real, desative cadastro publico:

```txt
ALLOW_PUBLIC_MENTOR_SIGNUP=false
ALLOW_PUBLIC_INTERN_SIGNUP=false
```

- `CORS_ORIGIN` contem apenas:

```txt
https://ascenda-system.is-a.dev
```

- As senhas iniciais foram trocadas antes de qualquer uso real.
- A `SUPABASE_SECRET_KEY` nao aparece em nenhum frontend, print publico ou commit.

## Troubleshooting - Login retorna 200, mas tela mostra resposta invalida

Isso acontece quando frontend e backend estao em commits diferentes e o frontend ainda nao entende a resposta envelopada do backend:

```json
{
  "data": {
    "account": {},
    "session": {}
  }
}
```

Solucao:

1. Faca push das ultimas alteracoes.
2. Rode `Manual Deploy` nos dois servicos do Render:
   - `ascenda-system-api`
   - `ascenda-system-web`
3. No browser, teste em aba anonima ou limpe os dados locais do site.
4. Confirme que `ascenda-system-web > Environment` aponta para a API correta:

```txt
VITE_API_URL=https://api.ascenda-system.is-a.dev/api
```
