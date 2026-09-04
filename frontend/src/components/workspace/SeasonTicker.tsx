import { roster } from '../../data/competitors'

/**
 * A quiet reminder of who is competing right now, sitting under the chips the
 * way the cohort strip used to sit under the hero.
 */
export function SeasonTicker() {
  const shown = roster.slice(0, 5)
  return (
    <div className="mx-auto flex max-w-[720px] flex-wrap items-center justify-center gap-x-0 gap-y-2 border-y border-hairline">
      <span className="px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
        Competing this season
      </span>
      {shown.map((c) => (
        <span
          key={c.name}
          className="flex items-center gap-1.5 border-l border-hairline px-3 py-2.5 text-[12px] font-semibold text-ink"
        >
          {c.name}
          {c.kind === 'product' ? (
            <span className="border border-needle/40 bg-needle-tint px-1 py-px font-mono text-[8px] uppercase tracking-[0.12em] text-needle">
              Product
            </span>
          ) : null}
        </span>
      ))}
      <span className="border-l border-hairline px-3 py-2.5 text-[12px] font-semibold text-muted">+13 more</span>
    </div>
  )
}
