import axios from 'axios';

/**
 * Shared client for every upstream fetcher. The timeout matters: a hung request
 * would otherwise stall the whole /api/rankings response, since one aggregate
 * waits on all five sources per character.
 */
export const http = axios.create({
  // AO3's work search renders a full results page; 8s was not enough for it.
  timeout: Number(process.env.FETCH_TIMEOUT_MS ?? 15000),
  headers: { 'User-Agent': 'husbandometrics-bot/1.0 (+https://github.com/adenaufal/husbandometrics)' },
});

/**
 * Serialises calls to one host with a minimum gap between them.
 *
 * Retries alone were not enough for AO3: a full refresh makes about 80 requests
 * there, and firing them four at a time got most of the roster throttled no
 * matter how patiently each one backed off. Spacing the requests is what
 * actually keeps the readings, at the cost of a slower refresh - which the
 * six-hour cache and the weekly cron absorb.
 *
 * ponytail: one gate per process. Needs a shared limiter across instances if
 * this is ever deployed more than once.
 */
export const createPacer = (minIntervalMs: number) => {
  let queue = Promise.resolve();

  return async <T>(request: () => Promise<T>): Promise<T> => {
    const slot = queue;
    queue = slot.then(() => new Promise((resolve) => setTimeout(resolve, minIntervalMs)));
    await slot;
    return request();
  };
};
