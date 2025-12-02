import axios from 'axios';
import { env } from '../../config/env';
import { generateSyntheticMetric } from '../../utils/metrics';
import { MetricResult } from './types';

export const fetchPixivMetric = async (query: string): Promise<MetricResult> => {
  if (env.pixivToken) {
    try {
      const response = await axios.get(
        `https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(query)}`,
        {
          headers: {
            Cookie: `PHPSESSID=${env.pixivToken}`,
          },
        },
      );
      const total = response.data?.body?.illust?.total ?? 0;
      return { source: 'pixiv', value: total, raw: response.data };
    } catch (error) {
      console.warn('[pixiv] Falling back to synthetic metric:', error);
    }
  }

  return { source: 'pixiv', value: generateSyntheticMetric(`pixiv-${query}`, 1.2) };
};
