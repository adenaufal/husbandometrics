import React from 'react';
import { Github, Twitter, Info } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-display font-black text-2xl text-slate-800 mb-2">HUSBANDOMETRICS<span className="text-tech-pink">.IO</span></h2>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              The internet's premier objective ranking system for male 2D character popularity.
              Aggregating data points from across the fandom web.
            </p>
            <div className="flex gap-4">
               <button className="p-2 bg-slate-100 rounded-full hover:bg-slate-800 hover:text-white transition-all text-slate-600">
                  <Twitter className="w-5 h-5" />
               </button>
               <button className="p-2 bg-slate-100 rounded-full hover:bg-slate-800 hover:text-white transition-all text-slate-600">
                  <Github className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="font-display font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs">System</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-500">
              <li><button onClick={onOpenAbout} className="hover:text-tech-pink transition-colors flex items-center gap-2"><Info className="w-3 h-3"/> About Project</button></li>
              <li><a href="#" className="hover:text-tech-pink transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-tech-pink transition-colors">Methodology</a></li>
              <li><a href="#" className="hover:text-tech-pink transition-colors">Status Page</a></li>
            </ul>
          </div>

          {/* Status Column */}
          <div>
            <h3 className="font-display font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs">Live Status</h3>
            <div className="space-y-3">
               <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <span>PIXIV API</span>
                  <span className="flex items-center gap-1.5 text-green-500"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ONLINE</span>
               </div>
               <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <span>AO3 SCRAPER</span>
                  <span className="flex items-center gap-1.5 text-green-500"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ONLINE</span>
               </div>
               <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <span>TRENDS</span>
                  <span className="flex items-center gap-1.5 text-yellow-500"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span> LATENCY</span>
               </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-400">
           <p>© 2024 HUSBANDOMETRICS. All rights reserved.</p>
           <p>Last Data Update: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
