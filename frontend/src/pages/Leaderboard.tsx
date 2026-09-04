import { useEffect, useMemo, useState } from 'react'
import { ArrowUpIcon, ArrowDownIcon, BarChart3Icon, ScatterChartIcon, TableIcon, MinusIcon, ZapIcon } from 'lucide-react'
import { AppShell } from '../components/app/AppShell'
import { PaperTexture } from '../components/brand/PaperTexture'
import { SpecimenChip } from '../components/brand/SpecimenChip'
import { BoardChart } from '../components/charts/BoardChart'
import { FrontierChart } from '../components/charts/FrontierChart'
import { TrendChart } from '../components/charts/TrendChart'
import { accuracyTrend, seasonMeta } from '../data/competitors'
import { primitives, primitiveById } from '../data/primitives'
import { primitiveIcon } from '../components/workspace/primitiveIcons'
import { getBoard } from '../utils/boards'
import { api, type LeaderboardOut, type ReleaseOut } from '../lib/api'
import { toLiveRow, toEmptyChair, toRadarEntries, type LiveRow } from '../lib/view'
import { useAuth } from '../lib/auth'
import type { ReleaseRadarEntry } from '../types/arena'

function Movement({ from, to }: { from: number; to: number }) {
  const up = to < from
  const flat = to === from
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.1em] ${
        flat
          ? 'border-hairline bg-card text-muted'
          : up
            ? 'border-spruce/25 bg-moss text-spruce'
            : 'border-needle/30 bg-needle-tint text-needle'
      }`}
    >
      {from} → {to}
      {flat ? (
        <MinusIcon className="h-2.5 w-2.5" aria-hidden="true" />
      ) : up ? (
        <ArrowUpIcon className="h-2.5 w-2.5" aria-hidden="true" />
      ) : (
        <ArrowDownIcon className="h-2.5 w-2.5" aria-hidden="true" />
      )}
    </span>
  )
}

export function Leaderboard() {
  const [primitive, setPrimitive] = useState('journal-entries')
  const [view, setView] = useState<'chart' | 'frontier' | 'table'>('chart')
  const [board, setBoard] = useState<LeaderboardOut | null>(null)
  const [radar, setRadar] = useState<ReleaseRadarEntry[]>([])
  const [simulating, setSimulating] = useState(false)
  const { requestAuth } = useAuth()

  const active = primitiveById(primitive)

  const loadBoard = (category: string) => {
    api<LeaderboardOut>(`/api/leaderboard/${category}`)
      .then(setBoard)
      .catch(() => setBoard(null))
  }

  const loadReleases = () => {
    api<ReleaseOut[]>('/api/releases?limit=3')
      .then((rs) => setRadar(rs.flatMap(toRadarEntries).slice(0, 4)))
      .catch(() => setRadar([]))
  }

  useEffect(() => {
    if (active.category) loadBoard(active.category)
  }, [active.category])

  useEffect(loadReleases, [])

  const simulate = async () => {
    if (simulating) return
    setSimulating(true)
    try {
      await api('/api/releases/simulate', { method: 'POST', body: JSON.stringify({}) })
      loadReleases()
      if (active.category) loadBoard(active.category)
    } catch {
      /* dev convenience only */
    } finally {
      setSimulating(false)
    }
  }

  const rows: LiveRow[] = useMemo(() => (board ? board.entries.map(toLiveRow) : []), [board])
  const chairs = useMemo(() => (board ? board.declined.map(toEmptyChair) : []), [board])
  const leader = rows[0]
  const topProduct = rows.find((r) => r.kind === 'product')
  const judgments = board?.vote_count ?? 0
  const demoFrontier = useMemo(() => getBoard('journal-entries'), [])

  return (
    <AppShell>
      <div className="relative min-h-screen">
        <PaperTexture seed={53} />

        <div className="relative mx-auto max-w-[1220px] px-6 py-10 lg:px-10">
          <header className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              {seasonMeta.season} · Week {seasonMeta.week}
            </p>
            <h1 className="mt-2 font-display text-[34px] leading-tight text-ink">The boards</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Foundation models and vendor products, ranked by the same blind panel of verified CPAs — one board per
              piece of accounting work.
            </p>
          </header>

          {/* Release radar */}
          <section aria-labelledby="radar" className="mt-8 rounded-xl border border-hairline bg-panel">
            <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
              <h2 id="radar" className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                Release radar · last 30 days
              </h2>
              <button
                type="button"
                onClick={() => void simulate()}
                disabled={simulating}
                className="flex items-center gap-1.5 rounded-[7px] border border-hairline px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted transition-colors duration-150 ease-out hover:border-ink/30 hover:text-ink disabled:opacity-50"
              >
                <ZapIcon className="h-3 w-3" aria-hidden="true" />
                {simulating ? 'Re-running…' : 'Simulate a release'}
              </button>
            </div>
            {radar.length === 0 ? (
              <p className="px-4 py-4 text-[12px] text-muted">No releases in the window — the boards are settled.</p>
            ) : (
              <ul className="grid divide-y divide-hairline md:grid-cols-2 md:divide-y-0 xl:grid-cols-4">
                {radar.map((entry, i) => (
                  <li
                    key={`${entry.name}-${entry.primitive}-${i}`}
                    className={`px-4 py-3 ${i > 0 ? 'xl:border-l xl:border-hairline' : ''} ${
                      i % 2 === 1 ? 'md:border-l md:border-hairline' : ''
                    }`}
                  >
                    <p className="text-[13px] font-bold text-ink">{entry.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted">{entry.released}</p>
                    <p className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                      <span className="truncate">{entry.primitive}</span>
                      <Movement from={entry.from} to={entry.to} />
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
            {/* Vertical primitive tabs */}
            <nav aria-label="Boards by primitive">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Primitives</p>
              <ul className="border-t border-hairline">
                {primitives.map((p) => {
                  const Icon = primitiveIcon(p.id)
                  const isActive = primitive === p.id
                  return (
                    <li key={p.id} className="border-b border-hairline">
                      <button
                        type="button"
                        disabled={!p.available}
                        onClick={() => setPrimitive(p.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`flex w-full items-center justify-between gap-2 py-2.5 pr-1 text-left text-[13px] font-semibold transition-colors duration-150 ease-out ${
                          !p.available
                            ? 'cursor-not-allowed text-muted/50'
                            : isActive
                              ? 'text-ink'
                              : 'text-muted hover:text-ink'
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={`h-4 w-px shrink-0 ${isActive && p.available ? 'bg-needle' : 'bg-transparent'}`}
                          />
                          <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                          <span className="truncate">{p.label}</span>
                        </span>
                        {!p.available ? (
                          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em]">soon</span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <section aria-label="Leaderboard">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-[24px] text-ink">{active.label}</h2>
                  <p className="mt-0.5 max-w-lg text-[12px] leading-relaxed text-muted">
                    {active.blurb} · {judgments.toLocaleString()} counted judgments
                    {board?.computed_at
                      ? ` · updated ${new Date(board.computed_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center border border-hairline bg-card p-0.5" role="group" aria-label="View">
                  {(
                    [
                      { id: 'chart' as const, label: 'Ranked', Icon: BarChart3Icon },
                      { id: 'frontier' as const, label: 'Frontier', Icon: ScatterChartIcon },
                      { id: 'table' as const, label: 'Table', Icon: TableIcon },
                    ]
                  ).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setView(id)}
                      aria-pressed={view === id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors duration-150 ease-out ${
                        view === id ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-hairline bg-card p-5 shadow-whisper md:p-6">
                {view === 'chart' ? (
                  rows.length === 0 ? (
                    <p className="py-6 text-center text-[13px] text-muted">No snapshot yet for this board.</p>
                  ) : (
                    <>
                      <BoardChart rows={rows} highlight={topProduct?.name} />
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
                        {topProduct ? (
                          <p className="text-[12px] text-muted">
                            <span className="font-bold text-needle">{topProduct.name}</span> — {topProduct.provenance}
                          </p>
                        ) : (
                          <span />
                        )}
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                          Bradley–Terry score · higher is better
                        </p>
                      </div>
                    </>
                  )
                ) : null}

                {view === 'frontier' ? (
                  <>
                    <div className="mb-3 flex justify-end">
                      <SpecimenChip tone="rust">Illustrative data</SpecimenChip>
                    </div>
                    <FrontierChart rows={demoFrontier} />
                    <p className="mt-3 max-w-2xl text-[12.5px] leading-relaxed text-muted">
                      Rating against cost per judged document. Cost telemetry isn&rsquo;t collected on the live
                      boards yet, so this view shows the design&rsquo;s illustrative dataset — anything below the
                      dashed line is beaten on both rating and cost by something else on the board.
                    </p>
                  </>
                ) : null}

                {view === 'table' ? (
                  rows.length === 0 ? (
                    <p className="py-6 text-center text-[13px] text-muted">No snapshot yet for this board.</p>
                  ) : (
                    <div className="overflow-x-auto scroll-quiet">
                      <table className="w-full min-w-[720px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-ink/30">
                            {['Rank', 'Δ', 'Competitor', 'Score', '95% CI', 'Judgments', 'Win rate'].map((h) => (
                              <th
                                key={h}
                                scope="col"
                                className="pb-2 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-muted"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => {
                            const delta = row.previousRank - row.rank
                            return (
                              <tr key={row.name} className="border-b border-hairline/70 last:border-0">
                                <td className="py-2.5 font-mono text-[12px] text-muted">
                                  {String(row.rank).padStart(2, '0')}
                                </td>
                                <td className="py-2.5">
                                  <span
                                    className={`font-mono text-[11px] ${
                                      delta > 0 ? 'text-spruce' : delta < 0 ? 'text-needle' : 'text-muted/60'
                                    }`}
                                  >
                                    {delta > 0 ? `▲ ${delta}` : delta < 0 ? `▼ ${Math.abs(delta)}` : '—'}
                                  </span>
                                </td>
                                <td className="py-2.5 pr-4">
                                  <span className="text-[13px] font-bold text-ink">{row.name}</span>
                                  {row.kind === 'product' ? (
                                    <span className="ml-2 border border-needle/40 bg-needle-tint px-1 py-px align-middle font-mono text-[9px] uppercase tracking-[0.12em] text-needle">
                                      Product
                                    </span>
                                  ) : null}
                                  <span className="block text-[11px] text-muted">{row.provenance ?? row.org}</span>
                                </td>
                                <td className="py-2.5 font-display text-[15px] tabular-nums text-ink">{row.score}</td>
                                <td className="py-2.5 font-mono text-[11px] tabular-nums text-muted">
                                  {row.ciLow}–{row.ciHigh}
                                </td>
                                <td className="py-2.5 font-mono text-[11px] tabular-nums text-muted">
                                  {row.judgments.toLocaleString()}
                                </td>
                                <td className="py-2.5 font-mono text-[11px] tabular-nums text-muted">
                                  {(row.winRate * 100).toFixed(1)}%
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : null}
              </div>

              {/* The read-out beneath the board */}
              <div className="mt-6 grid gap-6 rounded-xl border border-hairline bg-panel p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">What the season shows</p>
                  <h3 className="mt-2 max-w-md font-display text-[22px] leading-snug text-ink">
                    {leader
                      ? `${leader.name} leads ${active.label.toLowerCase()} — but the interval isn't closed.`
                      : 'The boards are still filling in.'}
                  </h3>
                  <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-muted">
                    {leader
                      ? `${leader.name} clears ${(leader.winRate * 100).toFixed(0)}% against the field on this board,
                    but its 95% interval still overlaps the runner-up — a lead we would not call decided. The
                    sharpest movement comes from vendor products, tuned against blind results rather than demos.`
                      : 'Judgments are still accumulating on this board. Every counted vote comes from a verified reviewer.'}
                  </p>
                </div>
                <div>
                  <TrendChart
                    points={accuracyTrend}
                    summary={`Accuracy on known-answer items rising from ${accuracyTrend[0].value}% in ${accuracyTrend[0].label} to ${accuracyTrend[accuracyTrend.length - 1].value}% in ${accuracyTrend[accuracyTrend.length - 1].label}`}
                  />
                  <p className="mt-3 border-t border-hairline pt-2 text-[11px] leading-relaxed text-muted">
                    Share of known-answer items answered correctly by the leading competitor, by month. Placeholder
                    figures for this preview.
                  </p>
                </div>
              </div>

              {/* Empty chairs */}
              <div className="mt-6 rounded-xl border border-dashed border-hairline bg-panel/60 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Empty chairs</p>
                {chairs.length === 0 ? (
                  <p className="mt-3 text-[12px] text-muted">Every invited vendor on this board is competing.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {chairs.map((chair) => (
                      <li
                        key={chair.name}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-dashed border-hairline px-4 py-2.5"
                      >
                        <span className="text-[13px] font-bold text-muted/80">{chair.name}</span>
                        <span className="text-[12px] text-muted/70">— {chair.note}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
                  <p className="max-w-md text-[12px] leading-relaxed text-muted">
                    Building an accounting AI product? Submit a version, get a certified evaluation, and decide
                    whether it publishes.
                  </p>
                  <button
                    type="button"
                    onClick={() => requestAuth('projects')}
                    className="rounded-[8px] bg-spruce px-4 py-2 text-[12px] font-bold text-paper transition-colors duration-150 ease-out hover:bg-spruce-hover"
                  >
                    Claim a founding seat
                  </button>
                </div>
              </div>

              <p className="mt-4 border-t border-hairline pt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-muted">
                Verified votes only · hidden quality checks · weighted Bradley–Terry
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
