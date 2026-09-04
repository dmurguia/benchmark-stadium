import React from 'react'

interface ProductFrameProps {
  label?: string
  url?: string
  children: React.ReactNode
  className?: string
}

/** A thin ink frame with subtle browser chrome, used to hold product panels. */
export function ProductFrame({ label, url = 'calibrationarena.ai', children, className = '' }: ProductFrameProps) {
  return (
    <div className={`relative rounded-xl border border-ink/25 bg-card shadow-lift ${className}`}>
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full border border-hairline" />
          <span className="h-2 w-2 rounded-full border border-hairline" />
          <span className="h-2 w-2 rounded-full border border-hairline" />
        </span>
        <span className="flex-1 truncate rounded-[6px] border border-hairline bg-paper px-2.5 py-1 font-mono text-[10px] text-muted">
          {url}
        </span>
      </div>
      <div className="p-4 md:p-5">{children}</div>
      {label ? (
        <span className="absolute -bottom-3 right-5 border border-hairline bg-paper px-2 py-[3px] font-mono text-[9px] uppercase leading-none tracking-[0.16em] text-muted">
          {label}
        </span>
      ) : null}
    </div>
  )
}
