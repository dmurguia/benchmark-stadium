
/** Minimum a bar needs — live rows and demo rows both satisfy this. */
export interface BoardChartRow {
  rank: number
  name: string
  score: number
  kind?: string
}

interface BoardChartProps {
  rows: BoardChartRow[]
  /** Name of the competitor drawn in rust. */
  highlight?: string
  labelWidth?: string
}

/**
 * The chart law: flat ink-gray bars, one rust bar for the highlighted
 * competitor, values labeled directly on the bars, a single baseline
 * hairline, no gridlines, no shadows.
 */
export function BoardChart({ rows, highlight, labelWidth = '190px' }: BoardChartProps) {
  if (rows.length === 0) return null
  const max = Math.max(...rows.map((r) => r.score))
  const min = Math.min(...rows.map((r) => r.score))
  const span = Math.max(max - min, 1)

  return (
    <div>
      {rows.map((row) => {
        const isHighlight = row.name === highlight
        const width = 26 + ((row.score - min) / span) * 74
        return (
          <div key={row.name} className="flex items-center gap-4 border-l border-hairline py-[7px] pl-4">
            <div
              className="shrink-0 truncate text-[13px] font-semibold text-ink"
              style={{ width: labelWidth }}
              title={row.name}
            >
              <span className="mr-2 font-mono text-[10px] font-normal text-muted">
                {String(row.rank).padStart(2, '0')}
              </span>
              {row.name}
              {row.kind === 'product' ? (
                <span className="ml-2 border border-rust/40 bg-rust-tint px-1 py-px align-middle font-mono text-[9px] uppercase tracking-[0.12em] text-rust">
                  Product
                </span>
              ) : null}
            </div>
            <div className="relative min-w-0 flex-1">
              <div
                className={`flex h-6 items-center justify-end pr-2 ${
                  isHighlight ? 'bg-rust' : 'bg-ink/70'
                }`}
                style={{ width: `${width}%` }}
              >
                <span className="font-mono text-[10px] tracking-[0.08em] text-paper">{row.score}</span>
              </div>
            </div>
          </div>
        )
      })}
      <div className="ml-0 h-px w-full bg-ink/40" />
    </div>
  )
}
