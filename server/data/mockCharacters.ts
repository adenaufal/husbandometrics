export interface ApiCharacter {
  id: string;
  rank: number;
  name: string;
  source: string;
  source_type: 'ANIME' | 'GAME' | 'MANGA';
  weighted_total: number;
  trend: 'RISING' | 'FALLING' | 'STABLE';
}

export const apiCharacters: ApiCharacter[] = [
  { id: 'gojo-satoru', rank: 1, name: 'Gojo Satoru', source: 'Jujutsu Kaisen', source_type: 'ANIME', weighted_total: 93.4, trend: 'STABLE' },
  { id: 'aventurine', rank: 2, name: 'Aventurine', source: 'Honkai: Star Rail', source_type: 'GAME', weighted_total: 87.9, trend: 'RISING' },
  { id: 'astarion', rank: 3, name: 'Astarion Ancunin', source: "Baldur's Gate 3", source_type: 'GAME', weighted_total: 81.3, trend: 'STABLE' },
  { id: 'toji-fushiguro', rank: 4, name: 'Toji Fushiguro', source: 'Jujutsu Kaisen', source_type: 'ANIME', weighted_total: 81.0, trend: 'FALLING' },
  { id: 'alhaitham', rank: 5, name: 'Alhaitham', source: 'Genshin Impact', source_type: 'GAME', weighted_total: 77.2, trend: 'STABLE' },
  { id: 'levi-ackerman', rank: 6, name: 'Levi Ackerman', source: 'Attack on Titan', source_type: 'ANIME', weighted_total: 74.0, trend: 'FALLING' },
];
