import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Monogram from "../components/Monogram";
import { api, ApiError, type ArenaModelOut, type BattleOut, type CategoryOut, type LeaderboardOut } from "../lib/api";
import { useAuth } from "../lib/auth";

const EXAMPLES: Record<string, string[]> = {
  website: [
    "A landing page for a coffee subscription called Driftwood",
    "A portfolio site for a brutalist architecture studio",
    "A launch page for a sleep-tracking app called Lull",
  ],
  "ui-component": [
    "A pricing card for a pro plan with a popular badge",
    "A sign-up form with social login",
    "A music player card for a lo-fi radio app",
  ],
  dataviz: [
    "A weekly activity chart for a running app",
    "Market share breakdown of browser engines",
    "Signups trend over time for a beta launch",
  ],
  game: [
    "A game where you catch falling gems in a neon city",
    "A reaction game about catching shooting stars",
  ],
  "svg-logo": [
    "A logo for a space startup called Nova",
    "A mark for a coffee brand called Ember",
  ],
  "ascii-art": ["A fox in ASCII art", "A rocket launching in ASCII"],
};

const CATEGORY_ICONS: Record<string, string> = {
  website: "🌐",
  "ui-component": "🧩",
  dataviz: "📊",
  game: "🎮",
  "svg-logo": "✒️",
  "ascii-art": "⌨️",
};

interface StatsOut {
  votes: number;
  human_votes: number;
  battles: number;
  models: number;
  categories: number;
}

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [category, setCategory] = useState("website");
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [top, setTop] = useState<LeaderboardOut | null>(null);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [models, setModels] = useState<ArenaModelOut[]>([]);

  useEffect(() => {
    api<CategoryOut[]>("/api/categories").then(setCategories).catch(() => {});
    api<LeaderboardOut>("/api/leaderboard/overall").then(setTop).catch(() => {});
    api<StatsOut>("/api/stats").then(setStats).catch(() => {});
    api<ArenaModelOut[]>("/api/models").then(setModels).catch(() => {});
  }, []);

  function surprise() {
    const pool = EXAMPLES[category] ?? [];
    const next = pool[Math.floor(Math.random() * pool.length)] ?? "";
    setPrompt(next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || submitting) return;
    if (!loading && !user) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const battle = await api<BattleOut>("/api/battles", {
        method: "POST",
        body: JSON.stringify({ prompt, category }),
      });
      navigate(`/battle/${battle.public_id}`, { state: { fresh: true } });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const placeholder = (EXAMPLES[category] ?? [])[0] ?? "Describe what you want to create...";

  return (
    <main className="relative overflow-hidden">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, rgba(124,92,255,0.22), transparent 70%), radial-gradient(30% 40% at 80% 10%, rgba(245,184,61,0.08), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 pb-24">
        <section className="pt-16 text-center sm:pt-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-arena-bright">
            The crowdsourced AI design benchmark
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            What are you creating <span className="text-arena-bright">today?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-ink-400">
            Four anonymous AI models design it. You judge the tournament. Every vote moves the global leaderboard.
          </p>
        </section>

        <form onSubmit={submit} className="mx-auto mt-10 max-w-3xl">
          <div className="card overflow-hidden shadow-[0_20px_80px_rgba(124,92,255,0.12)] focus-within:border-arena">
            <div className="flex items-center gap-2 border-b border-ink-800 px-5 py-2.5 text-sm text-ink-400">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-arena text-[11px]">⚔️</span>
              Ask Design Arena to create…
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
              }}
              rows={3}
              placeholder={placeholder}
              className="w-full resize-none bg-transparent px-5 py-4 text-lg outline-none placeholder:text-ink-600"
            />
            <div className="grid grid-cols-3 gap-2 px-4 pb-3 sm:grid-cols-6">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setCategory(c.slug)}
                  title={c.blurb}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs transition ${
                    category === c.slug
                      ? "border-arena bg-arena/15 text-arena-bright"
                      : "border-ink-800 text-ink-400 hover:border-ink-600 hover:text-ink-200"
                  }`}
                >
                  <span className="text-lg leading-none">{CATEGORY_ICONS[c.slug] ?? "✨"}</span>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-ink-800 px-4 py-3">
              <button type="button" onClick={surprise} className="text-sm text-ink-400 transition hover:text-ink-200">
                🎲 Surprise me
              </button>
              <button type="submit" disabled={submitting || !prompt.trim()} className="btn-primary">
                {submitting ? "Summoning four models…" : "Start battle →"}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
          {!loading && !user && (
            <p className="mt-3 text-center text-sm text-ink-400">
              You'll be asked to sign in first — battles are saved to your account.
            </p>
          )}
        </form>

        {models.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-400">
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
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [stats.votes.toLocaleString(), "votes cast"],
              [stats.battles.toLocaleString(), "battles fought"],
              [String(stats.models), "models ranked"],
              [String(stats.categories), "categories"],
            ].map(([v, l]) => (
              <div key={l} className="card px-4 py-4 text-center">
                <div className="font-display text-2xl font-bold text-arena-bright">{v}</div>
                <div className="mt-0.5 text-xs text-ink-400">{l}</div>
              </div>
            ))}
          </div>
        )}

        {top && top.entries.length > 0 && (
          <section className="mt-16">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-xl font-bold">Current champions</h2>
              <Link to="/leaderboard" className="text-sm text-arena-bright hover:underline">
                Full leaderboard →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {top.entries.slice(0, 3).map((e) => (
                <div
                  key={e.model.id}
                  className={`card flex items-center gap-4 p-4 ${e.rank === 1 ? "border-gold/50" : ""}`}
                >
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
            <div className="mb-3 font-display font-bold">Create</div>
            <div className="flex flex-col gap-2 text-ink-400">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  className="w-fit transition hover:text-ink-200"
                  onClick={() => {
                    setCategory(c.slug);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 font-display font-bold">Leaderboards</div>
            <div className="flex flex-col gap-2 text-ink-400">
              <Link to="/leaderboard" className="transition hover:text-ink-200">
                Overall
              </Link>
              {categories.map((c) => (
                <Link key={c.slug} to="/leaderboard" className="transition hover:text-ink-200">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 font-display font-bold">How it works</div>
            <p className="leading-relaxed text-ink-400">
              Every battle pits four randomly drawn models against each other, anonymously. Your pairwise votes fit a
              Bradley–Terry model — the same statistics behind the big arenas — and rankings recompute the moment a
              battle ends.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
