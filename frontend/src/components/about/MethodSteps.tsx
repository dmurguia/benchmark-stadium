import { useState } from 'react'
import { ProductFrame } from '../ui/ProductFrame'
import { PixelAuthorChip } from '../brand/PixelAuthorChip'
import { SpecimenChip } from '../brand/SpecimenChip'
import { BoardChart } from '../charts/BoardChart'
import { getBoard } from '../../utils/boards'

interface Step {
  title: string
  description: string
  chip: string
  url: string
}

const steps: Step[] = [
  {
    title: 'Scenario intake',
    description:
      'You choose a primitive and describe the work. Every document in the arena is synthetic — nothing confidential ever enters it.',
    chip: 'Session setup',
    url: 'calibrationarena.ai/new',
  },
  {
    title: 'The blind panel',
    description:
      'Two drafts at a time, authors withheld behind pixel dither. Verified CPAs judge on measured accuracy — the entry, the memo, the treatment — not on prose.',
    chip: 'Blind comparison',
    url: 'calibrationarena.ai/judge',
  },
  {
    title: 'The calibration check',
    description:
      'One of the five comparisons has a known correct answer, and it looks exactly like the others. Agreement with it becomes the reviewer’s calibration score.',
    chip: 'Hidden quality check',
    url: 'calibrationarena.ai/judge',
  },
  {
    title: 'The board moves',
    description:
      'Verified votes feed a weighted Bradley–Terry model. Rankings shift with confidence intervals attached, so a lead only counts when the data supports it.',
    chip: 'Live board',
    url: 'calibrationarena.ai/leaderboards',
  },
]

function DraftMini({ seed, lines }: { seed: number; lines: [string, string, string][] }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-hairline bg-paper">
      <div className="flex items-center gap-2 border-b border-hairline px-3 py-2">
        <PixelAuthorChip seed={seed} size={20} />
        <SpecimenChip>Author hidden</SpecimenChip>
      </div>
      <table className="w-full border-collapse font-display text-[11.5px]">
        <tbody>
          {lines.map((l) => (
            <tr key={l[0]} className="border-b border-hairline/60 last:border-0">
              <td className="py-1.5 pl-3 pr-2 text-ink">{l[0]}</td>
              <td className="py-1.5 pr-2 text-right tabular-nums text-ink">{l[1]}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums text-ink">{l[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StepPanel({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="space-y-3">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">New project</p>
        {[
          ['Primitive', 'Journal Entries'],
          ['Scenario', 'A Q3 accrual for unbilled professional services'],
          ['Panel', 'Calibrated CPAs · 92%+ calibration'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[8px] border border-hairline bg-paper px-3 py-2.5">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
            <p className="mt-0.5 text-[13px] font-semibold text-ink">{value}</p>
          </div>
        ))}
        <div className="flex justify-end">
          <span className="rounded-[8px] bg-spruce px-3.5 py-2 text-[12px] font-bold text-paper">Begin session</span>
        </div>
      </div>
    )
  }

  if (index === 1 || index === 2) {
    const at = index === 1 ? 1 : 3
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12.5px] font-bold text-ink">Comparison {at + 1} of 5</p>
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className={`h-1 w-5 ${i < at ? 'bg-ink' : i === at ? 'bg-needle' : 'bg-hairline'}`} />
            ))}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DraftMini
            seed={4172}
            lines={[
              ['1210 Unbilled Receivables', '184,500', '—'],
              ['4020 PS Revenue', '—', '184,500'],
              ['Reversing 10/01', '', ''],
            ]}
          />
          <DraftMini
            seed={9083}
            lines={[
              ['1200 Accounts Receivable', '184,500', '—'],
              ['2400 Deferred Revenue', '—', '184,500'],
              ['No reversing entry', '', ''],
            ]}
          />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <span className="rounded-[8px] border border-ink/25 bg-card py-2 text-center text-[12px] font-bold text-ink">
            Draft A is better
          </span>
          <span className="rounded-[8px] border border-ink/25 bg-card py-2 text-center text-[12px] font-bold text-ink">
            Draft B is better
          </span>
        </div>
        {index === 2 ? (
          <p className="mt-3 border-t border-hairline pt-2.5 text-[11.5px] text-muted">
            Identical in every respect to the other four. That is the point.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
        Journal Entries · updated 2 hours ago
      </p>
      <BoardChart rows={getBoard('journal-entries').slice(0, 6)} highlight="LedgerPilot" labelWidth="150px" />
    </div>
  )
}

export function MethodSteps() {
  const [active, setActive] = useState(1)

  return (
    <section aria-labelledby="method" className="border-b border-hairline bg-paper py-20">
      <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            <span className="text-ink">01</span>
            <span aria-hidden="true" className="h-px w-8 bg-hairline" />
            <span>Methodology</span>
          </p>
          <h2 id="method" className="mt-4 font-display text-[34px] leading-[1.15] text-ink md:text-[42px]">
            How a rating gets made.
          </h2>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)]">
          <ol className="border-t border-hairline">
            {steps.map((step, i) => {
              const isActive = i === active
              return (
                <li key={step.title} className="border-b border-hairline">
                  <button type="button" onClick={() => setActive(i)} aria-expanded={isActive} className="w-full py-4 text-left">
                    <span className="flex items-baseline gap-3">
                      <span className={`font-mono text-[10px] tracking-[0.14em] ${isActive ? 'text-needle' : 'text-muted'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`text-[16px] font-bold transition-colors duration-150 ease-out ${
                          isActive ? 'text-ink' : 'text-muted hover:text-ink'
                        }`}
                      >
                        {step.title}
                      </span>
                    </span>
                    {isActive ? (
                      <span className="mt-2 block max-w-md pl-[26px] text-[13.5px] leading-relaxed text-muted">
                        {step.description}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ol>

          <ProductFrame label={steps[active].chip} url={steps[active].url}>
            <StepPanel index={active} />
          </ProductFrame>
        </div>
      </div>
    </section>
  )
}
