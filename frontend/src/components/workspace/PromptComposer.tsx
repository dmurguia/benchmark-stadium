import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaperclipIcon, ImageIcon, BracesIcon, ArrowUpIcon } from 'lucide-react'
import { api, type BattleOut, type ScenarioOut } from '../../lib/api'
import { primitiveById } from '../../data/primitives'
import { primitiveIcon } from './primitiveIcons'
import { PrimitiveChips } from './PrimitiveChips'

const attachments = [
  { icon: PaperclipIcon, label: 'Attach a document — trial balance, PDF or CSV (coming later)' },
  { icon: ImageIcon, label: 'Attach a screenshot of a ledger or screen (coming later)' },
  { icon: BracesIcon, label: 'Paste an export snippet — CSV or XBRL (coming later)' },
]

/**
 * The workspace composer. Guest-first on purpose: anyone can start a session —
 * the sign-in gate arrives inside the session, after the first real comparison
 * (BS-13). Guest votes carry zero board weight either way.
 */
export function PromptComposer() {
  const [primitive, setPrimitive] = useState('journal-entries')
  const [prompt, setPrompt] = useState('')
  const [scenarios, setScenarios] = useState<ScenarioOut[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const navigate = useNavigate()

  const active = primitiveById(primitive)
  const ActiveIcon = primitiveIcon(primitive)

  useEffect(() => {
    setSelectedScenario(null)
    if (!active.category) {
      setScenarios([])
      return
    }
    api<ScenarioOut[]>(`/api/scenarios/${active.category}`)
      .then(setScenarios)
      .catch(() => setScenarios([]))
  }, [active.category])

  const start = async () => {
    if (!active.category || busy) return
    setBusy(true)
    setError(null)
    try {
      const battle = await api<BattleOut>('/api/battles', {
        method: 'POST',
        body: JSON.stringify({ category: active.category, scenario_id: selectedScenario }),
      })
      navigate(`/judge/${battle.public_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not stage the session.')
      setBusy(false)
    }
  }

  const suggestions: { key: string; title: string; scenarioId: string | null }[] =
    scenarios.length > 0
      ? scenarios.slice(0, 3).map((s) => ({ key: s.id, title: s.title, scenarioId: s.id }))
      : active.scenarios.map((s) => ({
          key: s,
          title: s.charAt(0).toUpperCase() + s.slice(1),
          scenarioId: null,
        }))

  return (
    <div>
      <div className="rounded-xl border border-hairline bg-card shadow-lift">
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
          <p className="flex items-center gap-2 text-[12.5px] font-bold text-ink">
            <ActiveIcon className="h-3.5 w-3.5 text-needle" strokeWidth={1.9} aria-hidden="true" />
            {active.label}
          </p>
          <span className="hidden truncate font-mono text-[9px] uppercase tracking-[0.16em] text-muted sm:block">
            Five blind comparisons · one hidden check
          </span>
        </div>

        <div className="px-4 pb-3 pt-4">
          <label htmlFor="composer" className="sr-only">
            Describe the work you want measured
          </label>
          <textarea
            id="composer"
            ref={inputRef}
            rows={3}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
              setSelectedScenario(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void start()
            }}
            placeholder="Describe the work — the transaction, the account, the period."
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink placeholder:text-muted/70 focus:outline-none"
          />

          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="flex items-center gap-1">
              {attachments.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-muted transition-colors duration-150 ease-out hover:border-ink/30 hover:text-ink"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void start()}
              disabled={busy || !active.category}
              aria-label="Start this measurement"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-spruce text-paper transition-colors duration-150 ease-out hover:bg-spruce-hover disabled:opacity-60"
            >
              <ArrowUpIcon className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
          {error ? <p className="mt-2 text-[12px] font-semibold text-needle">{error}</p> : null}
        </div>

        {/* Real scenarios from this primitive's live board */}
        <div className="border-t border-hairline px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
            {active.label} · scenarios on the board
          </p>
          <ul className="mt-2 space-y-1">
            {suggestions.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(s.title)
                    setSelectedScenario(s.scenarioId)
                    inputRef.current?.focus()
                  }}
                  className={`w-full rounded-[6px] px-2 py-1 text-left text-[12.5px] transition-colors duration-150 ease-out hover:bg-panel hover:text-ink ${
                    selectedScenario != null && selectedScenario === s.scenarioId ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5">
        <PrimitiveChips selected={primitive} onSelect={setPrimitive} />
      </div>
    </div>
  )
}
