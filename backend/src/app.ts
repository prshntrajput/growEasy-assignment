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

const app: Application = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/inngest', serve({ client: inngest, functions }));

app.use('/api/health', healthRoutes);
app.use('/api', importRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'GrowEasy CSV Importer API is running. See /api/health/ping' });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;