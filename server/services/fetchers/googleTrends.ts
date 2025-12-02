import axios from 'axios';
import { env } from '../../config/env';
import { generateSyntheticMetric } from '../../utils/metrics';
import { MetricResult } from './types';

export const fetchGoogleTrendsMetric = async (query: string): Promise<MetricResult> => {
  if (env.googleTrendsProxy) {
    try {
      const response = await axios.get(env.googleTrendsProxy, {
        params: { keyword: query },
      });

      const averageScore = response.data?.average ?? response.data?.interest_over_time?.average;
      if (Number.isFinite(averageScore)) {
        return { source: 'google_trends', value: averageScore, raw: response.data };
      }
    } catch (error) {
      console.warn('[google-trends] Falling back to synthetic metric:', error);
    }
  }

  return { source: 'google_trends', value: generateSyntheticMetric(`google-${query}`, 0.9) };
};
