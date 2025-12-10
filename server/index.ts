import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import rankingsRoutes from './routes/rankings';
import integrationRoutes from './routes/integrations';
import fraudLogRoutes from './routes/fraudLogs';
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
app.route('/api/fraud-logs', fraudLogRoutes);

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3001;

console.log(`Server running on http://localhost:${port}`);
startScheduledJobs();

export default {
  port,
  fetch: app.fetch,
};
