import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import rankingsRoutes from './routes/rankings';
import integrationRoutes from './routes/integrations';
import { rateLimit } from './middleware/rateLimit';
import { startScheduledJobs } from './tasks/scheduler';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('/api/*', rateLimit({ limit: 100, windowMs: 60_000 }));

// Routes
app.route('/api/rankings', rankingsRoutes);
app.route('/api/integrations', integrationRoutes);

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
  startScheduledJobs();
});

export default app;
