import { LockIcon } from 'lucide-react'
import { primitives } from '../../data/primitives'
import { primitiveIcon } from './primitiveIcons'

interface PrimitiveChipsProps {
  selected: string
  onSelect: (id: string) => void
}

/**
 * The same primitive set that opens a project also sits under the composer, so
 * the box reads as "here is everything you can put in it".
 */
export function PrimitiveChips({ selected, onSelect }: PrimitiveChipsProps) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-2">
      {primitives.map((p) => {
        const Icon = primitiveIcon(p.id)
        const active = p.id === selected
        return (
          <li key={p.id}>
            <button
              type="button"
              disabled={!p.available}
              onClick={() => onSelect(p.id)}
              aria-pressed={active}
              title={p.blurb}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors duration-150 ease-out ${
                !p.available
                  ? 'cursor-not-allowed border-hairline text-muted/55'
                  : active
                    ? 'border-spruce bg-moss text-spruce'
                    : 'border-hairline bg-card text-ink hover:border-ink/35'
              }`}
            >
              {p.available ? (
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <LockIcon className="h-3 w-3" aria-hidden="true" />
              )}
              {p.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
