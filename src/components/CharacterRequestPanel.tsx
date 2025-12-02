import React, { useState } from 'react';
import { Inbox, Send } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export interface CharacterRequest {
  id: string;
  text: string;
  createdAt: string;
}

interface CharacterRequestPanelProps {
  requests: CharacterRequest[];
  onAddRequest: (text: string) => void;
}

const CharacterRequestPanel: React.FC<CharacterRequestPanelProps> = ({ requests, onAddRequest }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddRequest(text.trim());
    setText('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Inbox className="w-5 h-5 text-tech-pink" />
        <div>
          <h3 className="font-display font-black text-xl text-slate-800 dark:text-white">{t('requestTitle')}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">{t('requestHelper')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('requestPlaceholder')}
          className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-white focus:outline-none focus:border-tech-pink"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-tech-pink text-white font-black shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Send className="w-4 h-4" />
          {t('addRequest')}
        </button>
      </form>

      {requests.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {requests.map((request) => (
            <div key={request.id} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-3">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">#{request.id}</div>
              <div>
                <p className="text-slate-800 dark:text-slate-100 font-bold">{request.text}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{new Date(request.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterRequestPanel;
