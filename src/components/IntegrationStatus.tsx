import React from 'react';
import { RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export interface IntegrationStat {
  id: string;
  service: 'MAL' | 'AniList';
  syncedAt: string;
  characters: number;
  latencyMs: number;
  status: 'healthy' | 'warning';
}

interface IntegrationStatusProps {
  integrations: IntegrationStat[];
  onSync: () => void;
}

const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ integrations, onSync }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-black text-xl text-slate-800 dark:text-white">{t('integrations')}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">{t('developerApi')} + {t('apiDocs')}</p>
        </div>
        <button
          onClick={onSync}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-holo-blue text-white font-black shadow-md hover:-translate-y-0.5 transition-all"
        >
          <RefreshCcw className="w-4 h-4" />
          {t('integrationSync')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-800/60"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {integration.status === 'healthy' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-xs font-black text-slate-600 dark:text-slate-200 uppercase">{integration.service}</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{integration.latencyMs}ms</span>
            </div>
            <p className="text-slate-800 dark:text-slate-100 font-bold">{integration.characters} characters synced</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{new Date(integration.syncedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationStatus;
