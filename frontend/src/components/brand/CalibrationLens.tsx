import { useEffect, useMemo, useState } from 'react'
import { getBoard } from '../../utils/boards'

const ENGRAVING =
  'https://cdn.magicpatterns.com/patterns/generated-images/f93785a2-ba0c-48be-b574-18ee59280b24.jpg'

interface CalibrationLensProps {
  /** Lens radius in px. */
  radius?: number
  /** How strongly the engraving reads against the paper ground. */
  intensity?: number
}

interface Readout {
  name: string
  score: number
  ci: number
  rank: number
  delta: number
  winRate: number
}

/**
 * The signature interaction, and the page's ground. A period merchant-waterfront
 * engraving sits far back behind everything; the pointer carries a small
 * calibration lens that locally resolves the drawing into the measurements
 * behind it. Both layers stay faint on purpose — the page has to stay readable,
 * so this is atmosphere you can interrogate, never the main event.
 */
export function CalibrationLens({ radius = 78, intensity = 0.13 }: CalibrationLensProps) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)
  const [pinned, setPinned] = useState(false)

  const readouts = useMemo<Readout[]>(() => {
    const rows = getBoard('journal-entries')
    return rows.map((row) => ({
      name: row.name,
      score: row.score,
      ci: Math.round((row.ciHigh - row.ciLow) / 2),
      rank: row.rank,
      delta: row.previousRank - row.rank,
      winRate: row.winRate,
    }))
  }, [])

  // Devices without hover, and readers who ask for less motion, get one fixed
  // already-resolved pool instead of a pointer-tracked one.
  useEffect(() => {
    const noHover = window.matchMedia('(hover: none)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const settle = () => {
      if (noHover.matches || reduced.matches) {
        setPinned(true)
        setPoint({ x: window.innerWidth * 0.82, y: window.innerHeight * 0.28 })
      } else {
        setPinned(false)
        setPoint(null)
      }
    }

    settle()
    noHover.addEventListener('change', settle)
    reduced.addEventListener('change', settle)
    return () => {
      noHover.removeEventListener('change', settle)
      reduced.removeEventListener('change', settle)
    }
  }, [])

  useEffect(() => {
    if (pinned) return
    const onMove = (e: PointerEvent) => setPoint({ x: e.clientX, y: e.clientY })
    const onLeave = () => setPoint(null)
    window.addEventListener('pointermove', onMove)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [pinned])

  // Solid through most of the lens, with a short feather at the rim so the
  // readout dissolves back into paper instead of cutting off.
  const mask = point
    ? `radial-gradient(circle at ${point.x}px ${point.y}px, #000 0 ${radius - 14}px, transparent ${radius}px)`
    : 'radial-gradient(circle at -600px -600px, #000 0 1px, transparent 2px)'

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1 — the drawing */}
      <img
        src={ENGRAVING}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: intensity, filter: 'grayscale(1) contrast(1.12)' }}
      />

      {/* 3 — the measurements, clipped to the lens (2) */}
      <div
        className="absolute inset-0 bg-paper"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      >
        <div className="grid h-full w-full grid-cols-4 content-start gap-x-5 gap-y-3.5 p-5 md:grid-cols-6 lg:grid-cols-8">
          {readouts.concat(readouts, readouts).map((r, i) => (
            <div key={`${r.name}-${i}`} className="border-t border-hairline pt-1.5">
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{r.name}</p>
              <p className="mt-0.5 font-mono text-[11px] tabular-nums text-ink">
                {r.score}
                <span className="text-muted"> ±{r.ci}</span>
              </p>
              <p className="font-mono text-[9px] tabular-nums text-muted">
                RK {String(r.rank).padStart(2, '0')}
                <span className={r.delta > 0 ? 'text-spruce' : r.delta < 0 ? 'text-needle' : ''}>
                  {r.delta > 0 ? ` ▲${r.delta}` : r.delta < 0 ? ` ▼${Math.abs(r.delta)}` : ' —'}
                </span>
                <span className="ml-2">{(r.winRate * 100).toFixed(1)}%</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* the lens edge — one hairline ring, flat */}
      {point ? (
        <span
          className="absolute rounded-full border border-needle/50"
          style={{
            left: point.x - radius,
            top: point.y - radius,
            width: radius * 2,
            height: radius * 2,
          }}
        />
      ) : null}
    </div>
  )
}
