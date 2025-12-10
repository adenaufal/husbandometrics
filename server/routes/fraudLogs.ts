import { Hono } from 'hono';
import { FRAUD_LOGS_MOCK } from '../data/fraudLogs';

const fraudLogs = new Hono();

fraudLogs.get('/', (c) => {
  return c.json({
    metadata: {
      total: FRAUD_LOGS_MOCK.length,
      generated_at: new Date().toISOString(),
    },
    logs: FRAUD_LOGS_MOCK,
  });
});

export default fraudLogs;
