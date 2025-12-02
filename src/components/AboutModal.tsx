import React, { useEffect } from 'react';
import { X, Database, Terminal, Heart } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up border-2 border-slate-200">

        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="flex items-center gap-3 z-10">
                <Terminal className="w-5 h-5 text-tech-pink" />
                <h2 className="font-display font-black text-xl tracking-wider">SYSTEM_MANUAL.md</h2>
             </div>
             <button onClick={onClose} className="z-10 text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
             </button>
        </div>

        {/* Content */}
        <div className="p-8 font-mplus text-slate-600 bg-[#f8f9fa]">
            <div className="mb-8">
                <h1 className="font-display font-black text-3xl text-slate-800 mb-2">HUSBANDOMETRICS</h1>
                <p className="text-tech-pink font-bold text-lg mb-4">Objective Popularity Tracker for Male 2D Characters</p>
                <p className="leading-relaxed">
                    Ever wondered who's actually the most popular husbando based on real data, not just vibes?
                    HUSBANDOMETRICS aggregates engagement metrics from multiple fan platforms to create objective, data-driven male character popularity rankings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="font-display font-black text-slate-800 flex items-center gap-2 mb-3">
                        <Database className="w-4 h-4 text-holo-blue" />
                        DATA SOURCES
                    </h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>🎨 Pixiv (Illustrations)</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>📝 AO3 (Fanfiction)</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>🔍 Google Trends (Search)</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>🖼️ Booru (Archives)</li>
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                     <h3 className="font-display font-black text-slate-800 flex items-center gap-2 mb-3">
                        <Heart className="w-4 h-4 text-deep-violet" />
                        FEATURES
                    </h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Global Top 50 Rankings</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Weekly Trend Tracking</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Objective Scoring Breakdown</li>
                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>Advanced Filtering</li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
                 <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">TECH STACK</h4>
                 <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                    <span className="bg-slate-200 px-2 py-1 rounded">React 19</span>
                    <span className="bg-slate-200 px-2 py-1 rounded">TypeScript</span>
                    <span className="bg-slate-200 px-2 py-1 rounded">Tailwind CSS</span>
                    <span className="bg-slate-200 px-2 py-1 rounded">Recharts</span>
                 </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm font-bold text-deep-violet">Built for the yumejoshi, fujoshi, and otaku community who want numbers, not opinions. 💜</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
