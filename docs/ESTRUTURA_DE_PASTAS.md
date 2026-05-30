# Estrutura de pastas Ascenda

Este mapa existe para facilitar manutencao. Antes de criar uma nova pasta ou arquivo, confira se ja existe uma camada adequada.

## Raiz

```txt
Ascenda-System/
  package.json
  render.yaml
  scripts/
  AscendaSystem-React/
  AscendaSystem-Node/
  docs/
```

- `package.json`: comandos centralizados para instalar, desenvolver e gerar build.
- `render.yaml`: blueprint de deploy no Render.
- `scripts`: automacoes do projeto, incluindo build unificado do frontend.
- `AscendaSystem-React`: todos os apps React.
- `AscendaSystem-Node`: API Node/Express, integracao Supabase e IA.
- `docs`: guias operacionais, plano de acao e decisoes tecnicas.

Arquivos de ambiente:

- `AscendaSystem-Node/.env`: variaveis privadas do backend, incluindo Supabase e OpenAI.
- `AscendaSystem-React/.env`: variaveis compartilhadas dos apps React.
- `AscendaSystem-Node/.env.production.example`: referencia para servidor de producao.
- `AscendaSystem-React/.env.production.example`: referencia para build de producao dos frontends.
- `.env` nunca deve ser versionado. Use `.env.example` como referencia.

## Frontend

```txt
AscendaSystem-React/
  Login/
  LoadingPage/
  MentorPortal/
  InternPortal/
```

- `Login`: entrada do sistema, login/cadastro e escolha de role.
- `LoadingPage`: transicao visual entre login e portal.
- `MentorPortal`: experiencia do mentor.
- `InternPortal`: experiencia do intern.

Padrao interno recomendado para cada app React:

```txt
src/
  components/ ou Components/
  pages/ ou Pages/
  entities/ ou Entities/
  services/
  hooks/
  utils/
  data/
```

- `components`: componentes visuais reutilizaveis.
- `pages`: telas completas e rotas.
- `entities`: camada de acesso a dados. Deve chamar backend ou fallback em memoria, sem persistir dados de negocio no navegador.
- `services`: comunicacao com backend e APIs externas. Novas integracoes devem entrar aqui.
- `hooks`: regras reutilizaveis de React.
- `utils`: helpers puros.
- `data`: mocks/seeds locais.

Regra para novas mudancas no frontend:

1. Tela chama `services` ou `entities`.
2. `services` chama backend.
3. Tela nao deve montar URL de API nem acessar token diretamente.

Todos os apps Vite dentro de `AscendaSystem-React` usam `envDir: '..'`, entao leem o mesmo arquivo `AscendaSystem-React/.env`.

Build de producao:

```txt
npm run build
```

Esse comando gera uma pasta unica `dist/` na raiz:

```txt
dist/
  index.html      -> Login
  loading/        -> LoadingPage
  mentor/         -> MentorPortal
  intern/         -> InternPortal
```

## Backend

```txt
AscendaSystem-Node/
  database/
  src/
    config/
    data/
    lib/
    middleware/
    routes/
    utils/
```

- `database`: SQL do Supabase.
- `src/config`: leitura e validacao de variaveis de ambiente.
- `src/data`: adapters de dados. Hoje existe mock e Supabase.
- `src/lib`: clientes externos, como Supabase.
- `src/middleware`: auth, seguranca, rate limit e outras camadas Express.
- `src/routes`: endpoints HTTP.
- `src/utils`: erros, validacoes e helpers pequenos.

Regra para novas rotas:

1. `routes` valida entrada e chama uma funcao de dominio/adaptador.
2. `data` decide se usa mock ou Supabase.
3. `middleware` cuida de auth, role e seguranca.
4. Chaves secretas ficam apenas em `.env` do backend.

## Estado atual da organizacao

A organizacao macro esta correta e nao precisa de outra mudanca de pastas agora. A melhoria importante ja iniciada e separar:

- interface visual;
- servicos de API;
- dados mock/Supabase;
- middleware de seguranca;
- documentacao operacional.

O proximo ajuste estrutural, quando o projeto crescer, sera padronizar maiusculas/minusculas nos apps React:

- `components` em vez de misturar `components` e `Components`;
- `pages` em vez de misturar `pages` e `Pages`;
- `entities` em vez de misturar `entities` e `Entities`.

Essa padronizacao deve ser feita em uma etapa separada, porque muda muitos imports e pode quebrar builds se for misturada com migracao de backend.
