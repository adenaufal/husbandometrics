import { Character } from '../types';

const normalizeText = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();

const levenshtein = (a: string, b: string) => {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[a.length][b.length];
};

const fuzzyMatch = (query: string, target: string) => {
  const normalizedQuery = normalizeText(query);
  const normalizedTarget = normalizeText(target);
  if (!normalizedQuery || !normalizedTarget) return false;

  if (normalizedTarget.includes(normalizedQuery)) return true;

  const distance = levenshtein(normalizedQuery, normalizedTarget.slice(0, normalizedQuery.length));
  const similarity = 1 - distance / Math.max(normalizedQuery.length, normalizedTarget.length);
  return similarity >= 0.6;
};

export const matchesQuery = (character: Character, query: string) => {
  if (!query.trim()) return true;
  const normalized = normalizeText(query);

  const searchableFields = [
    character.name,
    character.name_jp,
    character.romaji || '',
    character.source,
    character.franchise || '',
    ...(character.aliases || [])
  ];

  return searchableFields.some((field) => {
    const normalizedField = normalizeText(field);
    return normalizedField.includes(normalized) || fuzzyMatch(normalized, normalizedField);
  });
};
