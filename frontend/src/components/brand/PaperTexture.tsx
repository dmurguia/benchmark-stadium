import { useMemo } from 'react'

interface PaperTextureProps {
  /** Stable seed so clusters don't reshuffle between renders. */
  seed?: number
  className?: string
}

interface Square {
  x: number
  y: number
  size: number
  opacity: number
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
 * Ambient brand texture: faint scattered pixel-dither clusters near the page
 * edges — small groups of 4–8px ink squares at 4–6% opacity, denser toward the
 * corners. Purely decorative, never behind body text.
 */
export function PaperTexture({ seed = 7, className = '' }: PaperTextureProps) {
  const squares = useMemo<Square[]>(() => {
    const rand = mulberry(seed)
    const out: Square[] = []
    // Cluster anchors sit in the corners and along the left/right margins.
    const anchors = [
      { x: 3, y: 4, n: 9 },
      { x: 97, y: 5, n: 9 },
      { x: 2, y: 94, n: 8 },
      { x: 98, y: 96, n: 8 },
      { x: 5, y: 46, n: 5 },
      { x: 95, y: 58, n: 5 },
      { x: 12, y: 12, n: 4 },
      { x: 88, y: 84, n: 4 },
    ]
    anchors.forEach((anchor, ai) => {
      for (let i = 0; i < anchor.n; i += 1) {
        const spread = 5 + rand() * 7
        out.push({
          x: anchor.x + (rand() - 0.5) * spread * 2,
          y: anchor.y + (rand() - 0.5) * spread * 1.6,
          size: [4, 6, 8][Math.floor(rand() * 3)],
          opacity: 0.04 + rand() * 0.02 + (ai < 4 ? 0.006 : 0),
        })
      }
    })
    return out
  }, [seed])

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {squares.map((s, i) => (
        <span
          key={i}
          className="absolute bg-ink"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  )
}
