import type { SyntheticEvent } from 'react';

/**
 * Portraits come from AniList, which has no entry for some game characters. A
 * generated monogram stands in for them.
 *
 * It is drawn rather than fetched on purpose: a stock photo of an unrelated
 * subject would read as "this is him", and this board should not show anything
 * it cannot back up.
 */
const monogram = (name: string) => {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#1e293b"/>
    <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="#64748b"
      font-family="system-ui, sans-serif" font-size="150" font-weight="700">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/** Never returns an empty string: `src=""` makes the browser refetch the page. */
export const characterImage = (imageUrl: string | null | undefined, name: string) =>
  imageUrl && imageUrl.trim() ? imageUrl : monogram(name);

/** Covers a URL that exists but fails to load, e.g. a portrait pulled upstream. */
export const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = monogram(image.alt || '?');
};
