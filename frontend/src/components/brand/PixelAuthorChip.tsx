import { useMemo } from 'react'

interface PixelAuthorChipProps {
  /** Seed keeps each hidden author's dither pattern stable but distinct. */
  seed: number
  size?: number
  className?: string
}

function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * An 8px pixel-mosaic block standing in for a hidden model identity.
 * Coarse dither = withheld. Crisp ink = revealed and measured.
 */
export function PixelAuthorChip({ seed, size = 32, className = '' }: PixelAuthorChipProps) {
  const cells = useMemo(() => {
    const rand = mulberry(seed)
    return Array.from({ length: 16 }, () => {
      const r = rand()
      if (r > 0.72) return 0.62
      if (r > 0.44) return 0.34
      if (r > 0.2) return 0.16
      return 0.06
    })
  }, [seed])

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 grid-cols-4 overflow-hidden border border-hairline ${className}`}
      style={{ width: size, height: size }}
    >
      {cells.map((opacity, i) => (
        <span key={i} className="bg-ink" style={{ opacity }} />
      ))}
    </span>
  )
}
