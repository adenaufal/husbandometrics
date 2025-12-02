import { Hono } from 'hono';
import { getAllRankings, getCharacterById, refreshRankings } from '../services/aggregator';

const app = new Hono();

// Get all character rankings
app.get('/', async (c) => {
  try {
    const rankings = await getAllRankings();
    return c.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return c.json({ error: 'Failed to fetch rankings' }, 500);
  }
});

// Trigger a manual refresh (secured with optional token)
app.post('/refresh', async (c) => {
  const refreshToken = process.env.REFRESH_TOKEN;
  if (refreshToken && c.req.header('x-refresh-token') !== refreshToken) {
    return c.json({ error: 'Unauthorized refresh' }, 401);
  }

  try {
    const refreshed = await refreshRankings();
    return c.json(refreshed);
  } catch (error) {
    console.error('Error refreshing rankings:', error);
    return c.json({ error: 'Failed to refresh rankings' }, 500);
  }
});

// Get specific character details
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const character = await getCharacterById(id);

    if (!character) {
      return c.json({ error: 'Character not found' }, 404);
    }

    return c.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    return c.json({ error: 'Failed to fetch character' }, 500);
  }
});

export default app;
