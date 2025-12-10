import React, { useMemo, useState } from 'react';
import { AlertTriangle, Ban, CheckCircle2, RefreshCcw, ShieldAlert, ShieldCheck, ShieldQuestion, ShieldX } from 'lucide-react';
import { FraudLogEntry, FraudLogSeverity } from '../types';

interface FraudLogsProps {
  logs: FraudLogEntry[];
  isLoading: boolean;
  isError: boolean;
  onRefresh?: () => void;
}

const severityCopy: Record<FraudLogSeverity, { label: string; tone: string; bg: string; dot: string }> = {
  info: {
    label: 'Info',
    tone: 'text-slate-600 dark:text-slate-200',
    bg: 'bg-slate-50 dark:bg-slate-800',
    dot: 'bg-slate-400',
  },
  warning: {
    label: 'Warning',
    tone: 'text-amber-700 dark:text-amber-200',
    bg: 'bg-amber-50/80 dark:bg-amber-900/30',
    dot: 'bg-amber-500',
  },
  critical: {
    label: 'Critical',
    tone: 'text-rose-700 dark:text-rose-200',
    bg: 'bg-rose-50/80 dark:bg-rose-900/30',
    dot: 'bg-rose-500',
  },
};

const statusBadge: Record<FraudLogEntry['status'], { label: string; styles: string; icon: React.ReactNode }> = {
  blocked: {
    label: 'Blocked',
    styles: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-100',
    icon: <ShieldX className="w-3.5 h-3.5" />,
  },
  flagged: {
    label: 'Flagged',
    styles: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
  },
  allowed: {
    label: 'Allowed',
    styles: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
  },
};

const FraudLogs: React.FC<FraudLogsProps> = ({ logs, isLoading, isError, onRefresh }) => {
  const [severityFilter, setSeverityFilter] = useState<FraudLogSeverity | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => severityFilter === 'all' || log.severity === severityFilter)
      .filter((log) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
          log.id.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.context.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }, [logs, search, severityFilter]);

  return (
    <section className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 rounded-3xl shadow-lg shadow-slate-200/30 dark:shadow-black/20 p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-bold">Security</p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldQuestion className="w-7 h-7 text-holo-blue" />
            Fraud Logs
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Monitor high-signal security and fraud events coming from API keys, schedulers, and ingest webhooks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            {(['all', 'info', 'warning', 'critical'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSeverityFilter(level === 'all' ? 'all' : (level as FraudLogSeverity | 'all'))}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-2 ${
                  severityFilter === level
                    ? 'bg-white dark:bg-slate-900 shadow-md text-tech-pink'
                    : 'text-slate-600 dark:text-slate-300 hover:text-tech-pink'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${level === 'all' ? 'bg-tech-pink' : severityCopy[level as FraudLogSeverity].dot}`} />
                {level === 'all' ? 'All' : severityCopy[level as FraudLogSeverity].label}
              </button>
            ))}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-deep-violet text-white shadow-md hover:-translate-y-0.5 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          {isLoading ? (
            <>
              <RefreshCcw className="w-4 h-4 animate-spin text-tech-pink" /> Loading latest events...
            </>
          ) : isError ? (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Using cached fallback while the API recovers
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Synced from fraud monitor API
            </>
          )}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actor, action, or context"
          className="w-full md:w-80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-tech-pink/30 outline-none"
        />
      </div>

      <div className="grid gap-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-100 dark:border-slate-800 px-4 py-3 ${severityCopy[log.severity].bg}`}
          >
            <div className="flex items-start gap-3">
              <span className={`mt-1 w-2 h-2 rounded-full ${severityCopy[log.severity].dot}`} />
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{log.id}</p>
                <p className={`text-sm font-bold ${severityCopy[log.severity].tone}`}>{severityCopy[log.severity].label}</p>
                <p className="text-base font-semibold text-slate-900 dark:text-white">{log.action}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{log.context}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <Ban className="w-3.5 h-3.5 text-slate-500" />
                    {log.actor}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(log.occurredAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusBadge[log.status].styles}`}>
                {statusBadge[log.status].icon}
                {statusBadge[log.status].label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FraudLogs;
