
const COUNTING_HOUSE =
  'https://cdn.magicpatterns.com/patterns/generated-images/fca51e83-9dfb-4cdf-b9dc-4f869bad0c0d.jpg'

export function WhyAccounting() {
  return (
    <section aria-labelledby="why-accounting" className="border-b border-hairline bg-paper py-20">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10">
        <div>
          <p className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            <span className="text-ink">03</span>
            <span aria-hidden="true" className="h-px w-8 bg-hairline" />
            <span>Why accounting first</span>
          </p>
          <h2
            id="why-accounting"
            className="mt-4 max-w-xl font-display text-[32px] leading-[1.15] text-ink md:text-[40px]"
          >
            The ledger is the oldest instrument we have for measuring work.
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-[14px] leading-relaxed text-muted">
            <p>
              Accounting is the rare profession where the work has a right answer, a written standard, and a
              licensed body of people qualified to say so. That makes it the honest place to start: you cannot
              hand-wave a debit.
            </p>
            <p>
              It is also where the stakes of getting AI wrong land quietly on someone&rsquo;s books. Every
              document in the arena is synthetic, but the standards are real, and so are the CPAs applying them.
            </p>
            <p>
              We did not build a tool that does the work. We built the timing rig — the instrument that tells you
              which tools can be trusted with it — and it is calibrated by the people who do the work themselves.
            </p>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-[340px]">
          <div className="border border-hairline bg-card p-3">
            <img
              src={COUNTING_HOUSE}
              alt="Engraving of a merchant counting house: a clerk at a tall slanted desk writing in a large open ledger, brass scales beside him"
              className="w-full"
              style={{ filter: 'grayscale(1) contrast(1.08)' }}
            />
          </div>
          <figcaption className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-muted">
            The counting house · the original calibration check
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
