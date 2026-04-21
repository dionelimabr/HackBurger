import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './env';
import { setupSwagger } from './swagger';
import { errorHandler } from '../middlewares/errorHandler.middleware';
import { metricsMiddleware, metricsHandler } from '../metrics/prometheus';
import { awardChallenge } from '../utils/challenge.util';
import { UPLOADS_ROOT } from '../middlewares/upload.middleware';

// Routes
import authRoutes    from '../routes/auth.routes';
import productRoutes from '../routes/product.routes';
import cartRoutes    from '../routes/cart.routes';
import orderRoutes   from '../routes/order.routes';
import userRoutes    from '../routes/user.routes';
import paymentRoutes from '../routes/payment.routes';
import adminRoutes   from '../routes/admin.routes';
import scoreRoutes   from '../routes/score.routes';
import legalRoutes   from '../routes/legal.routes';
import debugRoutes   from '../routes/debug.routes';
import ftpRoutes     from '../routes/ftp.routes';
import feedbackRoutes from '../routes/feedback.routes';
import redirectRoutes from '../routes/redirect.routes';

const app: Application = express();

// Security & utilities
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Arquivos estáticos (avatares e outros uploads)
app.use('/uploads', express.static(UPLOADS_ROOT));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Prometheus metrics collector
app.use(metricsMiddleware);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// API Routes
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/scores',   scoreRoutes);
app.use('/api/legal',    legalRoutes);
app.use('/api/debug',    debugRoutes);
app.use('/api/feedback', feedbackRoutes);

// Intentionally non-"/api" paths — these are part of the CTF exploration.
app.use('/ftp',       ftpRoutes);
app.use('/redirect',  redirectRoutes);

// Prometheus metrics (intentionally public — CTF: Exposed Metrics)
app.get('/metrics', (req, res) => {
  awardChallenge(req, 'exposedMetricsChallenge');
  return metricsHandler(req, res);
});

// Swagger docs
setupSwagger(app);

// Global error handler (deve ser o último)
app.use(errorHandler);

export default app;
