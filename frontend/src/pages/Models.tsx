import { useMemo, useState } from 'react'
import { SearchIcon, ChevronDownIcon } from 'lucide-react'
import { AppShell } from '../components/app/AppShell'
import { PaperTexture } from '../components/brand/PaperTexture'
import { SpecimenChip } from '../components/brand/SpecimenChip'
import { roster, seasonMeta } from '../data/competitors'
import { primitiveById } from '../data/primitives'
import { primitiveIcon } from '../components/workspace/primitiveIcons'
import { getBoard, formatCurrency } from '../utils/boards'
import type { RosterEntry } from '../types/arena'

// This page is a preview surface: the roster below is the design's demo
// dataset (cost/latency/context aren't collected on the live boards yet).
const demoBoardIds = ['journal-entries', 'reconciliation', 'rev-rec', 'flux']

type CostTier = 'any' | 'under-025' | '025-075' | 'over-075'

const costTiers: { id: CostTier; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'under-025', label: 'Under $0.25' },
  { id: '025-075', label: '$0.25 – $0.75' },
  { id: 'over-075', label: 'Over $0.75' },
]

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { id: string; label: string }[]
  onChange: (id: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3">
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="relative flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent pr-5 text-[13px] font-semibold text-ink focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-muted" aria-hidden="true" />
      </span>
    </label>
  )
}

function ModelCard({
  entry,
  primitiveId,
  featured = false,
}: {
  entry: RosterEntry
  primitiveId: string
  featured?: boolean
}) {
  const row = getBoard(primitiveId).find((r) => r.name === entry.name)
  const TopIcon = primitiveIcon(entry.topPrimitive)

  return (
    <article
      className={`flex flex-col rounded-xl border bg-card p-5 shadow-whisper ${
        featured ? 'border-ink/25' : 'border-hairline'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-paper font-mono text-[11px] font-medium text-ink">
            {entry.monogram}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-bold text-ink">{entry.name}</span>
            <span className="block truncate text-[11px] text-muted">{entry.org}</span>
          </span>
        </div>
        <span
          className={`shrink-0 border px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] ${
            entry.kind === 'product'
              ? 'border-needle/40 bg-needle-tint text-needle'
              : 'border-hairline bg-paper text-muted'
          }`}
        >
          {entry.kind}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-hairline pt-3">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">Overall win</dt>
          <dd className="font-display text-[19px] leading-none text-ink">
            {(entry.overallWinRate * 100).toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">On this board</dt>
          <dd className="font-display text-[19px] leading-none text-ink">
            {row ? `#${row.rank}` : '—'}
            <span className="ml-1.5 font-sans text-[11px] font-medium text-muted">
              {row ? row.score : ''}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">Cost / doc</dt>
          <dd className="font-mono text-[12px] tabular-nums text-ink">{formatCurrency(entry.costPerDoc)}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">Median draft</dt>
          <dd className="font-mono text-[12px] tabular-nums text-ink">{entry.latency}s</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">Context</dt>
          <dd className="font-mono text-[12px] tabular-nums text-ink">{entry.contextK}K</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">Judgments</dt>
          <dd className="font-mono text-[12px] tabular-nums text-ink">
            {row ? row.judgments.toLocaleString() : '—'}
          </dd>
        </div>
      </dl>

      <p className="mt-4 flex items-center gap-2 border-t border-hairline pt-3 text-[11.5px] text-muted">
        <TopIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
        Strongest on {primitiveById(entry.topPrimitive).label}
      </p>
      {entry.provenance ? (
        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted/85">{entry.provenance}</p>
      ) : null}
    </article>
  )
}

export function Models() {
  const [query, setQuery] = useState('')
  const [primitive, setPrimitive] = useState('journal-entries')
  const [kind, setKind] = useState<'any' | 'model' | 'product'>('any')
  const [cost, setCost] = useState<CostTier>('any')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return roster.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.org.toLowerCase().includes(q)) return false
      if (kind !== 'any' && r.kind !== kind) return false
      if (cost === 'under-025' && r.costPerDoc >= 0.25) return false
      if (cost === '025-075' && (r.costPerDoc < 0.25 || r.costPerDoc > 0.75)) return false
      if (cost === 'over-075' && r.costPerDoc <= 0.75) return false
      return true
    })
  }, [query, kind, cost])

  const spotlight = useMemo(() => {
    const board = getBoard(primitive)
    return board
      .slice(0, 3)
      .map((row) => roster.find((r) => r.name === row.name))
      .filter((r): r is RosterEntry => Boolean(r))
  }, [primitive])

  return (
    <AppShell>
      <div className="relative min-h-screen">
        <PaperTexture seed={71} />

        <div className="relative mx-auto max-w-[1220px] px-6 py-10 lg:px-10">
          <header className="mx-auto max-w-xl text-center">
            <h1 className="font-display text-[36px] leading-tight text-ink">Models</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Everything competing in the arena, measured by Calibrated Co. across{' '}
              {seasonMeta.judgments.toLocaleString()} verified judgments.
            </p>
            <div className="mt-3 flex justify-center">
              <SpecimenChip tone="rust">Preview · illustrative data</SpecimenChip>
            </div>
            <div className="mt-6 flex items-center gap-2.5 rounded-full border border-hairline bg-card px-4 py-2.5 shadow-whisper">
              <SearchIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              <label htmlFor="model-search" className="sr-only">
                Search models
              </label>
              <input
                id="model-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models and products"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-ink placeholder:text-muted/70 focus:outline-none"
              />
            </div>
          </header>

          {/* Spotlight */}
          <section aria-labelledby="spotlight" className="mt-12">
            <h2 id="spotlight" className="border-b border-hairline pb-2 text-[13px] font-bold text-ink">
              Leading on {primitiveById(primitive).label}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {spotlight.map((entry) => (
                <ModelCard key={entry.name} entry={entry} primitiveId={primitive} featured />
              ))}
            </div>
          </section>

          {/* Filters */}
          <div className="mt-10 flex flex-wrap items-stretch divide-hairline border-y border-hairline bg-panel sm:divide-x">
            <Select
              label="Board"
              value={primitive}
              onChange={setPrimitive}
              options={demoBoardIds.map((id) => ({ id, label: primitiveById(id).label }))}
            />
            <Select
              label="Type"
              value={kind}
              onChange={(v) => setKind(v as 'any' | 'model' | 'product')}
              options={[
                { id: 'any', label: 'Any' },
                { id: 'model', label: 'Foundation model' },
                { id: 'product', label: 'Vendor product' },
              ]}
            />
            <Select
              label="Cost per document"
              value={cost}
              onChange={(v) => setCost(v as CostTier)}
              options={costTiers}
            />
            <div className="flex flex-1 items-end px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                {filtered.length} of {roster.length} shown
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-10 text-center text-[13px] text-muted">
              Nothing matches those filters. Widen the cost range or clear the search.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((entry) => (
                <ModelCard key={entry.name} entry={entry} primitiveId={primitive} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
