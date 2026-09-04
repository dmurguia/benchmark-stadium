import React from 'react'
import { ArrowRightIcon } from 'lucide-react'
import { BoardChart } from '../charts/BoardChart'
import { getBoard } from '../../utils/boards'
import { CalibratedSeal } from '../brand/CalibratedSeal'

const TEXTURE_CPA =
  'https://cdn.magicpatterns.com/patterns/generated-images/bf40b1b9-7d01-43f8-b656-6343d08b164c.jpg'
const TEXTURE_VENDOR =
  'https://cdn.magicpatterns.com/patterns/generated-images/92b6b583-e85c-489c-b351-c75885e06591.jpg'

function RecordShot() {
  return (
    <div className="rounded-t-[10px] border border-b-0 border-hairline bg-card p-4">
      <div className="flex items-center gap-3 border-b border-hairline pb-3">
        <CalibratedSeal size={34} />
        <span>
          <span className="block text-[12px] font-bold text-ink">Dana Okafor</span>
          <span className="block text-[10px] text-muted">CPA / Accountant · Finance</span>
        </span>
        <span className="ml-auto rounded-full border border-spruce/30 bg-moss px-2 py-0.5 text-[9.5px] font-bold text-spruce">
          Calibrated Reviewer
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {[
          ['92%', 'Calibration'],
          ['Top 18%', 'Percentile'],
          ['47', 'Judgments'],
        ].map(([v, l]) => (
          <div key={l} className="border-t border-hairline pt-2">
            <p className="font-display text-[24px] leading-none text-ink">{v}</p>
            <p className="mt-1 text-[10px] text-muted">{l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BoardShot() {
  return (
    <div className="rounded-t-[10px] border border-b-0 border-hairline bg-card p-4">
      <div className="flex items-baseline justify-between border-b border-hairline pb-2">
        <span className="text-[12px] font-bold text-ink">Reconciliation</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Week 5</span>
      </div>
      <div className="mt-3">
        <BoardChart rows={getBoard('reconciliation').slice(0, 5)} highlight="LedgerPilot" labelWidth="130px" />
      </div>
    </div>
  )
}

interface CardProps {
  texture: string
  eyebrow: string
  title: string
  payoffs: string[]
  children: React.ReactNode
  shot: React.ReactNode
}

function PainterlyCard({ texture, eyebrow, title, payoffs, children, shot }: CardProps) {
  return (
    <article className="relative flex min-h-[620px] flex-col overflow-hidden rounded-xl border border-ink/30 shadow-lift">
      <img src={texture} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-spruce/70" />

      <div className="relative flex flex-1 flex-col p-7 md:p-9">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{eyebrow}</p>
        <h3 className="mt-4 max-w-sm font-display text-[30px] leading-[1.15] text-white md:text-[34px]">{title}</h3>

        <ul className="mt-6 space-y-2.5 border-t border-white/15 pt-5">
          {payoffs.map((p) => (
            <li key={p} className="flex gap-3 text-[13.5px] leading-relaxed text-white/80">
              <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 bg-white/50" />
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-7">{children}</div>

        <div className="mt-auto pt-10">
          <div className="translate-y-6">{shot}</div>
        </div>
      </div>
    </article>
  )
}

export function TwoAudiences() {
  return (
    <section aria-labelledby="two-sides" className="border-b border-hairline bg-paper py-20">
      <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            <span className="text-ink">04</span>
            <span aria-hidden="true" className="h-px w-8 bg-hairline" />
            <span>Two audiences</span>
          </p>
          <h2 id="two-sides" className="mt-4 font-display text-[36px] leading-[1.12] text-ink md:text-[46px]">
            One arena, two sides.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <PainterlyCard
            texture={TEXTURE_CPA}
            eyebrow="For CPAs"
            title="Get ranked. Get calibrated. Get paid."
            payoffs={[
              'A portable credential that travels with you, earned on measurement.',
              'Paid panel work for the top calibration scores each season.',
              'See which tools hold up against the work you do every day.',
            ]}
            shot={<RecordShot />}
          >
            <form
              className="flex flex-col gap-2.5 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <label htmlFor="cpa-email" className="sr-only">
                Work email
              </label>
              <input
                id="cpa-email"
                type="email"
                required
                placeholder="Work email"
                className="min-w-0 flex-1 rounded-[8px] border border-white/25 bg-white/10 px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/45 focus:border-white/60 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-paper px-4 py-2.5 text-[13px] font-bold text-ink transition-colors duration-150 ease-out hover:bg-white"
              >
                Join the calibrated panel
                <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </form>
            <p className="mt-3 text-[11.5px] leading-relaxed text-white/55">
              CPA verified via CPAVerify. Every document is synthetic — nothing confidential, ever.
            </p>
          </PainterlyCard>

          <PainterlyCard
            texture={TEXTURE_VENDOR}
            eyebrow="For vendors & labs"
            title="Your buyers are already comparing you here."
            payoffs={[
              'A certified evaluation run by the same blind panel as the models.',
              'Private-first results — you see the report before anyone else does.',
              'Publishing is your call. Declining is on the record either way.',
            ]}
            shot={<BoardShot />}
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-[8px] border border-white/40 px-4 py-2.5 text-[13px] font-bold text-white transition-colors duration-150 ease-out hover:border-white hover:bg-white/10"
            >
              Claim a founding seat
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <p className="mt-3 text-[11.5px] leading-relaxed text-white/55">
              Five founding seats for Issue #2. Evaluations run on synthetic scenarios only.
            </p>
          </PainterlyCard>
        </div>
      </div>
    </section>
  )
}
