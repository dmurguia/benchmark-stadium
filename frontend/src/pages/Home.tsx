import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Monogram from "../components/Monogram";
import {
  api,
  ApiError,
  type ArenaModelOut,
  type BattleOut,
  type CategoryOut,
  type LeaderboardOut,
  type ReleaseOut,
  type ScenarioOut,
  type UserOut,
  type VerticalOut,
} from "../lib/api";
import { useAuth } from "../lib/auth";

interface StatsOut {
  votes: number;
  human_votes: number;
  battles: number;
  models: number;
  categories: number;
}

const ROLES: Record<string, string[]> = {
  legal: ["Attorney", "Paralegal", "Legal Ops", "Law Student", "Other"],
  finance: ["CPA / Accountant", "Controller", "ERP Consultant", "Auditor", "FP&A", "Other"],
};

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [verticals, setVerticals] = useState<VerticalOut[]>([]);
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [vertical, setVertical] = useState("legal");
  const [category, setCategory] = useState("contract-redline");
  const [scenarios, setScenarios] = useState<ScenarioOut[]>([]);
  const [busyScenario, setBusyScenario] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [top, setTop] = useState<LeaderboardOut | null>(null);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [models, setModels] = useState<ArenaModelOut[]>([]);
  const [latestRelease, setLatestRelease] = useState<ReleaseOut | null>(null);

  useEffect(() => {
    api<VerticalOut[]>("/api/verticals").then(setVerticals).catch(() => {});
    api<CategoryOut[]>("/api/categories").then(setCategories).catch(() => {});
    api<LeaderboardOut>("/api/leaderboard/overall").then(setTop).catch(() => {});
    api<StatsOut>("/api/stats").then(setStats).catch(() => {});
    api<ArenaModelOut[]>("/api/models").then(setModels).catch(() => {});
    api<ReleaseOut[]>("/api/releases?limit=1")
      .then((rs) => setLatestRelease(rs[0] ?? null))
      .catch(() => {});
  }, []);

  // Default to the signed-in reviewer's vertical.
  useEffect(() => {
    if (user?.vertical) setVertical(user.vertical);
  }, [user]);

  const verticalCategories = useMemo(
    () => categories.filter((c) => c.vertical === vertical),
    [categories, vertical],
  );

  useEffect(() => {
    if (verticalCategories.length && !verticalCategories.some((c) => c.slug === category)) {
      setCategory(verticalCategories[0].slug);
    }
  }, [verticalCategories, category]);

  useEffect(() => {
    if (!category) return;
    api<ScenarioOut[]>(`/api/scenarios/${category}`).then(setScenarios).catch(() => setScenarios([]));
  }, [category]);

  async function startBattle(scenarioId?: string) {
    if (!loading && !user) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    setBusyScenario(scenarioId ?? "random");
    setError(null);
    try {
      const battle = await api<BattleOut>("/api/battles", {
        method: "POST",
        body: JSON.stringify({ category, scenario_id: scenarioId ?? null }),
      });
      navigate(`/battle/${battle.public_id}`, { state: { fresh: true } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusyScenario(null);
    }
  }

  return (
    <main className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, rgba(124,92,255,0.20), transparent 70%), radial-gradient(30% 40% at 82% 8%, rgba(245,184,61,0.07), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 pb-24">
        <section className="pt-16 text-center sm:pt-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-arena-bright">
            The arena for work you sign your name to
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Which AI is actually good <span className="text-arena-bright">at your job?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-400">
            Blind head-to-heads of real professional work product — redlines, journal entries, risk memos.
            You judge; the board moves; your calibration score grows. Every document is synthetic:
            nothing confidential ever leaves your head.
          </p>
          {latestRelease && (
            <Link
              to="/leaderboard"
              className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold transition hover:bg-gold/20"
            >
              <span>⚡</span>
              <span className="truncate">
                {latestRelease.model.name} shipped a {latestRelease.version} — every board it competes on
                just re-ran. See the movement →
              </span>
            </Link>
          )}
        </section>

        {/* vertical picker */}
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3">
          {verticals.map((v) => (
            <button
              key={v.slug}
              onClick={() => setVertical(v.slug)}
              className={`card p-5 text-left transition ${
                vertical === v.slug ? "border-arena bg-arena/10" : "hover:border-ink-600"
              }`}
            >
              <div className="text-2xl">{v.icon}</div>
              <div className="mt-2 font-display text-lg font-bold">{v.name}</div>
              <div className="mt-1 text-xs text-ink-400">{v.blurb}</div>
            </button>
          ))}
        </div>

        {/* task type chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {verticalCategories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              title={c.blurb}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                category === c.slug
                  ? "border-arena bg-arena/20 text-arena-bright"
                  : "border-ink-700 text-ink-400 hover:border-ink-600 hover:text-ink-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* scenario cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {scenarios.map((s) => (
            <div key={s.id} className="card flex flex-col p-5">
              <div className="font-semibold">{s.title}</div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-400">{s.brief}</p>
              <button
                onClick={() => startBattle(s.id)}
                disabled={busyScenario !== null}
                className="btn-primary mt-4 w-full py-2 text-sm"
              >
                {busyScenario === s.id ? "Summoning five models…" : "Judge this →"}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => startBattle()}
            disabled={busyScenario !== null}
            className="text-sm text-ink-400 transition hover:text-ink-200"
          >
            🎲 Surprise me with a random {verticalCategories.find((c) => c.slug === category)?.name.toLowerCase() ?? "task"}
          </button>
        </div>
        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
        {!loading && !user && (
          <p className="mt-2 text-center text-sm text-ink-400">
            You'll sign in first — your judgments build your reviewer record.
          </p>
        )}

        {/* what's in it for the reviewer */}
        <section className="mt-16">
          <h2 className="text-center font-display text-xl font-bold">Why professionals judge here</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="card p-5">
              <div className="text-2xl">🎯</div>
              <div className="mt-2 font-semibold">Prove your eye</div>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">
                Hidden quality checks measure whether you catch flawed work. Your calibration score is
                evidence your professional judgment is sharp — most people want to know.
              </p>
            </div>
            <div className="card p-5">
              <div className="text-2xl">🏅</div>
              <div className="mt-2 font-semibold">Earn a portable credential</div>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">
                “Calibrated Reviewer — top 10%” is a badge backed by data, not vibes. Ten minutes a week
                maintains it.
              </p>
            </div>
            <div className="card p-5">
              <div className="text-2xl">🔮</div>
              <div className="mt-2 font-semibold">Know before your boss buys</div>
              <p className="mt-1 text-sm leading-relaxed text-ink-400">
                You see which models actually handle your kind of work — weeks before a vendor deck
                reaches your firm.
              </p>
            </div>
          </div>
        </section>

        {models.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-400">
            <span className="text-xs uppercase tracking-widest text-ink-600">In the arena</span>
            {models.slice(0, 7).map((m) => (
              <span key={m.id} className="flex items-center gap-1.5">
                <Monogram name={m.name} size={18} className="!rounded-md" />
                {m.name}
              </span>
            ))}
            <span className="text-ink-600">+{Math.max(models.length - 7, 0)} more</span>
          </div>
        )}

        {stats && (
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [stats.votes.toLocaleString(), "expert judgments"],
              [stats.battles.toLocaleString(), "review sessions"],
              [String(stats.models), "models ranked"],
              [String(stats.categories), "task types"],
            ].map(([v, l]) => (
              <div key={l} className="card px-4 py-4 text-center">
                <div className="font-display text-2xl font-bold text-arena-bright">{v}</div>
                <div className="mt-0.5 text-xs text-ink-400">{l}</div>
              </div>
            ))}
          </div>
        )}

        {top && top.entries.length > 0 && (
          <section className="mt-14">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold">Current champions</h2>
              <Link to="/leaderboard" className="text-sm text-arena-bright hover:underline">
                Full leaderboard →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {top.entries.slice(0, 3).map((e) => (
                <div key={e.model.id} className={`card flex items-center gap-4 p-4 ${e.rank === 1 ? "border-gold/50" : ""}`}>
                  <span className="text-2xl">{e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉"}</span>
                  <Monogram name={e.model.name} size={40} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{e.model.name}</div>
                    <div className="text-xs text-ink-400">
                      {e.model.organization} · {Math.round(e.rating)} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-20 grid gap-8 border-t border-ink-800 pt-10 text-sm sm:grid-cols-3">
          <div>
            <div className="mb-3 font-display font-bold">Verticals</div>
            <p className="leading-relaxed text-ink-400">
              Launching with Legal and Finance/ERP — work that's expert-judged and high-stakes.
              More verticals follow the same playbook.
            </p>
          </div>
          <div>
            <div className="mb-3 font-display font-bold">Trust</div>
            <p className="leading-relaxed text-ink-400">
              Published boards count verified professionals only. Hidden quality checks, timing floors,
              and credential-weighted votes keep the rankings honest.
            </p>
          </div>
          <div>
            <div className="mb-3 font-display font-bold">Method</div>
            <p className="leading-relaxed text-ink-400">
              Blind pairwise judgments fit a Bradley–Terry model; rankings recompute the moment a
              session ends. All documents are synthetic — judge freely.
            </p>
          </div>
        </footer>
      </div>

      {user && !user.vertical && <OnboardingModal user={user} />}
    </main>
  );
}

function OnboardingModal({ user }: { user: UserOut }) {
  const [vertical, setVertical] = useState("legal");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function save() {
    if (!role) return;
    setSaving(true);
    try {
      await api("/api/auth/profile", { method: "POST", body: JSON.stringify({ vertical, role }) });
      window.location.reload();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur">
      <div className="card w-full max-w-md p-6">
        <h2 className="font-display text-xl font-bold">Welcome, {user.display_name}</h2>
        <p className="mt-1 text-sm text-ink-400">
          Tell us what you do — it routes you to the right work and makes your judgments count correctly.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["legal", "finance"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setVertical(v);
                setRole("");
              }}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                vertical === v ? "border-arena bg-arena/15 text-arena-bright" : "border-ink-700 text-ink-300"
              }`}
            >
              {v === "legal" ? "⚖️ Legal" : "🧾 Finance / ERP"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(ROLES[vertical] ?? []).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                role === r ? "border-arena bg-arena/20 text-arena-bright" : "border-ink-700 text-ink-400"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button onClick={() => setDismissed(true)} className="text-sm text-ink-400 hover:text-ink-200">
            Later
          </button>
          <button onClick={save} disabled={!role || saving} className="btn-primary px-5 py-2 text-sm">
            {saving ? "Saving…" : "Start judging"}
          </button>
        </div>
      </div>
    </div>
  );
}
