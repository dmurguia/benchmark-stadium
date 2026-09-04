import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { DocModal, DocPanel } from "../components/DocPanel";
import { Button, Eyebrow } from "../components/ui";
import { api, type BattleOut } from "../lib/api";
import { useAuth } from "../lib/auth";
import { CATEGORY_META, scenarioTitle } from "../lib/view";

function ProgressChips({ total, current }: { total: number; current: number }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Session progress">
      {Array.from({ length: total }, (_, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li
            key={i}
            aria-current={state === "current" ? "step" : undefined}
            className={`h-1.5 w-7 rounded-full ${
              state === "done" ? "bg-forest" : state === "current" ? "bg-forest/45" : "bg-hairline"
            }`}
          >
            <span className="sr-only">
              Comparison {i + 1}: {state}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function JudgeSession() {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [battle, setBattle] = useState<BattleOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [expanded, setExpanded] = useState<{ position: number; label: string } | null>(null);

  useEffect(() => {
    if (!battleId) return;
    api<BattleOut>(`/api/battles/${battleId}`)
      .then((b) => {
        if (b.status === "complete") navigate(`/reveal/${b.public_id}`, { replace: true });
        else setBattle(b);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Session not found."));
  }, [battleId, navigate]);

  const positionOf = useMemo(() => {
    const map = new Map<number, number>();
    battle?.generations.forEach((g) => map.set(g.id, g.position));
    return map;
  }, [battle]);

  if (error) {
    return <p className="pt-10 text-center text-[14px] font-semibold text-rust">{error}</p>;
  }
  if (!battle) {
    return <p className="pt-10 text-center text-[14px] text-muted">Setting the field…</p>;
  }

  const decided = battle.matches.filter((m) => m.winner_generation_id != null).length;
  const total = battle.matches.length;
  const match = battle.matches.find((m) => m.id === battle.current_match_id) ?? null;
  const meta = CATEGORY_META[battle.category];
  const gated = !loading && !user && decided >= 1;

  const vote = async (winnerGenerationId: number) => {
    if (!match || voting) return;
    setVoting(true);
    try {
      const updated = await api<BattleOut>(`/api/battles/${battle.public_id}/votes`, {
        method: "POST",
        body: JSON.stringify({ match_id: match.id, winner_generation_id: winnerGenerationId }),
      });
      if (updated.status === "complete") navigate(`/reveal/${updated.public_id}`);
      else setBattle(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vote failed.");
    } finally {
      setVoting(false);
    }
  };

  const aPos = match?.a_generation_id != null ? positionOf.get(match.a_generation_id) : undefined;
  const bPos = match?.b_generation_id != null ? positionOf.get(match.b_generation_id) : undefined;

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <Eyebrow>{meta ? `${meta.vertical} · blind judging` : "Blind judging"}</Eyebrow>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-ink">
            {scenarioTitle(battle.scenario_id) || meta?.label || "Blind session"}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">{battle.prompt}</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-[12.5px] font-bold text-ink">
            Comparison {Math.min(decided + 1, total)} of {total}
          </p>
          <ProgressChips total={total} current={decided} />
        </div>
      </header>

      <div className="relative">
        {gated ? (
          <div className="absolute inset-0 z-10 flex items-start justify-center bg-paper/95 px-6 pt-10">
            <AuthCard
              eyebrow={`Comparison ${Math.min(decided + 1, total)} of ${total}`}
              title="Keep judging — make it count."
              body="Sign in with your work email so your votes carry weight on the boards. Your bracket picks up right where you left it."
            />
          </div>
        ) : null}

        <div className={gated ? "pointer-events-none select-none" : undefined}>
          {match && aPos != null && bPos != null ? (
            <>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="h-[520px]">
                  <DocPanel
                    battleId={battle.public_id}
                    position={aPos}
                    label="Draft A"
                    onExpand={() => setExpanded({ position: aPos, label: "Draft A" })}
                  />
                </div>
                <div className="h-[520px]">
                  <DocPanel
                    battleId={battle.public_id}
                    position={bPos}
                    label="Draft B — author hidden"
                    onExpand={() => setExpanded({ position: bPos, label: "Draft B" })}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Button size="lg" onClick={() => match.a_generation_id && vote(match.a_generation_id)} disabled={gated || voting}>
                  Draft A is better
                </Button>
                <Button size="lg" onClick={() => match.b_generation_id && vote(match.b_generation_id)} disabled={gated || voting}>
                  Draft B is better
                </Button>
              </div>

              <p className="mt-4 text-center text-[12.5px] text-muted">
                Judge on the work product only. Authors stay hidden until the session closes.
              </p>
            </>
          ) : (
            <p className="pt-8 text-center text-[14px] text-muted">Preparing the next comparison…</p>
          )}
        </div>
      </div>

      {expanded ? (
        <DocModal
          battleId={battle.public_id}
          position={expanded.position}
          label={expanded.label}
          onClose={() => setExpanded(null)}
        />
      ) : null}
    </div>
  );
}
