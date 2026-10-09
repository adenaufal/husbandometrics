import type { MetricSourceId } from '../types';

/**
 * Days on which characters started being measured differently - a corrected
 * tag, a source read for the first time - so their totals step for reasons of
 * method, not popularity.
 *
 * Recorded by hand alongside the correction that caused it. The history keeps
 * scores but not the tags or counts behind them, so nothing on the page could
 * work this out by itself. The chart marks each day, and movement is not
 * compared across it.
 */
export interface Remeasurement {
  /** The first refresh read the new way, as a history label. */
  label: string;
  /** One sentence for the methodology column. */
  note: string;
  /** Who was re-measured, and on which sources. */
  characters: Readonly<Record<string, readonly MetricSourceId[]>>;
}

export const REMEASURED: readonly Remeasurement[] = [
  {
    label: '2026-10-09',
    note: 'On 9 October 2026, 51 remembered AO3 and Danbooru tags were found to name other characters — Lelouch had been counted under Rem’s — and every tag was resolved again by name. Gon and Kyou Souma were read on AO3 for the first time.',
    characters: {
      'chrollo-lucilfer': ['ao3'],
      'edward-elric': ['ao3', 'danbooru'],
      'eren-yeager': ['danbooru'],
      'gintoki-sakata': ['ao3', 'danbooru'],
      'gon-freecss': ['ao3'],
      'hachiman-hikigaya': ['danbooru'],
      'hisoka-morow': ['ao3'],
      'izumi-miyamura': ['danbooru'],
      'jing-yuan': ['danbooru'],
      'johan-liebert': ['ao3', 'danbooru'],
      'joseph-joestar': ['ao3', 'danbooru'],
      'joutarou-kuujou': ['ao3', 'danbooru'],
      'kakashi-hatake': ['ao3', 'danbooru'],
      'karma-akabane': ['danbooru'],
      'kiyotaka-ayanokouji': ['danbooru'],
      'koro-sensei': ['ao3', 'danbooru'],
      'kyou-souma': ['ao3'],
      'kyoujurou-rengoku': ['danbooru'],
      'l-lawliet': ['ao3', 'danbooru'],
      'law-trafalgar': ['danbooru'],
      'lelouch-lamperouge': ['ao3', 'danbooru'],
      'light-yagami': ['ao3', 'danbooru'],
      'loid-forger': ['ao3'],
      'luffy-monkey': ['ao3', 'danbooru'],
      'manjirou-sano': ['ao3', 'danbooru'],
      'miyuki-shirogane': ['danbooru'],
      'musashi-miyamoto': ['ao3'],
      ray: ['danbooru'],
      'rintarou-okabe': ['ao3', 'danbooru'],
      'senkuu-ishigami': ['ao3', 'danbooru'],
      'shigeo-kageyama': ['danbooru'],
      'shouya-ishida': ['danbooru'],
      'shouyou-hinata': ['danbooru'],
      'tanjirou-kamado': ['danbooru'],
      'thorfinn-karlsefni': ['ao3'],
      'yami-sukehiro': ['danbooru'],
      'yuu-ishigami': ['danbooru'],
      'yuu-nishinoya': ['danbooru'],
      'zoro-roronoa': ['danbooru'],
    },
  },
];
