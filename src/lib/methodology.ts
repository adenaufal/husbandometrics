import type { MetricSourceId } from '../types';

/**
 * The methodology text, shared so every design typesets the same claims. Edit
 * here, not in a component: these sentences are the product's promise about
 * what the numbers mean.
 */

export const SOURCE_NOTES: Record<MetricSourceId, string> = {
  anilist: 'Character favourites on AniList. Anime and manga only.',
  mal: 'Character favourites on MyAnimeList, read from its own top-characters board. Anime and manga only.',
  ao3: 'Works filed under the character’s canonical AO3 tag. Pairing tags are excluded.',
  danbooru: 'Posts carrying the character’s Danbooru tag.',
};

export const METHODOLOGY = {
  intro:
    'Every figure on this site is read from a public source at refresh time. There is no sample data and no estimated value: when a source cannot be read, it is marked as not measured and left out of the total rather than counted as zero.',
  scoring:
    'Each source is scored relative to the highest reading on the board for that source, on a log scale — 100 means “the most measured here”, not “the maximum possible”. The counts are heavy-tailed, so a linear scale would leave everyone below the top few indistinguishable. The total is the weighted mean over the sources that returned a reading, with the weights renormalised across them. A character measured by fewer than two sources is left off the board entirely.',
  roster:
    'Anime and manga characters are pulled automatically from AniList’s favourites ranking, filtered to male characters — no hand-picking. Game characters come from a short curated list in the repository, because AniList and MyAnimeList do not catalogue games and would otherwise erase every gacha character. That list decides who is covered; it never supplies their numbers.',
  movement:
    'Scores are relative, so a source failing for the character who holds its peak lifts everyone else’s score on that source. Week-over-week movement is not purely popularity.',
};
