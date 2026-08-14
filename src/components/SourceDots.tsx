import React from 'react';
import { METRIC_SOURCES, METRIC_SOURCE_LABELS, type MetricSourceId } from '../types';

interface SourceDotsProps {
  measured: MetricSourceId[];
  size?: 'sm' | 'md';
}

/**
 * Which of the four sources actually returned a reading for this character.
 *
 * On the board this is the difference between a total averaged over four
 * measurements and one averaged over two. Without it, a character scored on AO3
 * and Danbooru alone looks exactly as authoritative as one every source agreed
 * on, which is the single most misleading thing this page could do.
 */
const SourceDots: React.FC<SourceDotsProps> = ({ measured, size = 'md' }) => {
  const dot = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const label = `${measured.map((source) => METRIC_SOURCE_LABELS[source]).join(', ') || 'none'} — ${measured.length}/${METRIC_SOURCES.length}`;

  return (
    <span className="inline-flex items-center gap-1" title={label} aria-label={label} role="img">
      {METRIC_SOURCES.map((source) => (
        <span
          key={source}
          className={`${dot} rounded-full ${
            measured.includes(source)
              ? 'bg-ink-light/70 dark:bg-ink-dark/70'
              : 'bg-transparent ring-1 ring-inset ring-muted-light/45 dark:ring-muted-dark/45'
          }`}
        />
      ))}
    </span>
  );
};

export default SourceDots;
