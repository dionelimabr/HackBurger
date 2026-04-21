# Guia de Setup

Este guia descreve como colocar o HackBurger rodando na sua máquina de desenvolvimento em menos de cinco minutos. Dois caminhos são suportados: execução direta com Node.js (recomendado para desenvolvimento) e execução em contêineres via Docker Compose.

## Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Git
- Opcional: Docker 24+ e Docker Compose v2 para o modo contêiner

Verifique as versões:

```bash
node --version
npm --version
```

## Clonando o repositório

```bash
git clone https://github.com/seu-usuario/HackBurger.git
cd HackBurger
```

## Variáveis de ambiente

A raiz do projeto contém um arquivo `.env.example`. Copie-o e ajuste os valores conforme necessário:

```bash
cp .env.example .env
```

Os campos mais relevantes:

| Variável | Descrição | Valor padrão |
|---|---|---|
| `PORT` | Porta HTTP do backend | `3000` |
| `JWT_SECRET` | Segredo para assinatura de tokens | troque em produção |
| `JWT_EXPIRES_IN` | Validade do token | `7d` |
| `DATABASE_PATH` | Caminho do arquivo SQLite | `database/hackburger.db` |
| `CORS_ORIGIN` | Origem autorizada no CORS | `http://localhost:4200` |

## Instalando dependências

Instale os três grupos de dependências: raiz, backend e frontend.

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

## Inicializando o banco de dados

As migrations são aplicadas automaticamente na primeira execução do backend. Para popular com dados de exemplo (categorias, produtos e usuários de teste), rode o seed:

```bash
npm run seed
```

O seed é idempotente — pode ser executado várias vezes sem criar duplicatas.

## Executando em modo desenvolvimento

O script `start` da raiz sobe backend e frontend em paralelo usando `concurrently`:

```bash
npm run start
```

Após alguns segundos você terá:

- Frontend em `http://localhost:4200`
- API em `http://localhost:3000`
- Documentação Swagger em `http://localhost:3000/api/docs`
- Métricas Prometheus em `http://localhost:3000/metrics`

Hot reload está ativo nos dois serviços. Mudanças em arquivos `.ts` do backend reiniciam o processo via `nodemon`; mudanças no frontend atualizam o navegador automaticamente.

## Executando com Docker Compose

Para um ambiente mais próximo de produção (inclui Prometheus e Grafana):

```bash
npm run docker:up
```

Serviços expostos:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

Para derrubar tudo:

```bash
npm run docker:down
```

## Usuários de teste

Após rodar o seed, os seguintes usuários ficam disponíveis:

| Papel | E-mail | Senha |
|---|---|---|
| Administrador | `admin@hackburger.com` | `admin123` |
| Cliente | `cliente@hackburger.com` | `cliente123` |

## Rodando os testes

```bash
npm run test:unit    # Jest, suite unitária
npm run test:e2e     # Cypress em modo interativo
```

## Problemas comuns

**Porta 3000 ou 4200 já em uso**: altere `PORT` no `.env` (backend) ou use `ng serve --port 4300` (frontend).

**Erro ao rodar seed**: confirme que `database/hackburger.db` não está em uso por outro processo. Encerre qualquer backend ativo antes.

**CORS bloqueado**: garanta que `CORS_ORIGIN` do `.env` inclui exatamente a URL de onde o frontend está rodando.
