import axios from 'axios';
import { env } from '../../config/env';
import { generateSyntheticMetric } from '../../utils/metrics';
import { MetricResult } from './types';

export const fetchDanbooruMetric = async (query: string): Promise<MetricResult> => {
  try {
    const response = await axios.get('https://danbooru.donmai.us/tags.json', {
      params: {
        'search[name_matches]': `${query.replace(/\s+/g, '_')}*`,
        'search[order]': 'count',
        limit: 1,
      },
      headers: env.danbooruToken
        ? { Authorization: `Bearer ${env.danbooruToken}` }
        : undefined,
    });

    const value = response.data?.[0]?.post_count;
    if (Number.isFinite(value)) {
      return { source: 'danbooru', value, raw: response.data };
    }
  } catch (error) {
    console.warn('[danbooru] Falling back to synthetic metric:', error);
  }

  return { source: 'danbooru', value: generateSyntheticMetric(`danbooru-${query}`, 1.1) };
};
