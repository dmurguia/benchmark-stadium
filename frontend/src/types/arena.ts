export type CompetitorKind = 'model' | 'product'

/** A competitor's stable identity and commercial characteristics (demo roster). */
export interface RosterEntry {
  name: string
  org: string
  kind: CompetitorKind
  monogram: string
  /** Blended cost per judged document, in USD. */
  costPerDoc: number
  /** Median seconds to produce one draft. */
  latency: number
  /** Context window, in thousands of tokens. */
  contextK: number
  overallWinRate: number
  topPrimitive: string
  provenance?: string
}

/** A competitor's measured result on one primitive (demo boards). */
export interface BoardRow {
  name: string
  score: number
  ciLow: number
  ciHigh: number
  judgments: number
  winRate: number
  previousRank: number
}

/** A roster entry joined to its result on the selected primitive. */
export interface Competitor extends RosterEntry, BoardRow {
  rank: number
}

export interface EmptyChair {
  name: string
  note: string
}

export interface ReleaseRadarEntry {
  name: string
  released: string
  primitive: string
  from: number
  to: number
}

export type ProjectStatus = 'in-review' | 'calibrated' | 'complete'

export interface Project {
  id: string
  prompt: string
  primitive: string
  status: ProjectStatus
  created: string
  activity: string
  comparisons: number
  leader: string | null
}
