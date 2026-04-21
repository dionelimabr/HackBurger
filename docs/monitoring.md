# Monitoramento

A aplicação expõe métricas no padrão Prometheus e traz dashboards prontos no Grafana. Esta seção cobre o que é coletado, como acessar os dashboards e como adicionar métricas novas.

## Endpoints

| Endpoint | Descrição |
|---|---|
| `GET /metrics` | Métricas Prometheus (texto plano) |
| `GET /health` | Healthcheck simples (`{ status: "ok" }`) |
| `GET /api/docs` | Swagger da API |

## Métricas expostas

O backend usa `prom-client`. As métricas padrão do Node.js (uso de CPU, memória, event loop lag) são habilitadas automaticamente. Além delas, o HackBurger registra:

| Métrica | Tipo | Labels |
|---|---|---|
| `http_requests_total` | counter | `method`, `route`, `status` |
| `http_request_duration_seconds` | histogram | `method`, `route` |
| `orders_created_total` | counter | — |
| `checkout_failures_total` | counter | `reason` |
| `active_users_total` | gauge | — |

## Subindo Prometheus e Grafana

Via Docker Compose, o stack completo inclui os dois serviços:

```bash
npm run docker:up
```

- Prometheus em `http://localhost:9090`
- Grafana em `http://localhost:3001` (login padrão `admin` / `admin`)

O arquivo `monitoring/prometheus.yml` define o scrape do backend a cada 15 segundos:

```yaml
scrape_configs:
  - job_name: hackburger-backend
    static_configs:
      - targets: ['backend:3000']
    metrics_path: /metrics
```

## Dashboards

Os dashboards são provisionados automaticamente via `monitoring/grafana/provisioning/`. Os dois principais:

- **Overview**: requisições por segundo, p50/p95/p99 de latência, taxa de erro, uso de CPU e memória.
- **Negócio**: pedidos criados, falhas no checkout, métodos de pagamento mais usados.

Para editar um dashboard, abra no Grafana, use "Share → Export → Save to file" e substitua o JSON em `monitoring/grafana/dashboards/`.

## Adicionando uma métrica

No backend, registre o contador ou histograma uma única vez em `backend/src/metrics/index.ts`:

```ts
import { Counter } from 'prom-client';

export const ordersCreated = new Counter({
  name: 'orders_created_total',
  help: 'Total de pedidos criados com sucesso',
});
```

No service, incremente após o evento relevante:

```ts
import { ordersCreated } from '../metrics';

const order = await OrderModel.create(...);
ordersCreated.inc();
```

Reinicie o backend e confirme em `http://localhost:3000/metrics`.

## Alertas

Os alertas ficam em `monitoring/prometheus/alerts.yml` e são avaliados pelo Prometheus. Exemplo:

```yaml
groups:
  - name: hackburger
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Taxa de erro acima de 5% nos últimos 5 minutos"
```

Para notificações reais (Slack, e-mail), configure um Alertmanager e aponte o Prometheus com `alerting.alertmanagers` no `prometheus.yml`.

## Troubleshooting

**Grafana não mostra dados**: verifique se o datasource Prometheus está apontando para `http://prometheus:9090` (nome do serviço dentro da rede Docker) e não para `localhost`.

**`/metrics` retorna 404**: confirme que a rota foi montada em `server.ts` com `app.get('/metrics', ...)` antes do middleware de autenticação global.

**Scrape falhando**: veja em `http://localhost:9090/targets` o status de cada target. Um estado `DOWN` indica que o backend não está alcançável pela rede do Prometheus.
