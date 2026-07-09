import express, { Application } from 'express';
import cors from 'cors';
import { serve } from 'inngest/express';
import { env } from '@/config/env';
import { inngest } from '@/inngest/client';
import { functions } from '@/inngest/functions';
import healthRoutes from '@/routes/health.routes';
import importRoutes from '@/routes/import.routes';
import { errorMiddleware } from '@/middlewares/error.middleware';
import { notFoundMiddleware } from '@/middlewares/notFound.middleware';
import { applySecurityMiddleware } from '@/middlewares/security.middleware';
import { AppError } from '@/utils/AppError';

const app: Application = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(AppError.badRequest('CORS policy blocked this origin'));
    },
    credentials: true,
  })
);

applySecurityMiddleware(app);

app.use('/api/inngest', express.raw({ type: '*/*' }));
app.use('/api/inngest', serve({ client: inngest, functions }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/health', healthRoutes);
app.use('/api', importRoutes);

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'GrowEasy CSV Importer API is running. See /api/health/ping' },
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;