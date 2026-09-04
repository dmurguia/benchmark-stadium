import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckIcon, InfoIcon } from 'lucide-react'
import { AppShell } from '../components/app/AppShell'
import { PaperTexture } from '../components/brand/PaperTexture'
import { SpecimenChip } from '../components/brand/SpecimenChip'
import { PixelAuthorChip } from '../components/brand/PixelAuthorChip'
import { AuthPanel } from '../components/app/AuthPanel'
import { DocModal } from '../components/DocPanel'
import { api, type BattleOut } from '../lib/api'
import { useAuth } from '../lib/auth'
import { CATEGORY_META, scenarioTitle } from '../lib/view'

function ProgressTicks({ total, current }: { total: number; current: number }) {
  return (
    <span className="flex items-center gap-1.5" role="img" aria-label={`Comparison ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-6 ${i < current ? 'bg-ink' : i === current ? 'bg-needle' : 'bg-hairline'}`}
        />
      ))}
    </span>
  )
}

/** The redesign's document panel around the real sandboxed work-product iframe. */
function LiveDocPanel({
  battleId,
  position,
  label,
  onExpand,
}: {
  battleId: string
  position: number
  label: string
  onExpand: () => void
}) {
  return (
    <article className="flex h-[520px] min-w-0 flex-col overflow-hidden rounded-xl border border-hairline bg-card shadow-whisper">
      <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <div className="flex items-center gap-2.5">
          <PixelAuthorChip seed={position * 4172 + 7} size={28} />
          <SpecimenChip>Author hidden</SpecimenChip>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{label}</span>
          <button
            type="button"
            aria-label={`Expand ${label}`}
            onClick={onExpand}
            className="rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition-colors duration-150 ease-out hover:bg-panel hover:text-ink"
          >
            Expand
          </button>
        </div>
      </header>
      <iframe
        title={label}
        sandbox="allow-scripts"
        src={`/api/battles/${battleId}/generations/${position}/html`}
        className="h-full w-full flex-1 border-0 bg-white"
      />
    </article>
  )
}

export function JudgeSession() {
  const { battleId } = useParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [battle, setBattle] = useState<BattleOut | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)
  const [expanded, setExpanded] = useState<{ position: number; label: string } | null>(null)

  useEffect(() => {
    if (!battleId) return
    api<BattleOut>(`/api/battles/${battleId}`)
      .then((b) => {
        if (b.status === 'complete') navigate(`/reveal/${b.public_id}`, { replace: true })
        else setBattle(b)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Session not found.'))
  }, [battleId, navigate])

  const positionOf = useMemo(() => {
    const map = new Map<number, number>()
    battle?.generations.forEach((g) => map.set(g.id, g.position))
    return map
  }, [battle])

  if (error) {
    return (
      <AppShell>
        <p className="pt-16 text-center text-[14px] font-semibold text-needle">{error}</p>
      </AppShell>
    )
  }
  if (!battle) {
    return (
      <AppShell>
        <p className="pt-16 text-center text-[14px] text-muted">Setting the field…</p>
      </AppShell>
    )
  }

  const decided = battle.matches.filter((m) => m.winner_generation_id != null).length
  const total = battle.matches.length
  const match = battle.matches.find((m) => m.id === battle.current_match_id) ?? null
  const meta = CATEGORY_META[battle.category]
  const gated = !loading && !user && decided >= 1

  const vote = async (winnerGenerationId: number) => {
    if (!match || voting) return
    setVoting(true)
    try {
      const updated = await api<BattleOut>(`/api/battles/${battle.public_id}/votes`, {
        method: 'POST',
        body: JSON.stringify({ match_id: match.id, winner_generation_id: winnerGenerationId }),
      })
      if (updated.status === 'complete') navigate(`/reveal/${updated.public_id}`)
      else setBattle(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vote failed.')
    } finally {
      setVoting(false)
    }
  }

  const aPos = match?.a_generation_id != null ? positionOf.get(match.a_generation_id) : undefined
  const bPos = match?.b_generation_id != null ? positionOf.get(match.b_generation_id) : undefined

  return (
    <AppShell>
      <div className="relative min-h-screen">
        <PaperTexture seed={31} />

        <div className="relative mx-auto max-w-[1180px] px-6 py-8 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {meta ? `${meta.label} · ${meta.vertical}` : 'Blind judging'}
              </p>
              <h1 className="mt-2 font-display text-[30px] leading-tight text-ink">
                {scenarioTitle(battle.scenario_id) || meta?.label || 'Blind session'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-bold text-ink">
                Comparison {Math.min(decided + 1, total)} of {total}
              </span>
              <ProgressTicks total={total} current={decided} />
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-hairline bg-panel px-5 py-4">
            <p className="max-w-4xl text-[13.5px] leading-relaxed text-ink/85">{battle.prompt}</p>
            <p className="mt-3 flex items-center gap-2 text-[11px] text-muted">
              <InfoIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Synthetic scenario. No client data appears in the arena, ever.
            </p>
          </div>

          <div className="relative mt-6">
            {gated ? (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-paper/95 px-6 pt-8">
                <div className="w-full max-w-[420px] rounded-xl border border-hairline bg-card p-7 shadow-lift">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Comparison {Math.min(decided + 1, total)} of {total}
                  </p>
                  <div className="mt-3">
                    <AuthPanel
                      title="Keep judging — make it count."
                      body="Sign in with your work email so your votes carry weight on the boards. Your bracket picks up right where you left it."
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className={gated ? 'pointer-events-none select-none' : undefined}>
              {match && aPos != null && bPos != null ? (
                <>
                  <div className="grid gap-5 lg:grid-cols-2">
                    <LiveDocPanel
                      battleId={battle.public_id}
                      position={aPos}
                      label="Draft A"
                      onExpand={() => setExpanded({ position: aPos, label: 'Draft A' })}
                    />
                    <LiveDocPanel
                      battleId={battle.public_id}
                      position={bPos}
                      label="Draft B"
                      onExpand={() => setExpanded({ position: bPos, label: 'Draft B' })}
                    />
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {[
                      { letter: 'A', genId: match.a_generation_id },
                      { letter: 'B', genId: match.b_generation_id },
                    ].map(({ letter, genId }) => (
                      <button
                        key={letter}
                        type="button"
                        disabled={gated || voting}
                        onClick={() => genId != null && vote(genId)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-ink/25 bg-card px-6 py-4 text-[14px] font-bold text-ink transition-colors duration-150 ease-out hover:border-spruce hover:bg-moss disabled:opacity-60"
                      >
                        {voting ? <CheckIcon className="h-4 w-4 opacity-0" aria-hidden="true" /> : null}
                        Draft {letter} is better
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 border-t border-hairline pt-4 text-[12px] text-muted">
                    Judge on measured accuracy, not style. Authors are revealed after all five comparisons.
                  </p>
                </>
              ) : (
                <p className="pt-8 text-center text-[14px] text-muted">Preparing the next comparison…</p>
              )}
            </div>
          </div>
        </div>

        {expanded ? (
          <DocModal
            battleId={battle.public_id}
            position={expanded.position}
            label={expanded.label}
            onClose={() => setExpanded(null)}
          />
        ) : null}
      </div>
    </AppShell>
  )
}
