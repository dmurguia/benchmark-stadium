import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api, type UserOut } from "../lib/api";
import { useAuth } from "../lib/auth";

interface RequestCodeOut {
  ok: boolean;
  dev_code: string | null;
}

interface SessionOut {
  token: string;
  user: UserOut;
}

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const resp = await api<RequestCodeOut>("/api/auth/request-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setDevCode(resp.dev_code);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await api<SessionOut>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      signIn(session.token, session.user);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 pt-24">
      <h1 className="font-display text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-ink-400">We'll email you a one-time code. No passwords.</p>

      {step === "email" ? (
        <form onSubmit={requestCode} className="mt-8 space-y-4">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 space-y-4">
          <p className="text-sm text-ink-400">
            Enter the 6-digit code sent to <span className="text-ink-50">{email}</span>
          </p>
          {devCode && (
            <p className="rounded-xl border border-arena/40 bg-arena/10 px-4 py-3 text-sm text-arena-bright">
              Dev mode — email delivery isn't wired yet, your code is <b className="tracking-widest">{devCode}</b>
            </p>
          )}
          <input
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="input text-center text-2xl tracking-[0.5em]"
          />
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Verifying…" : "Sign in"}
          </button>
          <button type="button" onClick={() => setStep("email")} className="w-full text-sm text-ink-400 hover:text-ink-200">
            Use a different email
          </button>
        </form>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </main>
  );
}
