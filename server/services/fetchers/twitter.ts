import axios from 'axios';
import { env } from '../../config/env';
import { generateSyntheticMetric } from '../../utils/metrics';
import { MetricResult } from './types';

export const fetchTwitterMetric = async (query: string): Promise<MetricResult> => {
  if (env.twitterBearerToken) {
    try {
      const response = await axios.get('https://api.x.com/2/tweets/counts/recent', {
        params: { query },
        headers: { Authorization: `Bearer ${env.twitterBearerToken}` },
      });

      const total = response.data?.meta?.total_tweet_count;
      if (Number.isFinite(total)) {
        return { source: 'twitter', value: total, raw: response.data };
      }
    } catch (error) {
      console.warn('[twitter] Falling back to synthetic metric:', error);
    }
  }

  return { source: 'twitter', value: generateSyntheticMetric(`twitter-${query}`, 1.4) };
};
