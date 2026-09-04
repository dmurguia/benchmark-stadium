import React, { useState } from 'react'
import { ArrowRightIcon } from 'lucide-react'
import { api, type UserOut } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type SessionResponse = { token: string; user: UserOut }

/**
 * The real two-step email/code sign-in, in the redesign's voice. Hosted by the
 * AuthModal, the in-session judging gate, and the /signin page.
 */
export function AuthPanel({
  title = 'Sign in to Calibration Arena',
  body = 'Sign in with your work email so your votes carry weight on the boards.',
  onDone,
}: {
  title?: string
  body?: string
  onDone?: () => void
}) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [devCode, setDevCode] = useState<string | null>(null)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function requestCode(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const resp = await api<{ ok: boolean; dev_code: string | null }>('/api/auth/request-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setDevCode(resp.dev_code)
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send a code.')
    } finally {
      setBusy(false)
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const session = await api<SessionResponse>('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      })
      signIn(session.token, session.user)
      onDone?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work.")
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full rounded-[8px] border border-hairline bg-paper px-3 py-2.5 text-[13px] text-ink placeholder:text-muted/60 focus:border-spruce focus:outline-none'

  return (
    <div>
      <h2 className="font-display text-[24px] leading-snug text-ink">{title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{body}</p>

      {step === 'email' ? (
        <form className="mt-6" onSubmit={requestCode}>
          <label htmlFor="auth-email" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
            Work email
          </label>
          <input
            id="auth-email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.cpa"
            className={`mt-1.5 ${inputClass}`}
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] bg-spruce px-4 py-2.5 text-[13px] font-bold text-paper transition-colors duration-150 ease-out hover:bg-spruce-hover disabled:opacity-50"
          >
            {busy ? 'Sending…' : 'Send sign-in code'}
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </form>
      ) : (
        <form className="mt-6" onSubmit={verify}>
          <label htmlFor="auth-code" className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
            Sign-in code
          </label>
          <input
            id="auth-code"
            inputMode="numeric"
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className={`mt-1.5 ${inputClass} text-center tracking-[0.3em] placeholder:tracking-normal`}
          />
          <button
            type="submit"
            disabled={busy}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] bg-spruce px-4 py-2.5 text-[13px] font-bold text-paper transition-colors duration-150 ease-out hover:bg-spruce-hover disabled:opacity-50"
          >
            {busy ? 'Verifying…' : 'Verify and continue'}
          </button>
        </form>
      )}

      {devCode ? (
        <p className="mt-3 rounded-[8px] border border-spruce/25 bg-moss px-3 py-2 text-[12px] text-spruce">
          Dev mode — your code is <strong className="tabular-nums">{devCode}</strong> (email delivery is a
          placeholder).
        </p>
      ) : null}
      {error ? <p className="mt-3 text-[12.5px] font-semibold text-needle">{error}</p> : null}
      <p className="mt-4 border-t border-hairline pt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-muted">
        Free email = directional only · work domain = full weight · every document synthetic
      </p>
    </div>
  )
}
