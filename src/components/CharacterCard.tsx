import React from 'react';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { Character, Trend } from '../types';

interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
  displayScore: number;
  layout: 'featured' | 'large' | 'standard';
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick, displayScore, layout }) => {
  const { rank, trend, name, name_jp, source_type, source, franchise, image_url } = character;
  const score = Math.round(displayScore);

  const getTrendIcon = () => {
    switch (trend) {
      case Trend.RISING:
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case Trend.FALLING:
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const getRankBadge = (rank: number, size: 'large' | 'medium' | 'small') => {
    const baseClasses = 'flex items-center justify-center font-black shadow-lg z-10';
    const sizeClasses = {
      large: 'w-12 h-12 rounded-xl text-2xl border-2',
      medium: 'w-10 h-10 rounded-lg text-xl',
      small: 'w-7 h-7 rounded text-xs',
    };
    let colorClasses = 'bg-slate-700 text-white';
    if (rank === 1) colorClasses = 'bg-amber-400 text-amber-900 border-amber-200';
    if (rank === 2) colorClasses = 'bg-slate-200 text-slate-800';
    if (rank === 3) colorClasses = 'bg-orange-200 text-orange-900';

    return <div className={`${baseClasses} ${sizeClasses[size] || sizeClasses.small} ${colorClasses}`}>#{rank}</div>;
  };

  if (layout === 'featured') {
    return (
      <div
        onClick={() => onClick(character)}
        className="lg:col-span-2 lg:row-span-2 relative h-96 lg:h-auto group overflow-hidden rounded-2xl shadow-lg shadow-slate-200 dark:shadow-none bg-slate-900 cursor-pointer"
      >
        <img alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" src={image_url} />
        <div className="absolute inset-0 card-gradient"></div>
        <div className="absolute top-4 left-4">{getRankBadge(rank, 'large')}</div>
        {trend === Trend.STABLE && (
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Stable</div>
        )}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold tracking-wider mb-2">{source_type}</span>
              <span className="inline-block px-2 py-0.5 rounded bg-blue-500 text-white text-[10px] font-bold tracking-wider mb-2 ml-1">{franchise || source}</span>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">{name}</h2>
              <p className="text-slate-300 font-medium text-lg mt-1">{name_jp}</p>
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-3 text-center min-w-[80px] border border-white/10">
                <span className="block text-xs text-slate-300 uppercase font-semibold">Score</span>
                <span className="block text-3xl font-bold text-white">{score}</span>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-lg font-medium transition-colors border border-white/10">
              <Plus className="w-4 h-4" />
              Compare
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'large') {
    return (
      <div
        onClick={() => onClick(character)}
        className="relative h-96 group overflow-hidden rounded-2xl shadow-lg shadow-slate-200 dark:shadow-none bg-slate-900 lg:col-span-1 lg:row-span-2 cursor-pointer"
      >
        <img alt={name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" src={image_url} />
        <div className="absolute inset-0 card-gradient"></div>
        <div className="absolute top-4 left-4">{getRankBadge(rank, 'medium')}</div>
        <div className="absolute bottom-0 left-0 w-full p-5">
          <span className="inline-block px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold tracking-wider mb-2">{source_type}</span>
          <h3 className="text-2xl font-bold text-white leading-tight">{name}</h3>
          <p className="text-slate-400 text-xs mt-0.5 mb-4">{franchise || source}</p>
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="text-2xl font-bold text-white">{score}</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(character)}
      className="relative h-48 group overflow-hidden rounded-xl bg-slate-900 shadow-md cursor-pointer"
    >
      <img alt={name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500" src={image_url} />
      <div className="absolute inset-0 card-gradient"></div>
      <div className="absolute top-3 left-3">{getRankBadge(rank, 'small')}</div>
      <div className="absolute bottom-3 left-3 right-3">
        <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded font-bold">{source_type}</span>
        <div className="flex justify-between items-end mt-1">
          <div>
            <h4 className="text-white font-bold text-sm leading-tight">{name}</h4>
            <p className="text-slate-400 text-[10px]">{franchise || source}</p>
          </div>
          <span className="text-xl font-bold text-white">{score}</span>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
