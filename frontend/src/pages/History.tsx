import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError, type BattleSummaryOut } from "../lib/api";
import { useAuth } from "../lib/auth";

const STATUS_LABEL: Record<string, string> = {
  voting: "Voting in progress",
  complete: "Complete",
  generating: "Generating",
};

export default function History() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [battles, setBattles] = useState<BattleSummaryOut[] | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { state: { from: "/history" } });
      return;
    }
    api<BattleSummaryOut[]>("/api/battles")
      .then(setBattles)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) navigate("/login");
      });
  }, [user, loading, navigate]);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
      <h1 className="font-display text-3xl font-bold">My battles</h1>
      <p className="mt-2 text-ink-400">Every prompt you've run, and who won.</p>

      {battles === null ? (
        <p className="mt-10 text-ink-400">Loading…</p>
      ) : battles.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <p className="text-ink-400">No battles yet.</p>
          <Link to="/" className="btn-primary mt-4">
            Start your first battle
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {battles.map((b) => (
            <li key={b.public_id}>
              <Link to={`/battle/${b.public_id}`} className="card flex items-center justify-between gap-4 p-4 transition hover:border-ink-600">
                <div className="min-w-0">
                  <div className="truncate font-semibold">“{b.prompt}”</div>
                  <div className="mt-1 text-xs text-ink-400">
                    {b.category} · {new Date(b.created_at).toLocaleString()} · {STATUS_LABEL[b.status] ?? b.status}
                  </div>
                </div>
                {b.winner_model ? (
                  <div className="shrink-0 text-right">
                    <div className="text-xs text-ink-400">Winner</div>
                    <div className="text-sm font-semibold text-gold">🏆 {b.winner_model.name}</div>
                  </div>
                ) : (
                  <span className="shrink-0 rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-400">
                    {b.status === "voting" ? "Resume voting →" : "…"}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
