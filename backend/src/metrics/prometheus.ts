import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Registro padrão com métricas default do Node.js
const register = client.register;
client.collectDefaultMetrics({ register });

// Contador de requisições HTTP
const httpRequestsTotal = new client.Counter({
  name: 'hackburger_http_requests_total',
  help: 'Total de requisições HTTP recebidas',
  labelNames: ['method', 'route', 'status_code'],
});

// Histograma de duração das requisições
const httpRequestDurationMs = new client.Histogram({
  name: 'hackburger_http_request_duration_ms',
  help: 'Duração das requisições HTTP em milissegundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500],
});

// Contador de pedidos criados
export const ordersCreatedTotal = new client.Counter({
  name: 'hackburger_orders_created_total',
  help: 'Total de pedidos criados',
});

// Gauge de usuários ativos
export const activeUsersGauge = new client.Gauge({
  name: 'hackburger_active_users',
  help: 'Número de usuários ativos no sistema',
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route    = req.route?.path ?? req.path;
    const labels   = { method: req.method, route, status_code: String(res.statusCode) };

    httpRequestsTotal.inc(labels);
    httpRequestDurationMs.observe(labels, duration);
  });

  next();
}

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
}
