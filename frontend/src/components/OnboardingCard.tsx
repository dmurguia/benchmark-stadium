import { useState } from "react";
import { api, type UserOut, type VerticalOut } from "../lib/api";
import { Button, Card, Eyebrow } from "./ui";
import { useEffect } from "react";

const ROLES: Record<string, string[]> = {
  legal: ["Attorney", "Paralegal", "Legal Ops", "Law Student", "Other"],
  finance: ["CPA / Accountant", "Controller", "ERP Consultant", "Auditor", "FP&A", "Other"],
};

/** One-time reviewer identity: vertical + role, feeding percentile cohorts. */
export function OnboardingCard({ onDone }: { onDone: (user: UserOut) => void }) {
  const [verticals, setVerticals] = useState<VerticalOut[]>([]);
  const [vertical, setVertical] = useState("legal");
  const [role, setRole] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<VerticalOut[]>("/api/verticals").then(setVerticals).catch(() => {});
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setBusy(true);
    try {
      const user = await api<UserOut>("/api/auth/profile", {
        method: "POST",
        body: JSON.stringify({ vertical, role }),
      });
      onDone(user);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-7">
      <Eyebrow>One last thing</Eyebrow>
      <h2 className="mt-3 text-xl font-extrabold tracking-tight text-ink">What work do you judge?</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Your percentile and consensus scores are measured against peers in your vertical.
      </p>
      <form onSubmit={save} className="mt-5 space-y-4 text-left">
        <div className="grid grid-cols-2 gap-2">
          {verticals.map((v) => (
            <button
              key={v.slug}
              type="button"
              aria-pressed={vertical === v.slug}
              onClick={() => {
                setVertical(v.slug);
                setRole("");
              }}
              className={`rounded-lg border px-3 py-2.5 text-[13.5px] font-bold transition-colors ${
                vertical === v.slug ? "border-forest bg-moss-tint text-forest" : "border-hairline bg-card text-ink"
              }`}
            >
              {v.icon} {v.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(ROLES[vertical] ?? []).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={role === r}
              onClick={() => setRole(r)}
              className={`rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                role === r ? "border-forest bg-forest text-paper" : "border-hairline bg-card text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <Button type="submit" disabled={!role || busy} className="w-full">
          {busy ? "Saving…" : "Start judging"}
        </Button>
      </form>
    </Card>
  );
}
