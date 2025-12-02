import React from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Character, Trend } from '../types';

interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
  onToggleCompare?: (character: Character) => void;
  isCompared?: boolean;
  displayScore?: number;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick, onToggleCompare, isCompared = false, displayScore }) => {
  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case Trend.RISING:
        return <TrendingUp className="w-4 h-4 text-white" />;
      case Trend.FALLING:
        return <TrendingDown className="w-4 h-4 text-white" />;
      default:
        return <Minus className="w-4 h-4 text-white" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-warning";
      case 2: return "bg-[#ced4da]";
      case 3: return "bg-[#d4a373]";
      default: return "bg-slate-200";
    }
  };

  const getTrendColor = (trend: Trend) => {
    switch (trend) {
      case Trend.RISING:
        return 'bg-success';
      case Trend.FALLING:
        return 'bg-danger';
      default:
        return 'bg-slate-300';
    }
  };

  return (
    <div
      onClick={() => onClick(character)}
      className="group relative bg-white rounded-3xl p-3 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border-2 border-slate-100 flex overflow-hidden select-none"
    >
      {/* Decorative 'Ticket' Cutout circles */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[var(--color-bg)] rounded-full border-r-2 border-slate-100 z-10 transition-transform duration-300 group-hover:scale-75"></div>
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[var(--color-bg)] rounded-full border-l-2 border-slate-100 z-10 transition-transform duration-300 group-hover:scale-75"></div>

      {/* Background Decoration */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-pink-100/50 to-transparent rounded-bl-full -z-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:scale-150"></div>

      {/* Image Section */}
      <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 z-10 perspective-500">
         <div className="absolute inset-0 bg-slate-900 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-300 opacity-10"></div>
         <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-white shadow-md bg-slate-100 transition-transform duration-500 group-hover:rotate-1">
            <img
                src={character.image_url}
                alt={character.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            />
            {/* Rank Badge Overlay */}
            <div className={`absolute top-0 left-0 px-3 py-1 rounded-br-xl font-display font-black text-white text-lg ${getRankColor(character.rank)} shadow-sm z-20 group-hover:animate-float`}>
                #{character.rank}
            </div>
         </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 pl-5 py-2 flex flex-col justify-between z-10 relative">
         <div>
            <div className="flex items-center gap-2 mb-1">
                 <span className="bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider transition-colors group-hover:bg-tech-pink">
                    {character.source_type}
                 </span>
                 {character.trend === Trend.RISING && (
                     <span className="bg-holo-blue text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        HOT
                     </span>
                 )}
            </div>
            <h3 className="font-display font-black text-2xl text-slate-800 leading-none group-hover:text-tech-pink transition-colors line-clamp-1 duration-300">
                {character.name}
            </h3>
            <p className="text-sm font-bold text-slate-400 mb-1 font-mplus group-hover:text-slate-500 transition-colors">{character.name_jp}</p>
            <p className="text-xs font-bold text-holo-blue bg-blue-50 inline-block px-2 py-1 rounded-md transition-colors group-hover:bg-holo-blue group-hover:text-white">
                {character.source}
            </p>
         </div>

         {/* Stats Bar */}
         <div className="flex items-end justify-between mt-2">
            <div className="flex flex-col">
                {/* Mock Barcode */}
                <div className="flex items-end gap-[2px] opacity-30 h-6 mb-1 transition-opacity group-hover:opacity-50">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="bg-slate-800 w-[2px]" style={{height: `${Math.max(20, Math.random() * 100)}%`}}></div>
                    ))}
                </div>
                <span className="text-[9px] text-slate-300 font-mono tracking-tighter group-hover:text-tech-pink transition-colors">ID: {character.id.toUpperCase().substring(0,8)}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all border ${
                  isCompared ? 'bg-holo-blue text-white border-holo-blue shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-tech-pink hover:text-tech-pink'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare?.(character);
                }}
              >
                {isCompared ? 'Compare ✓' : 'Add Compare'}
              </button>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 ${getTrendColor(character.trend)}`}>
                {getTrendIcon(character.trend)}
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Score</span>
                <span className="font-display font-black text-3xl text-slate-800 leading-none group-hover:text-deep-violet transition-colors">
                    {(displayScore ?? character.weighted_total).toFixed(0)}
                </span>
              </div>
            </div>
         </div>

         {/* Hover arrow indicator */}
         <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <ExternalLink className="w-4 h-4 text-slate-300" />
         </div>
      </div>
    </div>
  );
};

export default CharacterCard;
