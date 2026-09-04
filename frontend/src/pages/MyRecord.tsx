import { useEffect, useState } from 'react'
import { CheckIcon, LockIcon, ArrowRightIcon, UserRoundIcon } from 'lucide-react'
import { AppShell } from '../components/app/AppShell'
import { PaperTexture } from '../components/brand/PaperTexture'
import { Resolve } from '../components/brand/Resolve'
import { CalibratedSeal } from '../components/brand/CalibratedSeal'
import { SpecimenChip } from '../components/brand/SpecimenChip'
import { api, type ReviewerStatsOut } from '../lib/api'
import { useAuth } from '../lib/auth'
import { badgeLadder, calibrationTrend, engagements } from '../data/record'

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v)}%`)

export function MyRecord() {
  const { user, loading, requestAuth } = useAuth()
  const [stats, setStats] = useState<ReviewerStatsOut | null>(null)

  useEffect(() => {
    if (!user) return
    api<ReviewerStatsOut>('/api/auth/reviewer')
      .then(setStats)
      .catch(() => setStats(null))
  }, [user])

  if (!loading && !user) {
    return (
      <AppShell>
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <PaperTexture seed={11} />
          <div className="relative max-w-sm text-center">
            <UserRoundIcon className="mx-auto h-7 w-7 text-muted" strokeWidth={1.5} aria-hidden="true" />
            <h1 className="mt-4 font-display text-[26px] leading-snug text-ink">Your record is yours</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              Sign in to see your calibration score, percentile, and the badge ladder your judgments feed.
            </p>
            <button
              type="button"
              onClick={() => requestAuth('projects')}
              className="mt-5 rounded-[8px] bg-spruce px-4 py-2.5 text-[13px] font-bold text-paper transition-colors duration-150 ease-out hover:bg-spruce-hover"
            >
              Sign in to continue
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  const recordStats = [
    {
      value: pct(stats?.calibration_pct ?? null),
      label: 'Calibration score',
      caption: `Agreement with known-answer items · ${stats?.traps_passed ?? 0}/${stats?.traps_total ?? 0} checks`,
      highlight: false,
    },
    {
      value: stats?.percentile != null ? `Top ${Math.max(1, 100 - Math.round(stats.percentile))}%` : '—',
      label: 'Panel percentile',
      caption: 'Among verified reviewers in your vertical',
      highlight: true,
    },
    {
      value: pct(stats?.consensus_pct ?? null),
      label: 'Consensus rate',
      caption: 'Alignment with the majority panel',
      highlight: false,
    },
    {
      value: String(stats?.votes_cast ?? 0),
      label: 'Judgments',
      caption: `${stats?.counted_votes ?? 0} counted toward the boards`,
      highlight: false,
    },
  ]

  const currentBadge = stats?.badge ?? 'Apprentice'
  const currentIdx = badgeLadder.findIndex((b) => b.name === currentBadge)
  const qualifies = currentIdx >= 1

  return (
    <AppShell>
      <div className="relative min-h-screen">
        <PaperTexture seed={11} />

        <div className="relative mx-auto max-w-[1120px] px-6 py-8 lg:px-10">
          {/* Profile */}
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-hairline pb-7">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Reviewer record</p>
              <h1 className="mt-2 font-display text-[34px] leading-tight text-ink">
                {user?.display_name || user?.email || 'Reviewer'}
              </h1>
              <p className="mt-1 text-[14px] text-muted">
                {user?.role || 'Reviewer'} · {user?.vertical || 'Finance'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-forest/30 bg-moss px-3 py-1 text-[11px] font-bold text-forest">
                  {currentBadge}
                </span>
                <SpecimenChip>{`Tier ${user?.tier ?? 0} weight`}</SpecimenChip>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CalibratedSeal size={72} />
              <div className="max-w-[180px]">
                <p className="text-[12px] font-bold text-ink">Calibrated Reviewer</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  A portable credential. Verified by measurement, not résumé.
                </p>
              </div>
            </div>
          </header>

          {/* Stats */}
          <section aria-label="Record statistics" className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recordStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-hairline bg-card p-5 shadow-whisper">
                {stat.highlight ? (
                  <Resolve as="p" delay={220} className="font-display text-[52px] leading-none text-rust">
                    {stat.value}
                  </Resolve>
                ) : (
                  <p className="font-display text-[52px] leading-none text-ink">{stat.value}</p>
                )}
                <p className="mt-3 border-t border-hairline pt-2.5 text-[12px] font-bold text-ink">{stat.label}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{stat.caption}</p>
              </div>
            ))}
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              {/* Rust-tinted paid work card */}
              <section className="rounded-xl border border-rust/30 bg-rust-tint p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-rust">Paid panel work</p>
                <h2 className="mt-2 font-display text-[22px] leading-snug text-ink">
                  {qualifies
                    ? `Your calibration qualifies you for paid panel work — ${engagements.length} open engagements.`
                    : 'Calibrated Reviewers unlock paid panel work. Keep judging.'}
                </h2>
                <ul className="mt-4 divide-y divide-rust/20 border-t border-rust/20">
                  {engagements.map((e) => (
                    <li key={e.title} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-ink">{e.title}</span>
                        <span className="block text-[11px] text-muted">{e.detail}</span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                          {e.window}
                        </span>
                        <button
                          type="button"
                          disabled={!qualifies}
                          className="flex items-center gap-1.5 rounded-[8px] bg-rust px-3 py-1.5 text-[12px] font-bold text-paper transition-opacity duration-150 ease-out hover:opacity-90 disabled:opacity-40"
                        >
                          Apply
                          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                  Engagement listings are preview content
                </p>
              </section>

              {/* Calibration trend micro chart (demo until monthly history ships) */}
              <section className="rounded-xl border border-hairline bg-card p-6 shadow-whisper">
                <div className="flex items-end justify-between">
                  <h2 className="text-[13px] font-bold text-ink">Calibration score by month</h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    Preview data
                  </span>
                </div>
                <div
                  className="mt-5 flex items-end gap-2"
                  role="img"
                  aria-label="Calibration score rising from 74% in April to 92% in September"
                >
                  {calibrationTrend.map((t, i) => (
                    <div key={t.label} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="font-mono text-[9px] text-muted">{t.value}</span>
                      <span
                        className={`w-full ${i === calibrationTrend.length - 1 ? 'bg-rust' : 'bg-ink/70'}`}
                        style={{ height: `${(t.value / 92) * 96}px` }}
                      />
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{t.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-1 h-px w-full bg-ink/40" />
              </section>
            </div>

            {/* Badge ladder rail */}
            <aside className="rounded-xl border border-hairline bg-panel p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Badge ladder</p>
              <ol className="mt-5 space-y-0">
                {badgeLadder.map((badge, i) => {
                  const state = i < currentIdx ? 'earned' : i === currentIdx ? 'current' : 'locked'
                  return (
                    <li key={badge.name} className="relative flex gap-4 pb-7 last:pb-0">
                      {i < badgeLadder.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className={`absolute left-[11px] top-6 h-full w-px ${
                            state === 'earned' ? 'bg-forest/40' : 'bg-hairline'
                          }`}
                        />
                      ) : null}
                      <span
                        className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          state === 'locked'
                            ? 'border-hairline bg-card text-muted/60'
                            : 'border-forest bg-forest text-paper'
                        }`}
                      >
                        {state === 'locked' ? (
                          <LockIcon className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[13px] font-bold ${
                            state === 'locked' ? 'text-muted' : 'text-ink'
                          }`}
                        >
                          {badge.name}
                          {state === 'current' ? (
                            <span className="ml-2 border border-rust/40 bg-rust-tint px-1 py-px align-middle font-mono text-[9px] uppercase tracking-[0.12em] text-rust">
                              Current
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                          {badge.requirement}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ol>
              <p className="mt-2 border-t border-hairline pt-4 text-[11px] leading-relaxed text-muted">
                Tiers are earned on measured agreement with known-answer items — never on volume alone.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
