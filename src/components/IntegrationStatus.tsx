import React from 'react';
import { RefreshCw, Wifi } from 'lucide-react';

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
  return (
    <div className="col-span-1 md:col-span-2 bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">MAL/AniList Integrations</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Developer API Status</p>
          </div>
        </div>
        <button
          onClick={onSync}
          className="text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 px-3 py-1.5 rounded-lg text-xs font-bold border border-cyan-100 dark:border-cyan-800 hover:bg-cyan-100 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          Sync Now
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className={`w-2 h-2 rounded-full ${integration.status === 'healthy' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                {integration.service}
              </span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-1.5 rounded">{integration.latencyMs}ms</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
              {integration.characters.toLocaleString()} <span className="text-sm font-normal text-slate-500">synced</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">{new Date(integration.syncedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationStatus;
