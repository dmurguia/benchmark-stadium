// Joins the DEMO roster to the DEMO boards (data/competitors.ts) for
// preview-only surfaces. Live boards are fetched from the API instead.
import { roster, boards } from '../data/competitors'
import type { Competitor } from '../types/arena'

/**
 * Joins the roster to the demo rows for one primitive, in rank order.
 * Rank is positional — the board data is already ordered by score.
 */
export function getBoard(primitiveId: string): Competitor[] {
  const rows = boards[primitiveId] ?? []
  const joined: Competitor[] = []
  rows.forEach((row) => {
    const entry = roster.find((r) => r.name === row.name)
    if (entry) joined.push({ ...entry, ...row, rank: joined.length + 1 })
  })
  return joined
}

/** The competitors sitting on the rating-versus-cost Pareto frontier. */
export function frontierOf(rows: Competitor[]): Competitor[] {
  const byCost = [...rows].sort((a, b) => a.costPerDoc - b.costPerDoc)
  const frontier: Competitor[] = []
  let best = -Infinity
  byCost.forEach((row) => {
    if (row.score > best) {
      frontier.push(row)
      best = row.score
    }
  })
  return frontier
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}
