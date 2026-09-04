import React from 'react'

interface SpecimenChipProps {
  children: React.ReactNode
  tone?: 'ink' | 'rust' | 'light'
  className?: string
}

/**
 * Mono "specimen label" annotation chip — thin-bordered rectangle with
 * letter-spaced uppercase mono text, e.g. [ AUTHORS HIDDEN ].
 * Used sparingly: hero, trust strip, product frames.
 */
export function SpecimenChip({ children, tone = 'ink', className = '' }: SpecimenChipProps) {
  const tones = {
    ink: 'border-hairline text-muted bg-card/70',
    rust: 'border-rust/40 text-rust bg-rust-tint',
    light: 'border-white/30 text-white/80 bg-transparent',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-[3px] font-mono text-[10px] uppercase leading-none tracking-[0.16em] ${tones[tone]} ${className}`}
    >
      <span aria-hidden="true" className="opacity-50">
        [
      </span>
      {children}
      <span aria-hidden="true" className="opacity-50">
        ]
      </span>
    </span>
  )
}
