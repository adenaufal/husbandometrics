import React from 'react';
import { Info, Code, Twitter, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">HUSBANDOMETRICS<span className="text-primary">.IO</span></span>
          <span className="hidden md:inline text-xs text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-2 ml-2">The ultimate 2D character popularity tracker</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onOpenAbout} className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm flex items-center gap-1 transition-colors">
            <Info className="w-4 h-4" /> About
          </button>
          <div className="flex gap-2">
            <a href="#" className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <Code className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          All Systems Operational
          <span className="ml-2">© 2024</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
