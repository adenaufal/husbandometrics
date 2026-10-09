import React, { useId } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Character } from '../types';
import { useTranslation } from '../lib/i18n';
import { useBoard } from '../lib/board-context';
import { readingSeries } from '../lib/board';
import { useMagStrings } from './strings';
import { SOURCE_SHORT, fromLabel, longDate, score, shortDate } from './format';

const DAY = 86_400_000;

/** Calendar ticks - the 1st and 15th, or just the 1st over a long span. */
const calendarTicks = (min: number, max: number) => {
  const days = max - min > 120 * DAY ? [1] : [1, 15];
  const ticks: number[] = [];
  const start = new Date(min);
  let year = start.getUTCFullYear();
  let month = start.getUTCMonth();
  while (Date.UTC(year, month, 1) <= max) {
    days.forEach((day) => {
      const at = Date.UTC(year, month, day);
      if (at >= min && at <= max) ticks.push(at);
    });
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return ticks;
};

const SquareDot = ({ cx, cy, size = 5 }: { cx?: number; cy?: number; size?: number }) =>
  cx === undefined || cy === undefined ? null : (
    <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} fill="currentColor" />
  );

/**
 * Every reading of the total, as an ink line on the board's shared vertical
 * scale. The x axis is time, so irregular gaps between refreshes stay visible,
 * and the day a source started being read is marked: the total jumps there for
 * reasons of method, not popularity.
 */
const HistoryChart: React.FC<{ character: Character }> = ({ character }) => {
  const { t, language } = useTranslation();
  const s = useMagStrings();
  const board = useBoard();
  const headId = useId();
  const series = readingSeries(character);

  const head = (
    <h3 id={headId} className="flex items-baseline gap-3 border-b-2 border-mag-ink pb-1.5">
      <span lang="ja" className="font-mag-jp text-[15px] font-black">
        計測の推移
      </span>
      <span className="mag-label">{s('readings')}</span>
    </h3>
  );

  if (series.length < 2) {
    return (
      <section aria-labelledby={headId} className="mt-10">
        {head}
        <p className="mt-3 text-[14px] font-bold">{t('noHistoryTitle')}</p>
        <p className="mt-1 text-[13px] text-mag-muted">{t('noHistoryHint')}</p>
      </section>
    );
  }

  const data = series.map((point) => ({ t: point.date.getTime(), total: point.total }));
  const min = data[0].t;
  const max = data[data.length - 1].t;
  const [lo, hi] = board.domain;
  const yTicks = Array.from({ length: 10 }, (_, index) => index * 10).filter(
    (tick) => tick >= lo && tick <= hi,
  );

  // Only mark a late source if it reached this character's total.
  const markers = board.readings.lateStarts.filter(({ source, label }) => {
    const at = fromLabel(label).getTime();
    return at > min && at <= max && series.some((point) => point.scores[source] !== null);
  });

  const first = series[0];
  const last = series[series.length - 1];

  return (
    <section aria-labelledby={headId} className="mt-10">
      {head}

      <div
        role="img"
        aria-label={s('chartLabel', {
          n: series.length,
          from: longDate(first.date, language),
          to: longDate(last.date, language),
          first: score(first.total),
          last: score(last.total),
        })}
        className="mag-chart mt-3 h-[208px] text-mag-ink"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 24, right: 14, bottom: 2, left: 0 }} accessibilityLayer={false}>
            <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.14} />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={[min, max]}
              ticks={calendarTicks(min, max)}
              tickFormatter={(value: number) => shortDate(new Date(value), language)}
              stroke="currentColor"
              tickMargin={6}
              tickSize={4}
            />
            <YAxis
              domain={[lo, hi]}
              ticks={yTicks}
              width={30}
              stroke="currentColor"
              tickMargin={4}
              tickSize={4}
              allowDataOverflow
            />
            {markers.map((marker) => (
              <ReferenceLine
                key={marker.source}
                x={fromLabel(marker.label).getTime()}
                stroke="currentColor"
                strokeDasharray="3 3"
                label={(props: { viewBox?: { x?: number; y?: number } }) =>
                  props.viewBox?.x === undefined ? (
                    <g />
                  ) : (
                    <text
                      x={props.viewBox.x + 5}
                      y={(props.viewBox.y ?? 0) - 8}
                      fill="currentColor"
                      fontSize={11}
                      fontWeight={700}
                    >
                      {s('readFromHere', { source: SOURCE_SHORT[marker.source] })}
                    </text>
                  )
                }
              />
            ))}
            <Tooltip
              isAnimationActive={false}
              cursor={{ stroke: 'currentColor', strokeOpacity: 0.35 }}
              content={({ active, payload }) => {
                const point = active ? (payload?.[0]?.payload as { t: number; total: number } | undefined) : undefined;
                if (!point) return null;
                return (
                  <div className="border-2 border-mag-ink bg-mag-paper px-2.5 py-1.5 text-[12px] tabular-nums text-mag-ink">
                    <span className="text-mag-muted">{longDate(new Date(point.t), language)}</span>
                    <span className="ml-2 font-bold">{score(point.total)}</span>
                  </div>
                );
              }}
            />
            <Line
              type="linear"
              dataKey="total"
              stroke="currentColor"
              strokeWidth={1.75}
              dot={(props) => <SquareDot cx={props.cx} cy={props.cy} />}
              activeDot={(props) => <SquareDot cx={props.cx} cy={props.cy} size={9} />}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-mag-muted">
        {s('chartCaption', { lo, hi })}
      </p>

      <table className="sr-only">
        <caption>{s('readings')}</caption>
        <thead>
          <tr>
            <th scope="col">{s('readingDate')}</th>
            <th scope="col">{t('totalScore')}</th>
          </tr>
        </thead>
        <tbody>
          {series.map((point) => (
            <tr key={point.label}>
              <td>{longDate(point.date, language)}</td>
              <td>{score(point.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default HistoryChart;
