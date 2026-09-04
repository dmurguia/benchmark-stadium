import { ArrowDownIcon, ArrowUpIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/app/AppShell";
import { PaperTexture } from "../components/brand/PaperTexture";
import { Button, Card, Chip, Eyebrow } from "../components/ui";
import { api, type BattleOut, type GenerationOut, type LeaderboardOut } from "../lib/api";
import { CATEGORY_META, scenarioTitle } from "../lib/view";

type MovementRow = { board: string; competitor: string; from: number; to: number };

export function Reveal() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const [battle, setBattle] = useState<BattleOut | null>(null);
  const [movement, setMovement] = useState<MovementRow[]>([]);

  useEffect(() => {
    if (!battleId) return;
    api<BattleOut>(`/api/battles/${battleId}`).then(setBattle).catch(() => {});
  }, [battleId]);

  useEffect(() => {
    if (!battle || battle.status !== "complete") return;
    const meta = CATEGORY_META[battle.category];
    // The background recompute lands within a second or two of the last vote.
    const timer = window.setTimeout(() => {
      api<LeaderboardOut>(`/api/leaderboard/${battle.category}`)
        .then((board) => {
          setMovement(
            board.entries
              .filter((e) => e.rank_delta != null && e.rank_delta !== 0)
              .slice(0, 3)
              .map((e) => ({
                board: meta?.label ?? battle.category,
                competitor: e.model.name,
                from: e.rank + (e.rank_delta as number),
                to: e.rank,
              })),
          );
        })
        .catch(() => {});
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [battle]);

  const genById = useMemo(() => {
    const map = new Map<number, GenerationOut>();
    battle?.generations.forEach((g) => map.set(g.id, g));
    return map;
  }, [battle]);

  if (!battle)
    return (
      <AppShell>
        <p className="pt-16 text-center text-[14px] text-muted">Opening the reveal…</p>
      </AppShell>
    );
  if (battle.status !== "complete") {
    return (
      <AppShell>
        <p className="pt-16 text-center text-[14px] text-muted">
          This session is still in progress.{" "}
          <button className="font-bold text-forest underline" onClick={() => navigate(`/judge/${battle.public_id}`)}>
            Resume judging
          </button>
        </p>
      </AppShell>
    );
  }

  const name = (genId: number | null | undefined) => {
    const model = genId != null ? genById.get(genId)?.model : null;
    return model ? model.name : "Hidden";
  };
  const modelOf = (genId: number | null | undefined) => (genId != null ? genById.get(genId)?.model ?? null : null);
  const loserOf = (m: { a_generation_id: number | null; b_generation_id: number | null; winner_generation_id: number | null }) =>
    m.winner_generation_id === m.a_generation_id ? m.b_generation_id : m.a_generation_id;

  const byRound = Object.fromEntries(battle.matches.map((m) => [m.round, m]));
  const final = byRound["final"];
  const third = byRound["third"];
  const semis = [byRound["semi1"], byRound["semi2"]].filter(Boolean);

  const podium = [
    { mark: "🥇", place: "First", model: modelOf(final?.winner_generation_id) },
    { mark: "🥈", place: "Second", model: modelOf(final ? loserOf(final) : null) },
    { mark: "🥉", place: "Third", model: modelOf(third?.winner_generation_id) },
  ];

  const bracket = [
    {
      round: "Semifinals",
      matches: semis.map((m) => ({ winner: name(m.winner_generation_id), loser: name(loserOf(m)) })),
    },
    { round: "Third place", matches: third ? [{ winner: name(third.winner_generation_id), loser: name(loserOf(third)) }] : [] },
    { round: "Final", matches: final ? [{ winner: name(final.winner_generation_id), loser: name(loserOf(final)) }] : [] },
  ];

  const passed = battle.trap_outcome?.passed;

  return (
    <AppShell>
      <div className="relative min-h-screen">
      <PaperTexture seed={47} />
      <div className="relative mx-auto max-w-[1120px] px-6 py-10 lg:px-10">
      <header className="mb-8">
        <Eyebrow>{scenarioTitle(battle.scenario_id)}</Eyebrow>
        <h1 className="mt-3 font-display text-[34px] leading-tight text-ink">Session complete.</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
          Five comparisons cast. Here is who you were actually reading.
        </p>
      </header>

      <section aria-labelledby="podium-heading">
        <Eyebrow className="mb-3">
          <span id="podium-heading">Podium</span>
        </Eyebrow>
        <ul className="grid gap-4 sm:grid-cols-3">
          {podium.map((entry) => (
            <Card as="li" key={entry.place} className="flex items-center gap-3 p-5">
              <span aria-hidden="true" className="text-2xl">
                {entry.mark}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[15px] font-bold text-ink">
                  <span className="truncate">{entry.model?.name ?? "—"}</span>
                  {entry.model?.kind === "product" ? <Chip tone="rust">PRODUCT</Chip> : null}
                </p>
                <p className="text-[12.5px] text-muted">{entry.model?.organization ?? ""}</p>
              </div>
            </Card>
          ))}
        </ul>
      </section>

      {battle.trap_outcome ? (
        <section className="mt-6">
          <div
            className={`flex items-start gap-3 rounded-xl border px-5 py-4 ${
              passed ? "border-[#c3d2bf] bg-moss-tint" : "border-[#e0c4b9] bg-rust-tint"
            }`}
          >
            {passed ? (
              <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden="true" />
            ) : (
              <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-rust" aria-hidden="true" />
            )}
            <div>
              <p className="text-[14.5px] font-bold text-ink">
                {passed
                  ? "Calibration check: passed — you caught the flawed draft."
                  : "Calibration check: missed — the flawed draft got your vote."}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {passed
                  ? "One comparison in this session hid a deliberately broken work product. Your reviewer weight holds."
                  : "One comparison in this session hid a deliberately broken work product. Miss too many and your reviewer weight decays until you re-calibrate."}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="bracket-heading">
        <Eyebrow className="mb-3">
          <span id="bracket-heading">Bracket recap</span>
        </Eyebrow>
        <Card className="p-5">
          <div className="grid gap-6 sm:grid-cols-3">
            {bracket.map((round) => (
              <div key={round.round}>
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{round.round}</p>
                <ul className="space-y-2.5">
                  {round.matches.map((match) => (
                    <li key={match.winner + match.loser} className="text-[13.5px]">
                      <p className="font-bold text-ink">{match.winner}</p>
                      <p className="text-muted line-through decoration-hairline">{match.loser}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-hairline pt-3 text-[12px] text-muted">
            The calibration comparison scored you, not the models — it never touches the bracket or the boards.
          </p>
        </Card>
      </section>

      {movement.length > 0 ? (
        <section className="mt-10" aria-labelledby="movement-heading">
          <Eyebrow className="mb-3">
            <span id="movement-heading">The board moved with this snapshot</span>
          </Eyebrow>
          <Card className="overflow-hidden">
            <ul className="divide-y divide-hairline">
              {movement.map((m) => {
                const up = m.to < m.from;
                return (
                  <li key={m.board + m.competitor} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <p className="text-[13.5px] text-ink">
                      <span className="font-semibold text-muted">{m.board}:</span>{" "}
                      <span className="font-bold">{m.competitor}</span>{" "}
                      <span className="tabular-nums text-muted">
                        {m.from} → {m.to}
                      </span>
                    </p>
                    <Chip tone={up ? "green" : "rust"}>
                      {up ? (
                        <ArrowUpIcon className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3" aria-hidden="true" />
                      )}
                      {up ? "Up" : "Down"} {Math.abs(m.to - m.from)}
                    </Chip>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" onClick={() => navigate("/")}>
          Judge another
        </Button>
        <Button size="lg" variant="ghost" onClick={() => navigate("/leaderboards")}>
          See the boards
        </Button>
      </div>
      </div>
      </div>
    </AppShell>
  );
}
