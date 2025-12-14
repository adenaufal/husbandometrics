import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
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

const CharacterRequestPanel: React.FC<CharacterRequestPanelProps> = ({ onAddRequest }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddRequest(text.trim());
    setText('');
  };

  return (
    <div className="col-span-1 md:col-span-2 bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-primary flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white">Character Requests</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Submit names you want tracked next.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          placeholder="Character & franchise (e.g., Jingliu - Honkai SR)"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="bg-primary hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors">
          <Send className="w-4 h-4" />
          Add Request
        </button>
      </form>
    </div>
  );
};

export default CharacterRequestPanel;
