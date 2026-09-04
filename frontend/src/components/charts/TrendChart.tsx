
interface TrendChartProps {
  points: { label: string; value: number }[]
  /** Accessible summary of the movement. */
  summary: string
}

/** Flat step-and-bar read-out: labels on the bars, one baseline, no gridlines. */
export function TrendChart({ points, summary }: TrendChartProps) {
  const max = Math.max(...points.map((p) => p.value))

  return (
    <div>
      <div className="flex items-end gap-2.5" role="img" aria-label={summary}>
        {points.map((p, i) => (
          <div key={p.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="font-mono text-[9px] tabular-nums text-muted">{p.value}%</span>
            <span
              className={`w-full ${i === points.length - 1 ? 'bg-needle' : 'bg-ink/70'}`}
              style={{ height: `${(p.value / max) * 104}px` }}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{p.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-1 h-px w-full bg-ink/40" />
    </div>
  )
}
