import { useState } from 'react'
import type { Competitor } from '../../types/arena'
import { frontierOf, formatCurrency } from '../../utils/boards'

interface FrontierChartProps {
  rows: Competitor[]
}

const W = 720
const H = 340
const PAD = { top: 24, right: 28, bottom: 44, left: 52 }

/**
 * Rating against cost per judged document. Flat ink dots, the frontier drawn
 * as a stepped hairline, frontier holders in needle orange, values labeled
 * directly. No gridlines.
 */
export function FrontierChart({ rows }: FrontierChartProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  if (rows.length === 0) return null

  const costs = rows.map((r) => r.costPerDoc)
  const scores = rows.map((r) => r.score)
  const minCost = 0
  const maxCost = Math.max(...costs) * 1.12
  const minScore = Math.min(...scores) - 30
  const maxScore = Math.max(...scores) + 30

  const x = (c: number) => PAD.left + ((c - minCost) / (maxCost - minCost)) * (W - PAD.left - PAD.right)
  const y = (s: number) => H - PAD.bottom - ((s - minScore) / (maxScore - minScore)) * (H - PAD.top - PAD.bottom)

  const frontier = frontierOf(rows)
  const frontierNames = new Set(frontier.map((f) => f.name))

  // Stepped frontier path: move right at constant rating, then up to the next holder.
  const path = frontier
    .map((f, i) => {
      const px = x(f.costPerDoc)
      const py = y(f.score)
      if (i === 0) return `M ${px} ${H - PAD.bottom} L ${px} ${py}`
      const prev = frontier[i - 1]
      return `L ${px} ${y(prev.score)} L ${px} ${py}`
    })
    .join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Rating against cost per document, with the Pareto frontier">
        {/* single baseline pair, no gridlines */}
        <line x1={PAD.left} y1={PAD.top - 8} x2={PAD.left} y2={H - PAD.bottom} stroke="#1c1e1a" strokeWidth="1" opacity="0.45" />
        <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#1c1e1a" strokeWidth="1" opacity="0.45" />

        <path d={path} fill="none" stroke="#6d7069" strokeWidth="1" strokeDasharray="3 4" />

        {rows.map((r) => {
          const onFrontier = frontierNames.has(r.name)
          const isHovered = hovered === r.name
          return (
            <g
              key={r.name}
              onMouseEnter={() => setHovered(r.name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'default' }}
            >
              {r.kind === 'product' ? (
                <rect
                  x={x(r.costPerDoc) - 4.5}
                  y={y(r.score) - 4.5}
                  width="9"
                  height="9"
                  fill={onFrontier ? '#c14a24' : '#1c1e1a'}
                  opacity={onFrontier ? 1 : 0.72}
                />
              ) : (
                <circle
                  cx={x(r.costPerDoc)}
                  cy={y(r.score)}
                  r="5"
                  fill={onFrontier ? '#c14a24' : '#1c1e1a'}
                  opacity={onFrontier ? 1 : 0.72}
                />
              )}
              <text
                x={x(r.costPerDoc) + 9}
                y={y(r.score) + 3.5}
                fontSize="10"
                fontFamily="Schibsted Grotesk, sans-serif"
                fontWeight={onFrontier ? 700 : 500}
                fill={onFrontier ? '#c14a24' : '#1c1e1a'}
                opacity={isHovered || onFrontier ? 1 : 0.7}
              >
                {r.name}
              </text>
              {isHovered || onFrontier ? (
                <text
                  x={x(r.costPerDoc) + 9}
                  y={y(r.score) + 16}
                  fontSize="9"
                  fontFamily="IBM Plex Mono, monospace"
                  fill="#6d7069"
                >
                  {r.score} · {formatCurrency(r.costPerDoc)}/doc
                </text>
              ) : null}
            </g>
          )
        })}

        <text x={PAD.left - 8} y={PAD.top} fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fill="#6d7069">
          {Math.round(maxScore)}
        </text>
        <text x={PAD.left - 8} y={H - PAD.bottom} fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fill="#6d7069">
          {Math.round(minScore)}
        </text>
        <text x={PAD.left} y={H - 14} fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="#6d7069">
          $0.00
        </text>
        <text x={W - PAD.right} y={H - 14} fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono, monospace" fill="#6d7069">
          COST PER JUDGED DOCUMENT →
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-hairline pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-needle" aria-hidden="true" />
          On the frontier
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/70" aria-hidden="true" />
          Model
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-ink/70" aria-hidden="true" />
          Vendor product
        </span>
      </div>
    </div>
  )
}
