import type { Character } from "../types";

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, "")
    .trim();

const levenshtein = (a: string, b: string) => {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

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
          matrix[i - 1][j - 1] + 1,
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

  const compared = normalizedTarget.slice(0, normalizedQuery.length);
  const distance = levenshtein(normalizedQuery, compared);
  // Normalise against the strings actually compared. Dividing by the whole
  // target's length instead inflated short queries: "levi" scored 0.67 against
  // "Satoru Gojou" and matched every row on the board.
  const similarity =
    1 - distance / Math.max(normalizedQuery.length, compared.length);
  return similarity >= 0.6;
};

export const matchesQuery = (character: Character, query: string) => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const searchableFields = [
    character.name,
    character.name_jp,
    character.romaji || "",
    character.source,
    character.franchise || "",
    ...(character.aliases || []),
  ];

  // Raw substring first: name_jp carries kana and kanji, which normalizeText
  // (a-z0-9 only) strips away entirely. Without this a Japanese query can
  // never match, and once normalized it is the empty string - which every
  // .includes('') then reports as a match, so one odd keystroke showed the
  // whole board instead of a filtered one.
  if (searchableFields.some((field) => field.toLowerCase().includes(trimmed)))
    return true;

  const normalized = normalizeText(trimmed);
  // A query with no searchable characters left matches nothing, not everything.
  if (!normalized) return false;

  return searchableFields.some((field) => {
    const normalizedField = normalizeText(field);
    return (
      normalizedField.includes(normalized) ||
      fuzzyMatch(normalized, normalizedField)
    );
  });
};
