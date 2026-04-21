# 🍔 HackBurger — Escopo da Estrutura de Diretórios

> Ecommerce de hambúrgueres inspirado na arquitetura do OWASP Juice Shop.
> Stack: Node.js · Express.js · Angular · TypeScript · SQLite · Docker · Kubernetes

---

## Visão Geral da Arquitetura

```
HackBurger/
├── frontend/                        # Angular SPA (cliente)
├── backend/                         # Node.js + Express (API REST)
├── database/                        # Migrations, seeds e schema SQLite
├── infra/                           # Docker, Kubernetes, Vagrant
├── tests/                           # Testes unitários, integração e E2E
├── monitoring/                      # Prometheus + Grafana
├── docs/                            # Documentação geral do projeto
├── .github/                         # CI/CD workflows (GitHub Actions)
├── .env.example                     # Variáveis de ambiente de exemplo
├── docker-compose.yml               # Orquestração local
├── package.json                     # Scripts raiz (monorepo)
└── README.md
```

---

## 📁 frontend/ — Angular + TypeScript + SCSS

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                        # Serviços singleton, guards, interceptors
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── jwt.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── product.service.ts
│   │   │   │   ├── cart.service.ts
│   │   │   │   ├── order.service.ts
│   │   │   │   └── user.service.ts
│   │   │   └── core.module.ts
│   │   │
│   │   ├── shared/                      # Componentes e pipes reutilizáveis
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   ├── product-card/
│   │   │   │   ├── modal/
│   │   │   │   └── toast-notification/
│   │   │   ├── pipes/
│   │   │   │   ├── currency-brl.pipe.ts
│   │   │   │   └── truncate.pipe.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── pages/                       # Páginas (rotas principais)
│   │   │   ├── home/                    # Vitrine de produtos em destaque
│   │   │   ├── catalog/                 # Listagem de hambúrgueres
│   │   │   │   ├── catalog.component.ts
│   │   │   │   └── catalog-filter/
│   │   │   ├── product-detail/          # Página do produto
│   │   │   ├── cart/                    # Carrinho de compras
│   │   │   ├── checkout/                # Finalização do pedido
│   │   │   ├── order-tracking/          # Rastreio de pedido
│   │   │   ├── profile/                 # Dados do usuário logado
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   └── admin/                   # Painel administrativo
│   │   │       ├── dashboard/
│   │   │       ├── products-manager/
│   │   │       ├── orders-manager/
│   │   │       └── users-manager/
│   │   │
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.scss
│   │   └── app.module.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── burgers/                 # Fotos dos produtos
│   │   │   └── branding/                # Logo, ícones da marca
│   │   └── fonts/
│   │
│   ├── environments/
│   │   ├── environment.ts               # Configuração de dev
│   │   └── environment.prod.ts          # Configuração de produção
│   │
│   ├── styles/
│   │   ├── _variables.scss              # Cores, fontes, breakpoints
│   │   ├── _mixins.scss
│   │   ├── _reset.scss
│   │   └── global.scss
│   │
│   └── index.html
│
├── .eslintrc.js                         # Regras ESLint para TypeScript
├── .stylelintrc.js                      # Regras para SCSS
├── angular.json
├── tsconfig.json
└── package.json
```

---

## 📁 backend/ — Node.js + Express.js + TypeScript

```
backend/
├── src/
│   ├── config/                          # Configurações centralizadas
│   │   ├── database.ts                  # Conexão SQLite
│   │   ├── app.ts                       # Instância do Express
│   │   ├── env.ts                       # Carregamento de variáveis de ambiente
│   │   └── swagger.ts                   # Documentação automática da API
│   │
│   ├── routes/                          # Definição de rotas da API REST
│   │   ├── auth.routes.ts               # /api/auth
│   │   ├── product.routes.ts            # /api/products
│   │   ├── cart.routes.ts               # /api/cart
│   │   ├── order.routes.ts              # /api/orders
│   │   ├── user.routes.ts               # /api/users
│   │   ├── payment.routes.ts            # /api/payments
│   │   └── admin.routes.ts              # /api/admin (protegida)
│   │
│   ├── controllers/                     # Lógica de cada rota
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   ├── user.controller.ts
│   │   ├── payment.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/                        # Regras de negócio
│   │   ├── auth.service.ts              # JWT, hash de senha, tokens
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── user.service.ts
│   │   ├── payment.service.ts
│   │   └── email.service.ts             # Envio de e-mails transacionais
│   │
│   ├── models/                          # Definição dos modelos de dados
│   │   ├── User.model.ts
│   │   ├── Product.model.ts
│   │   ├── Category.model.ts
│   │   ├── Cart.model.ts
│   │   ├── CartItem.model.ts
│   │   ├── Order.model.ts
│   │   ├── OrderItem.model.ts
│   │   └── Payment.model.ts
│   │
│   ├── middlewares/                     # Middlewares Express
│   │   ├── auth.middleware.ts           # Verificação de JWT
│   │   ├── role.middleware.ts           # Controle de perfil (admin/user)
│   │   ├── validate.middleware.ts       # Validação de entrada (Joi/Zod)
│   │   ├── rateLimiter.middleware.ts    # Rate limiting por IP
│   │   ├── errorHandler.middleware.ts   # Tratamento global de erros
│   │   └── logger.middleware.ts         # Logs de requisição (Morgan)
│   │
│   ├── utils/                           # Utilitários gerais
│   │   ├── jwt.util.ts
│   │   ├── hash.util.ts                 # bcrypt
│   │   ├── paginate.util.ts
│   │   └── response.util.ts             # Padrão de resposta da API
│   │
│   ├── metrics/
│   │   └── prometheus.ts                # Exposição de métricas em /metrics
│   │
│   └── server.ts                        # Ponto de entrada do servidor
│
├── tsconfig.json
├── nodemon.json
└── package.json
```

---

## 📁 database/ — SQLite + Migrations + Seeds

```
database/
├── migrations/                          # Scripts de criação/alteração de tabelas
│   ├── 001_create_users.sql
│   ├── 002_create_categories.sql
│   ├── 003_create_products.sql
│   ├── 004_create_carts.sql
│   ├── 005_create_orders.sql
│   └── 006_create_payments.sql
│
├── seeds/                               # Dados iniciais para dev e testes
│   ├── users.seed.ts
│   ├── categories.seed.ts
│   └── products.seed.ts
│
├── schema.sql                           # Schema completo do banco
└── hackburger.db                        # Arquivo SQLite (gerado em runtime)
```

---

## 📁 tests/ — Unitários · Integração · E2E

```
tests/
├── unit/                                # Testes unitários (Jest)
│   ├── services/
│   │   ├── auth.service.spec.ts
│   │   ├── product.service.spec.ts
│   │   └── order.service.spec.ts
│   └── utils/
│       ├── jwt.util.spec.ts
│       └── hash.util.spec.ts
│
├── integration/                         # Testes de API (Frisby / Supertest)
│   ├── auth.api.spec.ts
│   ├── products.api.spec.ts
│   ├── cart.api.spec.ts
│   └── orders.api.spec.ts
│
├── e2e/                                 # Testes end-to-end (Cypress)
│   ├── fixtures/
│   │   └── user.json
│   ├── support/
│   │   └── commands.ts
│   └── specs/
│       ├── login.cy.ts
│       ├── catalog.cy.ts
│       ├── checkout.cy.ts
│       └── admin.cy.ts
│
└── jest.config.ts
```

---

## 📁 monitoring/ — Prometheus + Grafana

```
monitoring/
├── prometheus/
│   └── prometheus.yml                   # Scrape config apontando para /metrics
│
└── grafana/
    ├── dashboards/
    │   └── hackburger-overview.json     # Dashboard de métricas da aplicação
    └── datasources/
        └── prometheus.yml
```

---

## 📁 infra/ — Docker · Kubernetes · Vagrant

```
infra/
├── docker/
│   ├── Dockerfile.frontend              # Build Angular (multi-stage)
│   ├── Dockerfile.backend               # Build Node.js (multi-stage)
│   └── .dockerignore
│
├── kubernetes/
│   ├── namespace.yaml
│   ├── frontend/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── backend/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── configmap.yaml
│   └── monitoring/
│       ├── prometheus-deployment.yaml
│       └── grafana-deployment.yaml
│
└── vagrant/
    └── Vagrantfile                      # Ambiente virtualizado local
```

---

## 📁 .github/ — CI/CD (GitHub Actions)

```
.github/
├── workflows/
│   ├── ci.yml                           # Lint + testes a cada PR
│   ├── cd-staging.yml                   # Deploy automático em staging
│   └── cd-production.yml                # Deploy em produção (manual trigger)
└── PULL_REQUEST_TEMPLATE.md
```

---

## 📁 docs/ — Documentação

```
docs/
├── architecture.md                      # Diagrama e decisões de arquitetura
├── api-reference.md                     # Endpoints da API REST
├── setup-guide.md                       # Como rodar localmente
├── deployment.md                        # Deploy em cloud providers
└── contributing.md                      # Guia de contribuição
```

---

## 🗺️ Mapeamento Tecnologia → Módulo

| Tecnologia     | Onde é aplicada                                      |
|----------------|------------------------------------------------------|
| Angular        | `frontend/src/app/` — SPA completa                   |
| TypeScript     | `frontend/` e `backend/src/` — tipagem full-stack    |
| SCSS           | `frontend/src/styles/` e componentes                 |
| Node.js        | `backend/src/server.ts` — runtime do servidor        |
| Express.js     | `backend/src/routes/` e `middlewares/`               |
| SQLite         | `database/` — persistência de dados                  |
| JWT            | `backend/src/utils/jwt.util.ts` + interceptor Angular|
| bcrypt         | `backend/src/utils/hash.util.ts`                     |
| Jest           | `tests/unit/`                                        |
| Frisby/Supertest| `tests/integration/`                               |
| Cypress        | `tests/e2e/`                                         |
| Prometheus     | `backend/src/metrics/` + `monitoring/prometheus/`    |
| Grafana        | `monitoring/grafana/`                                |
| Docker         | `infra/docker/` + `docker-compose.yml`               |
| Kubernetes     | `infra/kubernetes/`                                  |
| Vagrant        | `infra/vagrant/`                                     |
| GitHub Actions | `.github/workflows/`                                 |
| Swagger        | `backend/src/config/swagger.ts`                      |
