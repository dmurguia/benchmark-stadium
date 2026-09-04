import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, XIcon, ClockIcon, FolderIcon } from 'lucide-react'
import { api, type BattleSummaryOut } from '../../lib/api'
import { recentSearches } from '../../data/projects'
import { CATEGORY_META } from '../../lib/view'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [sessions, setSessions] = useState<BattleSummaryOut[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    api<BattleSummaryOut[]>('/api/battles')
      .then(setSessions)
      .catch(() => setSessions([]))
  }, [open])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sessions.slice(0, 4)
    return sessions.filter(
      (s) =>
        s.prompt.toLowerCase().includes(q) ||
        (CATEGORY_META[s.category]?.label ?? s.category).toLowerCase().includes(q),
    )
  }, [query, sessions])

  const searchMatches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return recentSearches
    return recentSearches.filter((s) => s.toLowerCase().includes(q))
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
      <button type="button" aria-label="Close search" onClick={onClose} className="absolute inset-0 bg-ink/25" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search your projects"
        className="relative w-full max-w-[560px] overflow-hidden rounded-xl border border-hairline bg-card shadow-lift"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your projects and past checks"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-muted/70 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted transition-colors duration-150 ease-out hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto scroll-quiet">
          {searchMatches.length > 0 ? (
            <section className="px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Recent searches</p>
              <ul className="mt-2">
                {searchMatches.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => setQuery(s)}
                      className="flex w-full items-center gap-2.5 rounded-[7px] px-2 py-1.5 text-left text-[13px] text-ink transition-colors duration-150 ease-out hover:bg-panel"
                    >
                      <ClockIcon className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="border-t border-hairline px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">Your projects</p>
            {matches.length === 0 ? (
              <p className="mt-3 pb-2 text-[13px] text-muted">
                {query
                  ? `Nothing matches “${query}”. Try a primitive name, or start a new check.`
                  : 'No sessions yet — start a check from the composer.'}
              </p>
            ) : (
              <ul className="mt-2">
                {matches.map((s) => (
                  <li key={s.public_id}>
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        navigate(s.status === 'complete' ? `/reveal/${s.public_id}` : `/judge/${s.public_id}`)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-[7px] px-2 py-2 text-left transition-colors duration-150 ease-out hover:bg-panel"
                    >
                      <FolderIcon className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-ink">
                          {s.prompt}
                        </span>
                        <span className="block text-[11px] text-muted">
                          {CATEGORY_META[s.category]?.label ?? s.category} ·{' '}
                          {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                        {s.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
