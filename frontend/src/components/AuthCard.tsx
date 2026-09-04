import { useState } from "react";
import { api, type UserOut } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Button, Card, Eyebrow } from "./ui";

type SessionResponse = { token: string; user: UserOut };

export function AuthCard({
  eyebrow = "Sign in",
  title = "Make your judgment count.",
  body = "Sign in with your work email so your votes carry weight on the boards.",
  onDone,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  onDone?: () => void;
}) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const resp = await api<{ ok: boolean; dev_code: string | null }>("/api/auth/request-code", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setDevCode(resp.dev_code);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a code.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await api<SessionResponse>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      signIn(session.token, session.user);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-7 text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-xl font-extrabold tracking-tight text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted">{body}</p>

      {step === "email" ? (
        <form className="mt-5 flex flex-col gap-2.5 sm:flex-row" onSubmit={requestCode}>
          <label htmlFor="work-email" className="sr-only">
            Work email
          </label>
          <input
            id="work-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.com"
            className="flex-1 rounded-lg border border-hairline bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form className="mt-5 flex flex-col gap-2.5 sm:flex-row" onSubmit={verify}>
          <label htmlFor="login-code" className="sr-only">
            Sign-in code
          </label>
          <input
            id="login-code"
            inputMode="numeric"
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className="flex-1 rounded-lg border border-hairline bg-paper px-3.5 py-2.5 text-center text-[15px] tracking-[0.3em] text-ink placeholder:tracking-normal placeholder:text-muted focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
          />
          <Button type="submit" disabled={busy}>
            {busy ? "Verifying…" : "Verify"}
          </Button>
        </form>
      )}

      {devCode ? (
        <p className="mt-3 rounded-lg bg-moss-tint px-3 py-2 text-[12.5px] text-forest">
          Dev mode — your code is <strong className="tabular-nums">{devCode}</strong> (email delivery is a
          placeholder).
        </p>
      ) : null}
      {error ? <p className="mt-3 text-[12.5px] font-semibold text-rust">{error}</p> : null}
      <p className="mt-3 text-[12px] text-muted">Free email = directional only. Work domain = full weight.</p>
    </Card>
  );
}
