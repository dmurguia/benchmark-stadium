import React, { useEffect, useRef, useState } from 'react'

interface ResolveProps {
  children: React.ReactNode
  /** Delay in ms before the resolve begins. */
  delay?: number
  /** Only resolve once it scrolls into view. */
  whenVisible?: boolean
  as?: 'div' | 'span' | 'h1' | 'h2' | 'p'
  className?: string
}

/**
 * The one entrance behavior in the system: "resolve".
 * Content appears as an 8px pixel mosaic for ~250ms, then sharpens to ink.
 */
export function Resolve({
  children,
  delay = 0,
  whenVisible = false,
  as = 'div',
  className = '',
}: ResolveProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [started, setStarted] = useState(!whenVisible)

  useEffect(() => {
    if (!whenVisible || started) return
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [whenVisible, started])

  const Tag = as as React.ElementType
  const style = { animationDelay: `${delay}ms` } as React.CSSProperties

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`relative ${started ? 'resolve-target' : 'opacity-0'} ${className}`}
      style={started ? style : undefined}
    >
      {children}
      {started ? <span aria-hidden="true" className="resolve-mosaic" style={style} /> : null}
    </Tag>
  )
}
