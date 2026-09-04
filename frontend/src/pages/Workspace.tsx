import { Link } from 'react-router-dom'
import { ArrowRightIcon } from 'lucide-react'
import { AppShell } from '../components/app/AppShell'
import { CalibrationLens } from '../components/brand/CalibrationLens'
import { Resolve } from '../components/brand/Resolve'
import { PromptComposer } from '../components/workspace/PromptComposer'
import { SeasonTicker } from '../components/workspace/SeasonTicker'
import { seasonMeta } from '../data/competitors'

const trust = ['Every document synthetic', 'Authors hidden until reveal', 'CPAs verified via CPAVerify']

export function Workspace() {
  return (
    <AppShell>
      <div className="relative flex min-h-screen flex-col">
        <CalibrationLens radius={76} intensity={0.12} />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-[720px] flex-1 px-6 pb-10 pt-16 md:pt-24 lg:px-10">
            <Resolve as="h1" className="text-center font-display text-[36px] leading-[1.1] text-ink md:text-[48px]">
              What are you measuring today?
            </Resolve>

            <div className="mt-9">
              <PromptComposer />
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
              {trust.map((item) => (
                <li
                  key={item}
                  className="bg-paper/85 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto bg-paper/90">
            <SeasonTicker />
            <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10">
              <p className="text-[12.5px] text-muted">
                {seasonMeta.judgments.toLocaleString()} verified judgments this season · updated{' '}
                {seasonMeta.updated}
              </p>
              <Link
                to="/leaderboards"
                className="flex items-center gap-2 border-b border-ink/30 pb-1 text-[13px] font-bold text-ink transition-colors duration-150 ease-out hover:border-needle hover:text-needle"
              >
                See the boards
                <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
