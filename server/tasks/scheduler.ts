import cron from 'node-cron';
import { refreshRankings } from '../services/aggregator';

const shouldSchedule = process.env.DISABLE_JOBS !== 'true';

export const startScheduledJobs = () => {
  if (!shouldSchedule) {
    console.warn('Background jobs are disabled via DISABLE_JOBS=true');
    return;
  }

  // Refresh every Monday at 04:00 UTC to keep rankings hot for the week.
  cron.schedule('0 4 * * 1', async () => {
    console.log('[cron] Starting weekly rankings refresh');
    try {
      const payload = await refreshRankings();
      console.log(
        `[cron] Refreshed ${payload.characters.length} characters @ ${payload.metadata.updated_at}`
      );
    } catch (error) {
      console.error('[cron] Failed to refresh rankings', error);
    }
  });
};
