import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Character, TimePeriod } from '../types';
import { getLatestSnapshot } from '../lib/history';
import { Sparkles, XCircle } from 'lucide-react';

interface ComparisonPanelProps {
  characters: Character[];
  timePeriod: TimePeriod;
  onClear: () => void;
}

const metricKeys = [
  { key: 'pixiv', label: 'Pixiv' },
  { key: 'ao3', label: 'AO3' },
  { key: 'google_trends', label: 'Trends' },
  { key: 'danbooru', label: 'Danbooru' },
  { key: 'twitter', label: 'Twitter' },
];

const palette = ['#ff5d8f', '#0ea5e9', '#8b5cf6', '#f59e0b'];

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ characters, timePeriod, onClear }) => {
  if (!characters.length) return null;

  const data = metricKeys.map((metric) => {
    const entry: Record<string, string | number> = { metric: metric.label };
    characters.forEach((char) => {
      const snapshot = getLatestSnapshot(char, timePeriod);
      const value = snapshot?.scores[metric.key as keyof typeof snapshot.scores] ?? char.scores[metric.key as keyof typeof char.scores];
      entry[char.id] = typeof value === 'number' ? value : 0;
    });
    return entry;
  });

  return (
    <div className="bg-white/80 border border-slate-100 rounded-3xl p-4 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-deep-violet text-white p-2 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Character Comparison</p>
            <p className="text-lg font-black text-slate-800 font-display">Radar Overlay ({timePeriod.toLowerCase()})</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-tech-pink"
        >
          <XCircle className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800, fontFamily: 'Satoshi' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              {characters.map((char, index) => (
                <Radar
                  key={char.id}
                  name={char.name}
                  dataKey={char.id}
                  stroke={palette[index % palette.length]}
                  fill={palette[index % palette.length]}
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-1 space-y-2">
          {characters.map((char, index) => {
            const snapshot = getLatestSnapshot(char, timePeriod);
            return (
              <div key={char.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center gap-3">
                <div
                  className="w-3 h-12 rounded-full"
                  style={{ background: `linear-gradient(180deg, ${palette[index % palette.length]}, rgba(255,255,255,0.7))` }}
                ></div>
                <div className="flex-1">
                  <p className="text-xs uppercase font-black text-slate-400">{char.source}</p>
                  <p className="font-display font-black text-slate-800 leading-tight">{char.name}</p>
                  <p className="text-[10px] font-bold text-slate-500">Current score: {(snapshot?.weighted_total ?? char.weighted_total).toFixed(1)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanel;
