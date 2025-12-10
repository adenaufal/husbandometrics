import React, { useEffect } from 'react';
import { X, Clock3, Rocket, Wrench } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
  notes?: string;
}

interface ChangelogModalProps {
  onClose: () => void;
}

const ENTRIES: ChangelogEntry[] = [
  {
    version: '2.1.0',
    date: '2025-02-12',
    highlights: [
      'Re-enabled the dedicated changelog view with a polished dossier layout',
      'Improved stability of the rankings export buttons and language selector',
      'Fresh styling pass to keep the kawaii-tech vibe consistent',
    ],
    notes: 'This release focuses on usability polish and making release notes visible again.',
  },
  {
    version: '2.0.0',
    date: '2025-01-28',
    highlights: [
      'Major design refresh with floating header pill and ticket-style character cards',
      'Comparison panel for side-by-side stat reviews',
      'Dark mode toggle, multi-language selector, and data export utilities',
    ],
  },
  {
    version: '1.5.0',
    date: '2024-12-10',
    highlights: [
      'Historical charts powered by Recharts for week, month, and year views',
      'Integration status monitor and request inbox for new characters',
      'Expanded mock dataset to cover cross-franchise benchmarks',
    ],
  },
];

const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up border-2 border-slate-200">
        <div className="bg-gradient-to-r from-slate-900 via-deep-violet to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-5 h-5 text-tech-pink" />
            <div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/60">Release Log</p>
              <h2 className="font-display font-black text-2xl leading-tight">HUSBANDOMETRICS Changelog</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close changelog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative p-8 bg-[#f8f9fb]">
          <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-slate-200" aria-hidden />
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {ENTRIES.map((entry) => (
              <div key={entry.version} className="relative pl-12">
                <div className="absolute -left-[6px] top-2 w-3 h-3 rounded-full bg-tech-pink shadow-[0_0_0_6px_rgba(255,93,143,0.15)]" />
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Version</p>
                      <h3 className="font-display font-black text-xl text-slate-800">{entry.version}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      <Clock3 className="w-4 h-4 text-tech-pink" />
                      <span>{entry.date}</span>
                    </div>
                  </div>

                  <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                    {entry.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {entry.notes && (
                    <div className="mt-4 p-3 rounded-lg bg-soft-pink/15 border border-soft-pink/30 flex items-start gap-2 text-sm text-deep-violet">
                      <Wrench className="w-4 h-4 mt-0.5" />
                      <p className="font-bold">{entry.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
