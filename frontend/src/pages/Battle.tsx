import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import DesignFrame from "../components/DesignFrame";
import Monogram from "../components/Monogram";
import { api, type BattleOut, type GenerationOut, type MatchOut } from "../lib/api";

const ROUND_LABELS: Record<string, string> = {
  semi1: "Semifinal 1",
  semi2: "Semifinal 2",
  final: "Grand Final",
  third: "Third-place match",
};

const ROUND_SHORT: Record<string, string> = {
  semi1: "SF1",
  semi2: "SF2",
  final: "Final",
  third: "3rd",
};

const POSITION_LETTERS = ["A", "B", "C", "D"];

export default function Battle() {
  const { publicId } = useParams<{ publicId: string }>();
  const location = useLocation();
  const [battle, setBattle] = useState<BattleOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [intro, setIntro] = useState<boolean>(Boolean((location.state as { fresh?: boolean } | null)?.fresh));
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!publicId) return;
    api<BattleOut>(`/api/battles/${publicId}`)
      .then(setBattle)
      .catch((e) => setError(e instanceof Error ? e.message : "Battle not found."));
  }, [publicId]);

  // "Models are generating" intro: stagger card reveals in latency order.
  useEffect(() => {
    if (!intro || !battle) return;
    const ordered = [...battle.generations].sort((a, b) => a.latency_ms - b.latency_ms);
    const timers = ordered.map((g, i) =>
      setTimeout(() => setRevealedIds((prev) => new Set(prev).add(g.id)), 650 + i * 700),
    );
    const done = setTimeout(() => setIntro(false), 650 + ordered.length * 700 + 1100);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [intro, battle]);

  const genById = useMemo(() => {
    const map = new Map<number, GenerationOut>();
    battle?.generations.forEach((g) => map.set(g.id, g));
    return map;
  }, [battle]);

  const currentMatch = useMemo(
    () => battle?.matches.find((m) => m.id === battle.current_match_id) ?? null,
    [battle],
  );

  const decidedCount = battle?.matches.filter((m) => m.winner_generation_id !== null).length ?? 0;

  const vote = useCallback(
    async (winnerGenerationId: number) => {
      if (!battle || !currentMatch || voting || intro) return;
      setVoting(true);
      try {
        const updated = await api<BattleOut>(`/api/battles/${battle.public_id}/votes`, {
          method: "POST",
          body: JSON.stringify({ match_id: currentMatch.id, winner_generation_id: winnerGenerationId }),
        });
        setBattle(updated);
        setExpanded(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Vote failed.");
      } finally {
        setVoting(false);
      }
    },
    [battle, currentMatch, voting, intro],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(null);
      if (!currentMatch || intro) return;
      if (e.key === "ArrowLeft" && currentMatch.a_generation_id) vote(currentMatch.a_generation_id);
      if (e.key === "ArrowRight" && currentMatch.b_generation_id) vote(currentMatch.b_generation_id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentMatch, vote, intro]);

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 pt-24 text-center">
        <p className="text-red-400">{error}</p>
        <Link to="/" className="btn-ghost mt-6">
          ← Back to the arena
        </Link>
      </main>
    );
  }

  if (!battle) {
    return <main className="mx-auto max-w-2xl px-4 pt-24 text-center text-ink-400">Loading battle…</main>;
  }

  if (intro && battle.status === "voting") {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="pt-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-arena-bright">Round of 4 · generating</p>
          <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Four models are designing “{battle.prompt}”
          </h1>
          <p className="mt-2 text-sm text-ink-400">Identities stay hidden until you've judged the whole bracket.</p>
        </section>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {battle.generations.map((g) => {
            const done = revealedIds.has(g.id);
            return (
              <div key={g.id} className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2.5 text-sm">
                  <span className="font-semibold text-ink-200">Design {POSITION_LETTERS[g.position]}</span>
                  {done ? (
                    <span className="text-xs text-emerald-400">✓ finished in {(g.latency_ms / 1000).toFixed(1)}s</span>
                  ) : (
                    <span className="flex items-center gap-2 text-xs text-ink-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-arena" />
                      generating…
                    </span>
                  )}
                </div>
                <div className="aspect-[16/10]">
                  {done ? (
                    <div className="rise h-full">
                      <DesignFrame battleId={battle.public_id} position={g.position} title={`Design ${POSITION_LETTERS[g.position]}`} />
                    </div>
                  ) : (
                    <div className="shimmer h-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setIntro(false)} className="btn-ghost">
            Skip to voting →
          </button>
        </div>
      </main>
    );
  }

  if (battle.status === "complete") {
    return <Reveal battle={battle} genById={genById} />;
  }

  return (
    <main className="mx-auto flex h-[calc(100vh-57px)] max-w-[1600px] flex-col px-4 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-arena-bright">
            {currentMatch ? ROUND_LABELS[currentMatch.round] : "Tournament"} · match {Math.min(decidedCount + 1, 4)} of 4
          </div>
          <h1 className="max-w-3xl truncate font-display text-lg font-bold" title={battle.prompt}>
            “{battle.prompt}”
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          {battle.matches.map((m) => (
            <span
              key={m.id}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                m.winner_generation_id
                  ? "border-arena bg-arena/20 text-arena-bright"
                  : m.id === battle.current_match_id
                    ? "border-arena/60 text-ink-200"
                    : "border-ink-700 text-ink-600"
              }`}
            >
              {ROUND_SHORT[m.round]}
            </span>
          ))}
        </div>
      </div>

      {currentMatch && currentMatch.a_generation_id && currentMatch.b_generation_id ? (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          {[currentMatch.a_generation_id, currentMatch.b_generation_id].map((genId, i) => {
            const gen = genById.get(genId)!;
            return (
              <div key={genId} className="card flex min-h-[320px] flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-ink-700 px-4 py-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink-200">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-700 font-display text-xs">
                      {POSITION_LETTERS[gen.position]}
                    </span>
                    Design {POSITION_LETTERS[gen.position]}
                    <span className="hidden text-xs font-normal text-ink-400 sm:inline">· model hidden</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => setExpanded(gen.position)}
                      className="rounded-lg border border-ink-700 px-2 py-1.5 text-xs text-ink-400 transition hover:text-ink-200"
                      title="Expand"
                    >
                      ⤢
                    </button>
                    <button onClick={() => vote(genId)} disabled={voting} className="btn-primary px-4 py-1.5 text-sm">
                      Vote {i === 0 ? "←" : "→"}
                    </button>
                  </span>
                </div>
                <DesignFrame battleId={battle.public_id} position={gen.position} title={`Design ${POSITION_LETTERS[gen.position]}`} />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="pt-12 text-center text-ink-400">Preparing the next match…</p>
      )}
      <p className="pt-3 text-center text-xs text-ink-400">
        Pick the better design — buttons or ← / → keys. Designs are live: scroll them, play them, then vote.
      </p>

      {expanded !== null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink-950/95 p-4 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display font-bold">Design {POSITION_LETTERS[expanded]} — full view</span>
            <button onClick={() => setExpanded(null)} className="btn-ghost px-3 py-1.5 text-sm">
              ✕ Close (esc)
            </button>
          </div>
          <div className="card min-h-0 flex-1 overflow-hidden">
            <DesignFrame battleId={battle.public_id} position={expanded} title="Expanded design" />
          </div>
        </div>
      )}
    </main>
  );
}

function MatchCard({
  match,
  genById,
  title,
}: {
  match: MatchOut | undefined;
  genById: Map<number, GenerationOut>;
  title: string;
}) {
  if (!match || !match.a_generation_id || !match.b_generation_id) return null;
  const rows = [match.a_generation_id, match.b_generation_id].map((id) => {
    const gen = genById.get(id)!;
    const won = match.winner_generation_id === id;
    return (
      <div
        key={id}
        className={`flex items-center justify-between gap-3 px-4 py-2.5 ${won ? "" : "opacity-45"}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Monogram name={gen.model?.name ?? "?"} size={26} />
          <span className="truncate text-sm font-semibold">{gen.model?.name ?? "Unknown"}</span>
        </span>
        {won && <span className="text-xs font-bold text-arena-bright">WIN</span>}
      </div>
    );
  });
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-800 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
        {title}
      </div>
      <div className="divide-y divide-ink-800">{rows}</div>
    </div>
  );
}

function Reveal({ battle, genById }: { battle: BattleOut; genById: Map<number, GenerationOut> }) {
  const byRound = useMemo(() => {
    const map = new Map<string, MatchOut>();
    battle.matches.forEach((m) => map.set(m.round, m));
    return map;
  }, [battle]);

  const final = byRound.get("final");
  const third = byRound.get("third");

  const standings: { place: string; medal: string; gen: GenerationOut | undefined }[] = [
    { place: "Champion", medal: "🥇", gen: final?.winner_generation_id ? genById.get(final.winner_generation_id) : undefined },
    {
      place: "Runner-up",
      medal: "🥈",
      gen: final ? genById.get(final.winner_generation_id === final.a_generation_id ? final.b_generation_id! : final.a_generation_id!) : undefined,
    },
    { place: "Third", medal: "🥉", gen: third?.winner_generation_id ? genById.get(third.winner_generation_id) : undefined },
    {
      place: "Fourth",
      medal: "4th",
      gen: third ? genById.get(third.winner_generation_id === third.a_generation_id ? third.b_generation_id! : third.a_generation_id!) : undefined,
    },
  ];

  const champion = standings[0].gen;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <section className="pt-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-arena-bright">The reveal</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          {champion?.model?.name ?? "Champion"} takes it
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-400">
          “{battle.prompt}” — your votes are in the global rankings now.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-primary">
            New battle
          </Link>
          <Link to="/leaderboard" className="btn-ghost">
            View leaderboard
          </Link>
        </div>
      </section>

      {/* bracket */}
      <section className="mx-auto mt-12 max-w-3xl">
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-4">
            <MatchCard match={byRound.get("semi1")} genById={genById} title="Semifinal 1" />
            <MatchCard match={byRound.get("semi2")} genById={genById} title="Semifinal 2" />
          </div>
          <div className="hidden text-2xl text-ink-600 sm:block">→</div>
          <div className="flex flex-col gap-4">
            <MatchCard match={final} genById={genById} title="Grand final" />
            <MatchCard match={third} genById={genById} title="Third place" />
          </div>
        </div>
      </section>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {standings.map(({ place, medal, gen }) =>
          gen ? (
            <div key={place} className={`card overflow-hidden ${place === "Champion" ? "border-gold/60" : ""}`}>
              <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{medal}</span>
                  <Monogram name={gen.model?.name ?? "?"} size={34} />
                  <div>
                    <div className="font-semibold">{gen.model?.name ?? "Unknown model"}</div>
                    <div className="text-xs text-ink-400">
                      {gen.model?.organization} · {place} · generated in {(gen.latency_ms / 1000).toFixed(1)}s
                    </div>
                  </div>
                </div>
                <span className="rounded-full border border-ink-700 px-2.5 py-0.5 text-xs text-ink-400">
                  Design {POSITION_LETTERS[gen.position]}
                </span>
              </div>
              <div className="aspect-video">
                <DesignFrame battleId={battle.public_id} position={gen.position} title={`${place} design`} />
              </div>
            </div>
          ) : null,
        )}
      </div>
    </main>
  );
}
