import { Resolve } from '../brand/Resolve'

const stats = [
  { value: '94%', caption: 'Panel accuracy on known-answer items' },
  { value: '1,240', caption: 'Calibration checks run this season' },
  { value: 'Top 18%', caption: 'What a reviewer earns, and can carry with them' },
]

export function StatBand() {
  return (
    <section aria-labelledby="measured-judges" className="border-b border-hairline bg-panel py-20">
      <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
        <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <span className="text-ink">02</span>
          <span aria-hidden="true" className="h-px w-8 bg-hairline" />
          <span>Measured judges</span>
        </p>

        <h2
          id="measured-judges"
          className="mt-4 max-w-3xl font-display text-[34px] leading-[1.15] text-ink md:text-[42px]"
        >
          Everyone else vets experts by résumé. We measure the judges.
        </h2>

        <div className="mt-12 grid gap-px border-t border-hairline md:grid-cols-3">
          {stats.map((stat, i) => (
            <div key={stat.value} className={`pt-6 md:pr-8 ${i > 0 ? 'md:border-l md:border-hairline md:pl-8' : ''}`}>
              <Resolve
                as="p"
                whenVisible
                delay={i * 90}
                className="font-display text-[64px] leading-none text-ink md:text-[80px]"
              >
                {stat.value}
              </Resolve>
              <p className="mt-4 border-t border-hairline pt-3 text-[13px] leading-relaxed text-muted">
                {stat.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
