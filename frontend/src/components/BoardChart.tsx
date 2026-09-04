
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import type { Competitor } from '../data/leaderboards';

export type Metric = 'score' | 'winRate';

const PLOT_HEIGHT = 300;
const LABEL_HEIGHT = 88;

function initials(name: string) {
  return name.
  replace(/[^A-Za-z0-9 ]/g, '').
  split(' ').
  filter(Boolean).
  slice(0, 2).
  map((w) => w[0]).
  join('').
  toUpperCase();
}

function barTone(row: Competitor) {
  if (row.rank === 1) return 'bg-forest text-paper';
  if (row.rank === 2) return 'bg-[#5f7a63] text-paper';
  if (row.rank === 3) return 'bg-[#8ea38d] text-ink';
  if (row.isProduct) return 'bg-[#e0cabe] text-ink';
  return 'bg-[#ddd6ca] text-ink';
}

/** Rounded axis domain so every bar is measured against the same normalized scale. */
function domainFor(metric: Metric, values: number[]) {
  if (metric === 'winRate') {
    return { floor: 0, ceil: 100, step: 25, suffix: '%' };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = 100;
  const floor = Math.max(0, Math.floor((min - (max - min) * 0.45) / step) * step);
  const ceil = Math.ceil((max + (max - min) * 0.12) / step) * step;
  return { floor, ceil, step, suffix: '' };
}

export function BoardChart({ rows, metric }: {rows: Competitor[];metric: Metric;}) {
  const values = rows.map((r) => metric === 'score' ? r.score : r.winRate);
  const { floor, ceil, step, suffix } = domainFor(metric, values);
  const range = Math.max(ceil - floor, 1);

  const ticks: number[] = [];
  for (let t = floor; t <= ceil; t += step) ticks.push(t);

  const pct = (value: number) => (value - floor) / range * 100;

  return (
    <div className="overflow-x-auto px-5 pb-5 pt-6">
      <div className="flex min-w-[760px] gap-3">
        <div className="w-11 shrink-0">
          <div className="relative" style={{ height: PLOT_HEIGHT }}>
            {ticks.map((tick) =>
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 text-[10px] font-semibold tabular-nums text-muted"
              style={{ bottom: `${pct(tick)}%` }}>
              
                {tick}
                {suffix}
              </span>
            )}
          </div>
          <div style={{ height: LABEL_HEIGHT }} />
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{ height: PLOT_HEIGHT }}>
            
            {ticks.map((tick) =>
            <span
              key={tick}
              className={`absolute inset-x-0 border-t ${
              tick === floor ? 'border-hairline' : 'border-hairline/60'}`
              }
              style={{ bottom: `${pct(tick)}%` }} />

            )}
          </div>

          <ol
            className="relative flex items-stretch gap-3"
            aria-label={metric === 'score' ? 'Scores by competitor' : 'Win rate by competitor'}>
            
            {rows.map((row) => {
              const value = metric === 'score' ? row.score : row.winRate;
              const up = row.delta > 0;
              return (
                <li key={row.name} className="flex min-w-[64px] flex-1 flex-col">
                  <div className="flex" style={{ height: PLOT_HEIGHT }}>
                    <div
                      className={`mt-auto flex w-full flex-col items-center justify-between rounded-t-md px-1 pb-2 pt-2 ${barTone(row)}`}
                      style={{ height: `${pct(value)}%` }}
                      title={row.isProduct ? row.provenance : `${row.name} — ${row.org}`}>
                      
                      <span className="text-[13px] font-bold tabular-nums">
                        {value}
                        {suffix}
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-card text-[10px] font-bold text-ink">
                        
                        {initials(row.name)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex flex-col items-center gap-0.5 pt-2.5 text-center"
                    style={{ height: LABEL_HEIGHT }}>
                    
                    <p className="text-[12px] font-bold leading-tight text-ink">{row.name}</p>
                    <p className="text-[10.5px] leading-tight text-muted">{row.org}</p>
                    <div className="mt-auto flex h-4 items-center gap-1.5">
                      {row.isProduct ?
                      <span className="rounded-full border border-[#e0c4b9] bg-rust-tint px-1.5 py-px text-[9px] font-bold tracking-wide text-rust">
                          PRODUCT
                        </span> :
                      null}
                      {row.delta !== 0 ?
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10.5px] font-bold tabular-nums ${
                        up ? 'text-forest' : 'text-rust'}`
                        }>
                        
                          {up ?
                        <ArrowUpIcon className="h-3 w-3" aria-hidden="true" /> :

                        <ArrowDownIcon className="h-3 w-3" aria-hidden="true" />
                        }
                          {Math.abs(row.delta)}
                        </span> :
                      null}
                    </div>
                  </div>
                </li>);

            })}
          </ol>
        </div>
      </div>
    </div>);

}