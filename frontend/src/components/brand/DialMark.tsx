
interface DialMarkProps {
  size?: number
  className?: string
  title?: string
}

/**
 * The Calibrated logo mark: a circular gauge dial — thin ink circle,
 * fine rim ticks, and a rust needle sitting just off twelve o'clock.
 */
export function DialMark({ size = 24, className = '', title }: DialMarkProps) {
  const ticks = Array.from({ length: 24 }, (_, i) => i)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      {ticks.map((i) => {
        const major = i % 6 === 0
        const angle = (i / ticks.length) * Math.PI * 2
        const outer = 21
        const inner = major ? 16.5 : 18.5
        const cx = 24
        const cy = 24
        return (
          <line
            key={i}
            x1={cx + Math.sin(angle) * inner}
            y1={cy - Math.cos(angle) * inner}
            x2={cx + Math.sin(angle) * outer}
            y2={cy - Math.cos(angle) * outer}
            stroke="currentColor"
            strokeWidth={major ? 1.4 : 0.8}
            opacity={major ? 0.9 : 0.45}
          />
        )
      })}
      <g transform="rotate(14 24 24)">
        <line x1="24" y1="24" x2="24" y2="10.5" stroke="#c14a24" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="24" cy="24" r="2.4" fill="currentColor" />
    </svg>
  )
}
