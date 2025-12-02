import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({
    services: [
      { id: 'mal', name: 'MyAnimeList', status: 'online', latencyMs: 180, endpoints: ['/api/rankings', '/api/rankings/:id'] },
      { id: 'anilist', name: 'AniList', status: 'degraded', latencyMs: 230, endpoints: ['/api/rankings', '/api/rankings/:id'] },
    ],
    updated_at: new Date().toISOString(),
  });
});

export default app;
