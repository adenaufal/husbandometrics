import { FraudLogEntry } from '../types';

export const MOCK_FRAUD_LOGS: FraudLogEntry[] = [
  {
    id: 'fl-30214',
    occurredAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    severity: 'critical',
    actor: 'api-key:admin-dashboard',
    action: 'Multiple failed refresh token attempts',
    context: 'Rate limit exceeded from 203.0.113.12',
    status: 'blocked',
  },
  {
    id: 'fl-30213',
    occurredAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    severity: 'warning',
    actor: 'worker:cron',
    action: 'Unexpected payload schema from Pixiv fetcher',
    context: 'Rejected 12 malformed records before scoring',
    status: 'flagged',
  },
  {
    id: 'fl-30212',
    occurredAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    severity: 'info',
    actor: 'user:cf-1122',
    action: 'Manual ranking refresh',
    context: 'Verified refresh token and IP allowlist',
    status: 'allowed',
  },
  {
    id: 'fl-30211',
    occurredAt: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    severity: 'warning',
    actor: 'webhook:danbooru',
    action: 'Suspicious surge in NSFW tags',
    context: 'Throttled importer for 15 minutes',
    status: 'flagged',
  },
  {
    id: 'fl-30210',
    occurredAt: new Date(Date.now() - 1000 * 60 * 340).toISOString(),
    severity: 'critical',
    actor: 'user:anon-8891',
    action: 'Blocked SQL keyword injection in search',
    context: 'WAF challenge solved; query sanitized',
    status: 'blocked',
  },
];
