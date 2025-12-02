import React from 'react';
import { Moon, Sun, DownloadCloud, Globe2, BookOpen } from 'lucide-react';
import { LANGUAGE_LABELS, SupportedLanguage, useTranslation } from '../lib/i18n';

interface UtilityBarProps {
  onExportCsv: () => void;
  onExportJson: () => void;
  language: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const UtilityBar: React.FC<UtilityBarProps> = ({
  onExportCsv,
  onExportJson,
  language,
  onLanguageChange,
  theme,
  onToggleTheme,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-200">
          <Globe2 className="w-4 h-4 text-tech-pink" />
          <span className="uppercase tracking-wide">{t('language')}</span>
          <select
            className="bg-transparent font-bold focus:outline-none"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          >
            {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
              <option key={code} value={code} className="text-slate-800 dark:text-slate-200">
                {label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-md hover:-translate-y-0.5 transition-all dark:bg-slate-700"
        >
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>{theme === 'dark' ? t('darkMode') : t('lightMode')}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs font-bold border border-slate-100 dark:border-slate-700">
          <DownloadCloud className="w-4 h-4 text-holo-blue" />
          <span className="uppercase tracking-wide">{t('exportTitle')}</span>
          <div className="flex gap-1">
            <button
              onClick={onExportCsv}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:text-tech-pink transition-colors"
            >
              {t('exportCsv')}
            </button>
            <button
              onClick={onExportJson}
              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:text-tech-pink transition-colors"
            >
              {t('exportJson')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-deep-violet text-white text-xs font-bold shadow-lg">
          <BookOpen className="w-4 h-4" />
          <span>{t('developerApi')}</span>
          <span className="opacity-70">/api/rankings</span>
        </div>
      </div>
    </div>
  );
};

export default UtilityBar;
