import { useEffect, useState } from "react";
import Monogram from "../components/Monogram";
import { api, type CategoryOut, type LeaderboardEntryOut, type LeaderboardOut } from "../lib/api";

function Delta({ entry }: { entry: LeaderboardEntryOut }) {
  if (entry.is_new) {
    return <span className="rounded-full bg-arena/20 px-2 py-0.5 text-[10px] font-bold text-arena-bright">NEW</span>;
  }
  if (entry.rank_delta == null) return <span className="text-ink-600">–</span>;
  if (entry.rank_delta > 0) return <span className="font-semibold text-emerald-400">▲ {entry.rank_delta}</span>;
  if (entry.rank_delta < 0) return <span className="font-semibold text-red-400">▼ {-entry.rank_delta}</span>;
  return <span className="text-ink-600">–</span>;
}

export default function Leaderboard() {
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [active, setActive] = useState("overall");
  const [board, setBoard] = useState<LeaderboardOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<CategoryOut[]>("/api/categories").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api<LeaderboardOut>(`/api/leaderboard/${active}`)
      .then(setBoard)
      .catch(() => setBoard(null))
      .finally(() => setLoading(false));
  }, [active]);

  const tabs = [{ slug: "overall", name: "Overall" }, ...categories];
  const entries = board?.entries ?? [];
  const maxRating = entries[0]?.rating ?? 1;
  const minRating = entries[entries.length - 1]?.rating ?? 0;
  const podium = entries.slice(0, 3);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-10">
      <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
      <p className="mt-2 max-w-2xl text-ink-400">
        Live rankings from blind pairwise votes. Recomputed the moment a battle finishes.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.slug}
            onClick={() => setActive(t.slug)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              active === t.slug
                ? "border-arena bg-arena/20 text-arena-bright"
                : "border-ink-700 text-ink-400 hover:border-ink-600 hover:text-ink-200"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {!loading && podium.length === 3 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {podium.map((e) => (
            <div
              key={e.model.id}
              className={`card flex items-center gap-3 p-4 ${e.rank === 1 ? "border-gold/60 shadow-[0_10px_50px_rgba(245,184,61,0.08)]" : ""}`}
            >
              <span className="text-2xl">{e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉"}</span>
              <Monogram name={e.model.name} size={42} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{e.model.name}</div>
                <div className="text-xs text-ink-400">{e.model.organization}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold text-arena-bright">{Math.round(e.rating)}</div>
                <div className="text-xs">
                  <Delta entry={e} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-4 overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-ink-400">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="p-8 text-center text-ink-400">No votes in this category yet — start a battle.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-xs uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3">Rank</th>
                <th className="px-2 py-3">Δ</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">95% CI</th>
                <th className="px-4 py-3">Votes</th>
                <th className="px-4 py-3">Win rate</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const spread = Math.max(maxRating - minRating, 1);
                const barPct = 15 + (85 * (e.rating - minRating)) / spread;
                return (
                  <tr key={e.model.id} className="border-b border-ink-800 last:border-0 hover:bg-ink-800/40">
                    <td className="px-4 py-3">
                      <span
                        className={`font-display font-bold ${e.rank === 1 ? "text-gold" : e.rank <= 3 ? "text-arena-bright" : "text-ink-400"}`}
                      >
                        {e.rank}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-xs">
                      <Delta entry={e} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Monogram name={e.model.name} size={30} />
                        <div>
                          <div className="font-semibold">{e.model.name}</div>
                          <div className="text-xs text-ink-400">{e.model.organization}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-12 font-semibold tabular-nums">{Math.round(e.rating)}</span>
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-ink-700">
                          <div className="h-full rounded-full bg-arena" style={{ width: `${barPct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-400 tabular-nums">
                      {Math.round(e.ci_low)}–{Math.round(e.ci_high)}
                    </td>
                    <td className="px-4 py-3 text-ink-400 tabular-nums">{e.votes.toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums">{(e.win_rate * 100).toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {board?.computed_at && (
        <p className="mt-3 text-xs text-ink-400">
          {board.vote_count.toLocaleString()} votes · last computed {new Date(board.computed_at).toLocaleString()} ·
          algo: {board.algo}
        </p>
      )}

      <div className="card mt-8 p-6">
        <h2 className="font-display text-lg font-bold">Methodology</h2>
        <div className="mt-3 grid gap-4 text-sm leading-relaxed text-ink-400 sm:grid-cols-3">
          <p>
            <b className="text-ink-200">Blind pairwise votes.</b> Every battle draws four models at random; you judge
            head-to-head matches without knowing which model made which design. Each choice is one vote.
          </p>
          <p>
            <b className="text-ink-200">Bradley–Terry ratings.</b> Votes fit a Bradley–Terry model, mapped to an
            Elo-style scale anchored at 1200. Intervals are 95% bootstrap bands — overlapping bands mean the order
            isn't settled yet.
          </p>
          <p>
            <b className="text-ink-200">Live snapshots.</b> The board is a materialized snapshot, recomputed in the
            background the moment a battle completes and by a batch pipeline. Δ shows movement since the previous
            snapshot.
          </p>
        </div>
      </div>
    </main>
  );
}
