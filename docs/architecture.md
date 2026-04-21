# Arquitetura

HackBurger é uma aplicação cliente-servidor com camada única de persistência. A separação entre frontend e backend é estrita: a SPA consome a API exclusivamente via HTTP/JSON e não acessa o banco de dados diretamente.

## Visão de alto nível

```
┌───────────────┐       HTTPS        ┌────────────────┐       SQL        ┌──────────┐
│  SPA Angular  │ ─────────────────► │  API Express   │ ────────────────► │  SQLite  │
│  (browser)    │ ◄───────────────── │  (Node.js)     │ ◄──────────────── │          │
└───────────────┘      JSON/JWT      └────────────────┘                   └──────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │  Prometheus  │ → Grafana
                                     └──────────────┘
```

## Backend

O backend adota uma arquitetura em camadas clássica, com responsabilidades bem delimitadas:

| Camada | Responsabilidade | Onde fica |
|---|---|---|
| Route | Define o endpoint HTTP, middlewares e validação | `backend/src/routes` |
| Controller | Traduz request/response e delega para o service | `backend/src/controllers` |
| Service | Contém a regra de negócio | `backend/src/services` |
| Model | Abstração sobre o banco (SQL preparado) | `backend/src/models` |

O fluxo típico de uma requisição:

1. Express recebe a requisição e encaminha para a rota definida em `routes/`.
2. Middlewares de autenticação (`authenticate`), autorização (`requireAdmin`) e validação (`validate`) filtram a entrada.
3. O controller extrai `req.params`, `req.body` ou `req.query` e chama o service apropriado.
4. O service executa a lógica de negócio e interage com o model.
5. O model executa SQL via `better-sqlite3` em prepared statements.
6. O controller formata a resposta usando os utilitários `sendSuccess` / `sendCreated`.
7. Qualquer exceção é capturada pelo middleware global `errorHandler` que retorna o formato padrão `{ status, message }`.

### Middlewares principais

- `authenticate`: valida o header `Authorization: Bearer <jwt>` e anexa `req.user`.
- `requireAdmin`: bloqueia rotas administrativas para usuários sem papel de admin.
- `validate`: wrapper sobre Joi que valida `body`, `params` e `query`.
- `authLimiter` / `checkoutLimiter`: rate limit específico para endpoints sensíveis.
- `errorHandler`: captura exceções e produz resposta JSON padronizada.

### Autenticação

A API usa JWT stateless. O token é emitido em `POST /api/auth/login` e deve ser enviado no header `Authorization` em todas as chamadas autenticadas. O segredo de assinatura vem de `JWT_SECRET`; a validade padrão é 7 dias.

## Frontend

A SPA Angular 17 organiza-se por domínio, não por tipo de arquivo:

```
frontend/src/app/
  core/           services transversais (auth, http, i18n, theme, toast)
  pages/          telas principais, uma pasta por rota
  shared/         componentes reutilizáveis (navbar, footer, product-card)
  app-routing.module.ts
  app.module.ts
```

Decisões relevantes:

- **Injeção de dependência**: todos os services são `providedIn: 'root'`, sem necessidade de declarações em módulos.
- **Estado global**: `BehaviorSubject` dentro dos services. Não usamos NgRx para manter o projeto leve.
- **Interceptor**: anexa o JWT automaticamente e trata respostas 401 redirecionando para `/auth/login`.
- **Guards**: `AuthGuard` protege rotas autenticadas; `AdminGuard` protege o módulo administrativo.

## Banco de dados

SQLite com `better-sqlite3` (síncrono). A escolha é intencional: zero operação, suficiente para o escopo atual e com excelente desempenho para cargas pequenas a médias. Em produção, trocar para PostgreSQL exige apenas reescrever a camada `models/` — o resto da aplicação não depende do driver.

Detalhes de schema e migrations estão em *Banco de Dados*.

## Observabilidade

- **Logs**: `morgan` em formato `combined` para requisições HTTP.
- **Métricas**: `prom-client` expõe contadores e histogramas em `/metrics`. Prometheus faz scrape a cada 15s.
- **Dashboards**: Grafana consome o Prometheus. Dashboards provisionados em `monitoring/grafana/`.

## Contêineres e deploy

- `docker-compose.yml` sobe o stack completo localmente.
- Manifestos Kubernetes em `infra/k8s/` cobrem Deployments, Services e Ingress.
- Pipeline de CI em `.github/workflows/` roda lint, testes e build das imagens.

Para detalhes do processo de deploy, veja *Deployment*.
