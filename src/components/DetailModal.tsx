import React, { useEffect, useState } from 'react';
import { X, Sparkles, ExternalLink, Activity, Paperclip, FileText } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Character } from '../types';
import { useTranslation } from '../lib/i18n';

interface DetailModalProps {
  character: Character;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ character, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(character.description || null);
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const chartData = [
    { subject: 'Pixiv', A: character.scores.pixiv, fullMark: 100 },
    { subject: 'AO3', A: character.scores.ao3, fullMark: 100 },
    { subject: 'Trends', A: character.scores.google_trends, fullMark: 100 },
    { subject: 'Booru', A: character.scores.booru, fullMark: 100 },
    { subject: 'Twitter', A: character.scores.twitter, fullMark: 100 },
  ];

  const handleGenerateAnalysis = async () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysis(
        `Analysis for ${character.name}: High engagement on AO3 relative to search trends suggests a dedicated core fanbase rather than mainstream viral appeal. The consistency in Booru tags indicates a steady stream of fan content creation.`,
      );
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />

      {/* Modal Content - Styled as a Folder/Dossier */}
      <div className="relative w-full max-w-5xl bg-modal-bg dark:bg-slate-900 rounded-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-fade-in-up border-4 border-white/80 dark:border-slate-800 group">
        {/* Decorative Tape */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-tech-pink/20 rotate-1 backdrop-blur-sm z-20 border-l border-r border-white/50 animate-float"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white text-slate-400 hover:text-tech-pink hover:rotate-90 hover:scale-110 transition-all shadow-sm active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Side: Profile Image & Core Stats */}
        <div className="w-full md:w-[40%] relative bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r-2 border-dashed border-slate-300 dark:border-slate-700 z-10">
          {/* Decor */}
          <div className="absolute top-4 left-4 text-xs font-mono text-slate-300">CONFIDENTIAL // FILE #{character.id.toUpperCase().slice(0, 6)}</div>

          <div className="relative w-full aspect-square max-w-[280px] mt-8 mb-6 group/image cursor-pointer">
            <div className="absolute inset-0 bg-holo-blue rounded-2xl rotate-3 translate-y-2 opacity-20 transition-transform group-hover/image:rotate-6 group-hover/image:translate-x-2"></div>
            <div className="absolute inset-0 bg-tech-pink rounded-2xl -rotate-2 translate-x-2 opacity-20 transition-transform group-hover/image:-rotate-6 group-hover/image:-translate-x-2"></div>
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-slate-800 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-800 transition-all group-hover/image:-translate-y-1 group-hover/image:shadow-[12px_12px_0px_rgba(0,0,0,0.1)]">
              <img
                src={character.image_url}
                alt={character.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-warning text-slate-900 px-4 py-1 font-black font-display text-xl border-2 border-slate-900 rotate-3 shadow-[4px_4px_0px_rgba(30,41,59,1)] hover:rotate-0 hover:scale-110 transition-all">
              RANK #{character.rank}
            </div>
          </div>

          <div className="text-center w-full">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase font-display leading-none mb-1 tracking-tight">
              {character.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-slate-400 dark:text-slate-500 font-bold font-mplus">{character.name_jp}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-holo-blue font-bold uppercase">{character.source}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 w-full hover:border-tech-pink/30 transition-colors">
              <div className="flex justify-between items-center border-b border-dashed border-slate-200 dark:border-slate-700 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{t('totalScore')}</span>
                <span className="text-2xl font-black text-slate-700 dark:text-white font-display">{character.weighted_total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{t('currentTrend')}</span>
                <span
                  className={`text-sm font-black px-2 py-0.5 rounded ${
                    character.trend === 'RISING'
                      ? 'bg-green-100 text-green-600'
                      : character.trend === 'FALLING'
                        ? 'bg-red-100 text-red-500'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {character.trend}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Data */}
        <div className="w-full md:w-[60%] p-8 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-fixed dark:bg-slate-950">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-deep-violet p-1.5 rounded-lg shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white font-display tracking-tight">PERFORMANCE METRICS</h3>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 relative hover:shadow-md transition-shadow duration-300">
            <div className="absolute -top-3 left-6 bg-holo-blue text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
              {t('radarAnalysis').toUpperCase()}
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 800, fontFamily: 'Satoshi' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={character.name} dataKey="A" stroke="#ff5d8f" strokeWidth={3} fill="#ff5d8f" fillOpacity={0.2} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff', borderRadius: '8px', fontFamily: 'Satoshi', fontWeight: 600 }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="relative group/paper">
            {/* Paper Clip Visual */}
            <div className="absolute -top-3 -right-2 rotate-12 z-10 text-slate-400 transition-transform group-hover/paper:rotate-45">
              <Paperclip className="w-8 h-8" />
            </div>

            <div className="bg-[#fff9c4] dark:bg-slate-800 p-6 rounded-sm shadow-md rotate-1 transform transition-all duration-300 group-hover/paper:rotate-0 group-hover/paper:scale-[1.02] relative cursor-help">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 font-display">
                  <Sparkles className="w-4 h-4 text-tech-pink animate-pulse" />
                  {t('aiObservations').toUpperCase()}
                </h3>
                <button
                  onClick={handleGenerateAnalysis}
                  disabled={analyzing}
                  className="text-[10px] bg-slate-900 text-white px-2 py-1 rounded font-bold hover:bg-slate-700 transition-colors active:scale-95"
                >
                  {analyzing ? t('writing').toUpperCase() : t('update').toUpperCase()}
                </button>
              </div>

              <div className="font-hand text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
                {analysis ? <p>{analysis}</p> : <p className="opacity-50">Tap update to request new observational data...</p>}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="group flex items-center gap-2 text-slate-400 hover:text-tech-pink font-bold text-sm transition-colors">
              <FileText className="w-4 h-4" />
              <span>FULL HISTORY LOG</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
