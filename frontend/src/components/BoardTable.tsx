
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { Chip } from './ui';
import type { Competitor } from '../data/leaderboards';

function DeltaCell({ delta }: {delta: number;}) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[12.5px] text-muted">
        <MinusIcon className="h-3 w-3" aria-hidden="true" />
        <span className="sr-only">No change</span>
      </span>);

  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[12.5px] font-bold tabular-nums ${
      up ? 'text-forest' : 'text-rust'}`
      }>
      
      {up ?
      <ArrowUpIcon className="h-3 w-3" aria-hidden="true" /> :

      <ArrowDownIcon className="h-3 w-3" aria-hidden="true" />
      }
      {Math.abs(delta)}
      <span className="sr-only">{up ? 'places up' : 'places down'}</span>
    </span>);

}

export function BoardTable({ rows }: {rows: Competitor[];}) {
  const max = Math.max(...rows.map((r) => r.score));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline bg-panel/60">
            {['Rank', 'Δ', 'Competitor', 'Score', '95% CI', 'Judgments', 'Win rate'].map((h) =>
            <th
              key={h}
              scope="col"
              className={`px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted ${
              h === 'Rank' || h === 'Δ' ? 'w-16' : ''}`
              }>
              
                {h}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
          <tr key={row.name} className="border-b border-hairline last:border-b-0">
              <td className="px-4 py-3.5 text-[14px] font-bold tabular-nums text-ink">
                {row.rank}
              </td>
              <td className="px-4 py-3.5">
                <DeltaCell delta={row.delta} />
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-ink">{row.name}</span>
                  {row.isProduct ? <Chip tone="rust">PRODUCT</Chip> : null}
                </div>
                <p className="mt-0.5 text-[12px] text-muted">
                  {row.isProduct ? row.provenance : row.org}
                </p>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-10 text-[14px] font-bold tabular-nums text-ink">
                    {row.score}
                  </span>
                  <span
                  aria-hidden="true"
                  className="h-1 w-full min-w-[80px] max-w-[220px] overflow-hidden rounded-full bg-hairline">
                  
                    <span
                    className="block h-full rounded-full bg-forest"
                    style={{ width: `${Math.round(row.score / max * 100)}%` }} />
                  
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-[13px] tabular-nums text-muted">{row.ci}</td>
              <td className="px-4 py-3.5 text-[13px] tabular-nums text-muted">
                {row.judgments.toLocaleString('en-US')}
              </td>
              <td className="px-4 py-3.5 text-[13px] tabular-nums text-muted">{row.winRate}%</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}