import axios from 'axios';
import * as cheerio from 'cheerio';
import { env } from '../../config/env';
import { generateSyntheticMetric } from '../../utils/metrics';
import { MetricResult } from './types';

const parseAo3Results = (html: string) => {
  const $ = cheerio.load(html);
  const totalText = $('.heading').first().text();
  const match = totalText.match(/\((?<count>[\d,]+)\)/);
  if (!match?.groups?.count) return null;
  return Number(match.groups.count.replace(/,/g, ''));
};

export const fetchAo3Metric = async (query: string): Promise<MetricResult> => {
  try {
    const response = await axios.get(`${env.ao3BaseUrl}/works`, {
      params: { 'work_search[query]': query },
      headers: { 'User-Agent': 'husbandometrics-bot/1.0' },
    });

    const count = parseAo3Results(response.data);
    if (Number.isFinite(count)) {
      return { source: 'ao3', value: count ?? 0, raw: response.data };
    }
  } catch (error) {
    console.warn('[ao3] Falling back to synthetic metric:', error);
  }

  return { source: 'ao3', value: generateSyntheticMetric(`ao3-${query}`) };
};
