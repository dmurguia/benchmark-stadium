
interface CalibratedSealProps {
  size?: number
  className?: string
}

const SPRUCE = '#1d2a24'
const MOSS = '#dbe7d0'

/** Circular tick-ring badge with a check — the Calibrated Reviewer seal. */
export function CalibratedSeal({ size = 64, className = '' }: CalibratedSealProps) {
  const ticks = Array.from({ length: 36 }, (_, i) => i)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="Calibrated Reviewer seal"
    >
      <circle cx="32" cy="32" r="30" stroke={SPRUCE} strokeWidth="1" />
      <circle cx="32" cy="32" r="22.5" stroke={SPRUCE} strokeWidth="1" opacity="0.5" />
      {ticks.map((i) => {
        const angle = (i / ticks.length) * Math.PI * 2
        const major = i % 9 === 0
        const outer = 30
        const inner = major ? 24.5 : 27
        return (
          <line
            key={i}
            x1={32 + Math.sin(angle) * inner}
            y1={32 - Math.cos(angle) * inner}
            x2={32 + Math.sin(angle) * outer}
            y2={32 - Math.cos(angle) * outer}
            stroke={SPRUCE}
            strokeWidth={major ? 1.2 : 0.7}
            opacity={major ? 0.85 : 0.4}
          />
        )
      })}
      <circle cx="32" cy="32" r="16" fill={MOSS} />
      <path
        d="M24.5 32.5l5.2 5.2L40 27.5"
        stroke={SPRUCE}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
