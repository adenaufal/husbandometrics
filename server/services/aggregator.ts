import { MOCK_CHARACTERS } from '../../src/lib/constants';
import { Character } from '../../src/types';

export const getAllRankings = async (): Promise<Character[]> => {
  return MOCK_CHARACTERS;
};

export const getCharacterById = async (id: string): Promise<Character | null> => {
  return MOCK_CHARACTERS.find((char) => char.id === id) || null;
};
