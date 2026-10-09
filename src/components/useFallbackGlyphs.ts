import { useEffect } from 'react';

const PRIMARY = 'Zen Kaku Gothic New';

const parseRanges = (value: string) =>
  value
    .split(',')
    .map((part) => part.trim().replace(/^U\+/i, ''))
    .filter(Boolean)
    .map((part): [number, number] => {
      if (part.includes('?')) {
        return [parseInt(part.replace(/\?/g, '0'), 16), parseInt(part.replace(/\?/g, 'F'), 16)];
      }
      const [low, high] = part.split('-');
      return [parseInt(low, 16), parseInt(high ?? low, 16)];
    });

const isHangul = (codePoint: number) => codePoint >= 0xac00 && codePoint <= 0xd7af;

/**
 * Zen Kaku Gothic New is a Japanese face. A few names on the board are Chinese
 * (达达利亚) or Korean (성진우) and use glyphs it does not carry, which the
 * browser would otherwise borrow from a system font at the wrong weight - one
 * thin character in the middle of a black vertical name.
 *
 * Once Zen Kaku's own coverage is known (its @font-face unicode ranges), only
 * the glyphs it lacks are requested from Noto Sans SC / KR through Google
 * Fonts' text= subsetting: a few kilobytes, and nothing at all when every name
 * is covered.
 *
 * The coverage comes from the stylesheet index.html marks with data-fonts.
 */
export const useFallbackGlyphs = (texts: string[]) => {
  const key = texts.join('');

  useEffect(() => {
    if (!key) return undefined;
    let cancelled = false;

    const resolve = () => {
      if (cancelled) return;
      const faces = Array.from(document.fonts).filter(
        (face) => face.family.replace(/["']/g, '') === PRIMARY,
      );
      if (faces.length === 0) return;
      const ranges = faces.flatMap((face) => parseRanges(face.unicodeRange));

      const han = new Set<string>();
      const hangul = new Set<string>();
      new Set(Array.from(key)).forEach((glyph) => {
        const codePoint = glyph.codePointAt(0) ?? 0;
        if (codePoint < 0x2e80) return;
        if (ranges.some(([low, high]) => codePoint >= low && codePoint <= high)) return;
        (isHangul(codePoint) ? hangul : han).add(glyph);
      });
      if (han.size === 0 && hangul.size === 0) return;

      const families = [
        han.size > 0 && 'family=Noto+Sans+SC:wght@500;700;900',
        hangul.size > 0 && 'family=Noto+Sans+KR:wght@500;700;900',
      ].filter(Boolean);
      const text = encodeURIComponent([...han, ...hangul].join(''));
      const href = `https://fonts.googleapis.com/css2?${families.join('&')}&text=${text}&display=swap`;
      if (document.querySelector(`link[data-stylesheet="${href}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.stylesheet = href;
      document.head.appendChild(link);
    };

    const primary = document.querySelector<HTMLLinkElement>('link[data-fonts]');
    if (primary?.sheet) resolve();
    else primary?.addEventListener('load', resolve, { once: true });

    return () => {
      cancelled = true;
      primary?.removeEventListener('load', resolve);
    };
  }, [key]);
};
