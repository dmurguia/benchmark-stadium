import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, ArrowRightIcon, FolderOpenIcon } from 'lucide-react'
import { AppShell } from '../components/app/AppShell'
import { PaperTexture } from '../components/brand/PaperTexture'
import { api, type BattleSummaryOut } from '../lib/api'
import { CATEGORY_META } from '../lib/view'
import { primitiveByCategory } from '../data/primitives'
import { primitiveIcon } from '../components/workspace/primitiveIcons'
import { useAuth } from '../lib/auth'

function statusOf(s: BattleSummaryOut): { label: string; className: string } {
  if (s.status === 'complete')
    return { label: 'Complete', className: 'border-hairline bg-paper text-muted' }
  return { label: 'In review', className: 'border-needle/40 bg-needle-tint text-needle' }
}

export function Projects() {
  const { user, loading, requestAuth } = useAuth()
  const [sessions, setSessions] = useState<BattleSummaryOut[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    api<BattleSummaryOut[]>('/api/battles')
      .then(setSessions)
      .catch(() => setSessions([]))
  }, [user])

  const categories = useMemo(() => {
    const seen = new Set(sessions.map((s) => s.category))
    return ['all', ...Array.from(seen)]
  }, [sessions])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sessions.filter((s) => {
      if (category !== 'all' && s.category !== category) return false
      if (q && !s.prompt.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, category, sessions])

  if (!loading && !user) {
    return (
      <AppShell>
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <PaperTexture seed={91} />
          <div className="relative max-w-sm text-center">
            <FolderOpenIcon className="mx-auto h-7 w-7 text-muted" strokeWidth={1.5} aria-hidden="true" />
            <h1 className="mt-4 font-display text-[26px] leading-snug text-ink">Your projects are private</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              Sign in to see every check you have run, resume a session mid-panel, and keep your calibration record.
            </p>
            <button
              type="button"
              onClick={() => requestAuth('projects')}
              className="mt-5 rounded-[8px] bg-spruce px-4 py-2.5 text-[13px] font-bold text-paper transition-colors duration-150 ease-out hover:bg-spruce-hover"
            >
              Sign in to continue
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  const open = sessions.filter((s) => s.status !== 'complete').length

  return (
    <AppShell>
      <div className="relative min-h-screen">
        <PaperTexture seed={91} />

        <div className="relative mx-auto max-w-[1120px] px-6 py-10 lg:px-10">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Your work</p>
              <h1 className="mt-2 font-display text-[32px] leading-tight text-ink">My Projects</h1>
              <p className="mt-1.5 text-[13px] text-muted">
                {sessions.length} checks run · {open} still open
              </p>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 rounded-[8px] bg-spruce px-4 py-2.5 text-[13px] font-bold text-paper transition-colors duration-150 ease-out hover:bg-spruce-hover"
            >
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              New project
            </Link>
          </header>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex min-w-[240px] flex-1 items-center gap-2.5 rounded-[8px] border border-hairline bg-card px-3 py-2">
              <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
              <label htmlFor="project-search" className="sr-only">
                Search your projects
              </label>
              <input
                id="project-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your projects"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-muted/70 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setCategory(slug)}
                  aria-pressed={category === slug}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150 ease-out ${
                    category === slug
                      ? 'border-spruce bg-moss text-spruce'
                      : 'border-hairline bg-card text-muted hover:text-ink'
                  }`}
                >
                  {slug === 'all' ? 'All' : CATEGORY_META[slug]?.label ?? slug}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-hairline bg-card shadow-whisper">
            {rows.length === 0 ? (
              <p className="px-6 py-14 text-center text-[13px] text-muted">
                No projects match that filter yet. Start a check from the composer and it will appear here.
              </p>
            ) : (
              <div className="overflow-x-auto scroll-quiet">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-hairline">
                      {['Project', 'Board', 'Status', 'Winner', 'Started', ''].map((h, i) => (
                        <th
                          key={h || i}
                          scope="col"
                          className="px-5 py-2.5 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-muted"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((s) => {
                      const primitive = primitiveByCategory(s.category)
                      const Icon = primitiveIcon(primitive?.id ?? '')
                      const status = statusOf(s)
                      return (
                        <tr key={s.public_id} className="border-b border-hairline/70 last:border-0">
                          <td className="px-5 py-3.5">
                            <span className="block max-w-[300px] truncate text-[13px] font-bold text-ink">
                              {s.prompt}
                            </span>
                            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                              {s.public_id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-2 text-[12.5px] text-ink">
                              <Icon className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} aria-hidden="true" />
                              {CATEGORY_META[s.category]?.label ?? s.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`border px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[12.5px] text-ink">{s.winner_model?.name ?? '—'}</td>
                          <td className="px-5 py-3.5 font-mono text-[11px] text-muted">
                            {new Date(s.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  s.status === 'complete' ? `/reveal/${s.public_id}` : `/judge/${s.public_id}`,
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-ink transition-colors duration-150 ease-out hover:text-needle"
                            >
                              {s.status === 'complete' ? 'Open' : 'Resume'}
                              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
