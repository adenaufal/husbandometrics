import { SourceType } from '../../src/types';

export type RosterEntry = {
  id: string;
  name: string;
  franchise: string;
  sourceType: SourceType;
  /**
   * Extra search terms. Danbooru qualifies character tags by series and AO3
   * indexes by whatever the fandom writes, so a single canonical name misses
   * readings that plainly exist.
   */
  aliases: string[];
  /**
   * Every name the franchise is catalogued under. AO3 tags Genshin characters
   * "(Genshin Impact)", Danbooru writes "(genshin_impact)", and AniList files
   * only the Chinese ONA titles - matching a one-word name like "Xiao" or
   * "Sunday" against the right character needs all of them.
   */
  franchiseHints: string[];
  /** Fallback portrait for characters AniList has no image for. */
  imageUrl?: string;
};

/**
 * Editorial scope, not data.
 *
 * AniList catalogues anime and manga only, so it cannot discover game
 * characters - Zhongli sits at roughly 1,000 favourites there against Levi's
 * 43,000, purely because gacha characters have no anime entry to be favourited
 * on. Auto-discovery would therefore erase every husbando in this list.
 *
 * Naming a character here decides that the board covers them. It never supplies
 * their numbers: every score still comes from a live reading, and a character
 * whose sources all fail stays unranked rather than being filled in.
 */
export const GAME_ROSTER: RosterEntry[] = [
  { id: 'zhongli', name: 'Zhongli', franchise: 'Genshin Impact', sourceType: SourceType.GAME, franchiseHints: ['Genshin Impact', 'Yuanshen'], aliases: ['Rex Lapis', 'Morax'] },
  { id: 'xiao', name: 'Xiao', franchise: 'Genshin Impact', sourceType: SourceType.GAME, franchiseHints: ['Genshin Impact', 'Yuanshen'], aliases: ['Alatus', 'Xiao (Genshin Impact)'] },
  { id: 'neuvillette', name: 'Neuvillette', franchise: 'Genshin Impact', sourceType: SourceType.GAME, franchiseHints: ['Genshin Impact', 'Yuanshen'], aliases: ['Chief Justice'] },
  { id: 'wriothesley', name: 'Wriothesley', franchise: 'Genshin Impact', sourceType: SourceType.GAME, franchiseHints: ['Genshin Impact', 'Yuanshen'], aliases: ['Duke of Meropide'] },
  { id: 'alhaitham', name: 'Alhaitham', franchise: 'Genshin Impact', sourceType: SourceType.GAME, franchiseHints: ['Genshin Impact', 'Yuanshen'], aliases: ['Al-Haitham'] },
  { id: 'tartaglia', name: 'Tartaglia', franchise: 'Genshin Impact', sourceType: SourceType.GAME, franchiseHints: ['Genshin Impact', 'Yuanshen'], aliases: ['Childe', 'Ajax'] },
  { id: 'diluc', name: 'Diluc', franchise: 'Genshin Impact', sourceType: SourceType.GAME, franchiseHints: ['Genshin Impact', 'Yuanshen'], aliases: ['Diluc Ragnvindr', 'Darknight Hero'] },
  { id: 'kaeya', name: 'Kaeya', franchise: 'Genshin Impact', sourceType: SourceType.GAME, franchiseHints: ['Genshin Impact', 'Yuanshen'], aliases: ['Kaeya Alberich'] },
  { id: 'aventurine', name: 'Aventurine', franchise: 'Honkai: Star Rail', sourceType: SourceType.GAME, franchiseHints: ['Honkai: Star Rail', 'Star Rail', 'Benghuai: Xingqiong Tiedao'], aliases: ['Kakavasha'] },
  { id: 'sunday-hsr', name: 'Sunday', franchise: 'Honkai: Star Rail', sourceType: SourceType.GAME, franchiseHints: ['Honkai: Star Rail', 'Star Rail', 'Benghuai: Xingqiong Tiedao'], aliases: ['Sunday (Honkai: Star Rail)'] },
  { id: 'blade-hsr', name: 'Blade', franchise: 'Honkai: Star Rail', sourceType: SourceType.GAME, franchiseHints: ['Honkai: Star Rail', 'Star Rail', 'Benghuai: Xingqiong Tiedao'], aliases: ['Yingxing', 'Blade (Honkai: Star Rail)'] },
  { id: 'jing-yuan', name: 'Jing Yuan', franchise: 'Honkai: Star Rail', sourceType: SourceType.GAME, franchiseHints: ['Honkai: Star Rail', 'Star Rail', 'Benghuai: Xingqiong Tiedao'], aliases: ['General Jing Yuan'] },
  { id: 'dan-heng-imbibitor-lunae', name: 'Dan Heng', franchise: 'Honkai: Star Rail', sourceType: SourceType.GAME, franchiseHints: ['Honkai: Star Rail', 'Star Rail', 'Benghuai: Xingqiong Tiedao'], aliases: ['Imbibitor Lunae', 'Dan Heng (Imbibitor Lunae)'] },
];
