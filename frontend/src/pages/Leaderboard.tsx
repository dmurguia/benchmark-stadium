import { useCallback, useEffect, useMemo, useState } from "react";
import Monogram from "../components/Monogram";
import {
  api,
  type ArenaModelOut,
  type CategoryOut,
  type LeaderboardEntryOut,
  type LeaderboardOut,
  type ReleaseOut,
  type VerticalOut,
} from "../lib/api";

function ProductChip({ model }: { model: ArenaModelOut }) {
  if (model.kind !== "product") return null;
  return (
    <span className="rounded-full border border-gold/50 bg-gold/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold">
      Product
    </span>
  );
}

function modelSubtext(model: ArenaModelOut): string {
  if (model.kind !== "product") return model.organization;
  return `${model.organization} · ${model.provenance} · ${model.submitted_version}`;
}

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
  const [verticals, setVerticals] = useState<VerticalOut[]>([]);
  const [categories, setCategories] = useState<CategoryOut[]>([]);
  const [active, setActive] = useState("overall");
  const [board, setBoard] = useState<LeaderboardOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [releases, setReleases] = useState<ReleaseOut[]>([]);
  const [simBusy, setSimBusy] = useState(false);

  useEffect(() => {
    api<VerticalOut[]>("/api/verticals").then(setVerticals).catch(() => {});
    api<CategoryOut[]>("/api/categories").then(setCategories).catch(() => {});
    api<ReleaseOut[]>("/api/releases?limit=4").then(setReleases).catch(() => {});
  }, []);

  const loadBoard = useCallback(() => {
    setLoading(true);
    api<LeaderboardOut>(`/api/leaderboard/${active}`)
      .then(setBoard)
      .catch(() => setBoard(null))
      .finally(() => setLoading(false));
  }, [active]);

  useEffect(loadBoard, [loadBoard]);

  async function simulateRelease() {
    setSimBusy(true);
    try {
      await api<ReleaseOut>("/api/releases/simulate", { method: "POST", body: JSON.stringify({}) });
      setReleases(await api<ReleaseOut[]>("/api/releases?limit=4"));
      loadBoard();
    } catch {
      /* dev toy — ignore */
    } finally {
      setSimBusy(false);
    }
  }

  const groups = useMemo(
    () =>
      verticals.map((v) => ({
        vertical: v,
        categories: categories.filter((c) => c.vertical === v.slug),
      })),
    [verticals, categories],
  );

  const entries = board?.entries ?? [];
  const maxRating = entries[0]?.rating ?? 1;
  const minRating = entries[entries.length - 1]?.rating ?? 0;
  const podium = entries.slice(0, 3);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-10">
      <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
      <p className="mt-2 max-w-2xl text-ink-400">
        Live rankings from blind judgments by verified professionals. Recomputed the moment a review
        session finishes.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActive("overall")}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            active === "overall"
              ? "border-arena bg-arena/20 text-arena-bright"
              : "border-ink-700 text-ink-400 hover:border-ink-600 hover:text-ink-200"
          }`}
        >
          Overall
        </button>
        {groups.map(({ vertical, categories: cats }) => (
          <span key={vertical.slug} className="flex items-center gap-2">
            <span className="ml-2 text-xs uppercase tracking-widest text-ink-600">
              {vertical.icon} {vertical.name}
            </span>
            {cats.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  active === c.slug
                    ? "border-arena bg-arena/20 text-arena-bright"
                    : "border-ink-700 text-ink-400 hover:border-ink-600 hover:text-ink-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </span>
        ))}
      </div>

      {releases.length > 0 && (
        <div className="card mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">⚡ Release radar</h2>
            <button
              onClick={simulateRelease}
              disabled={simBusy}
              className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs text-ink-400 transition hover:border-ink-600 hover:text-ink-200 disabled:opacity-50"
              title="Dev: fake the next model release and watch the boards re-run"
            >
              {simBusy ? "Re-running boards…" : "Simulate next release (dev)"}
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-400">
            When a model ships, its rows re-run automatically on every board it competes on. The movement is the story.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {releases.map((r) => {
              const moved = r.movement.filter((m) => m.before_rank != null && m.before_rank !== m.after_rank);
              return (
                <div key={r.id} className="rounded-xl border border-ink-800 bg-ink-900/60 p-4">
                  <div className="flex items-center gap-3">
                    <Monogram name={r.model.name} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">
                        {r.model.name} <span className="text-ink-400">· {r.version}</span>
                      </div>
                      <div className="text-xs text-ink-400">
                        {new Date(r.released_at).toLocaleDateString()} · {r.rerun_votes.toLocaleString()} re-run judgments
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {moved.length === 0 ? (
                      <span className="rounded-full bg-ink-800 px-2.5 py-1 text-ink-400">Held every rank</span>
                    ) : (
                      moved.map((m) => (
                        <span
                          key={m.category}
                          className={`rounded-full px-2.5 py-1 font-semibold ${
                            m.after_rank < (m.before_rank ?? 99)
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {m.category_name} {m.before_rank} → {m.after_rank}{" "}
                          {m.after_rank < (m.before_rank ?? 99) ? "▲" : "▼"}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-1.5 truncate font-semibold">
                  {e.model.name} <ProductChip model={e.model} />
                </div>
                <div className="truncate text-xs text-ink-400">{modelSubtext(e.model)}</div>
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
          <p className="p-8 text-center text-ink-400">No judgments in this board yet — run a review session.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-xs uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3">Rank</th>
                <th className="px-2 py-3">Δ</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">95% CI</th>
                <th className="px-4 py-3">Judgments</th>
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
                          <div className="flex items-center gap-1.5 font-semibold">
                            {e.model.name} <ProductChip model={e.model} />
                          </div>
                          <div className="text-xs text-ink-400">{modelSubtext(e.model)}</div>
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

      {(board?.declined?.length ?? 0) > 0 && (
        <div className="card mt-4 border-dashed p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-bold text-ink-200">Not on this board</h2>
            <span className="text-xs text-ink-500">Every vendor in the vertical gets the same invitation.</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {board!.declined.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-3 rounded-xl border border-dashed border-ink-700 bg-ink-900/40 px-4 py-3 opacity-80"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-ink-600 text-ink-500">
                  ?
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink-300">{d.name}</div>
                  <div className="truncate text-xs text-ink-500">
                    {d.organization} · {d.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Vendor of one of these?{" "}
            <span className="text-arena-bright">Submit your product for the next board cut →</span> Your buyers are
            already comparing you here — with or without your best version.
          </p>
        </div>
      )}

      {board?.computed_at && (
        <p className="mt-3 text-xs text-ink-400">
          {board.vote_count.toLocaleString()} verified judgments · last computed{" "}
          {new Date(board.computed_at).toLocaleString()} · algo: {board.algo}
        </p>
      )}

      <div className="card mt-8 p-6">
        <h2 className="font-display text-lg font-bold">How this board stays honest</h2>
        <div className="mt-3 grid gap-4 text-sm leading-relaxed text-ink-400 sm:grid-cols-3">
          <p>
            <b className="text-ink-200">Verified votes only.</b> Judgments are weighted by credential tier
            — work-domain verified and up count; self-declared accounts are directional only and never
            reach this board.
          </p>
          <p>
            <b className="text-ink-200">Hidden quality checks.</b> Every session includes a comparison
            with an objectively flawed work product. Raters who miss them lose weight; bots never gain it.
          </p>
          <p>
            <b className="text-ink-200">Bradley–Terry, snapshotted.</b> Weighted pairwise votes fit a
            Bradley–Terry model (1200 anchor, bootstrap 95% bands), materialized as snapshots. Δ shows
            movement since the previous snapshot.
          </p>
        </div>
      </div>
    </main>
  );
}
