import { apiCharacters, ApiCharacter } from '../data/mockCharacters';

export const getAllRankings = async (): Promise<ApiCharacter[]> => {
  return apiCharacters.sort((a, b) => a.rank - b.rank);
};

export const getCharacterById = async (id: string): Promise<ApiCharacter | undefined> => {
  return apiCharacters.find((character) => character.id === id);
};
