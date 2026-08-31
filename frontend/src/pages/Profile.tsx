import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError, type ReviewerStatsOut } from "../lib/api";
import { useAuth } from "../lib/auth";

const TIER_LABELS: Record<number, string> = {
  0: "Self-declared",
  1: "Verified work domain",
  2: "Verified license",
  3: "Named reviewer",
};

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReviewerStatsOut | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }
    api<ReviewerStatsOut>("/api/auth/reviewer")
      .then(setStats)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) navigate("/login");
      });
  }, [user, loading, navigate]);

  if (!user || !stats) {
    return <main className="mx-auto max-w-2xl px-4 pt-24 text-center text-ink-400">Loading your record…</main>;
  }

  const tiles: [string, string, string][] = [
    [String(stats.votes_cast), "judgments cast", "every blind pick you've made"],
    [String(stats.counted_votes), "counted on boards", "cleared the timing floor"],
    [
      stats.calibration_pct != null ? `${stats.calibration_pct}%` : "—",
      "calibration score",
      `${stats.traps_passed}/${stats.traps_total} hidden quality checks caught`,
    ],
    [
      stats.consensus_pct != null ? `${stats.consensus_pct}%` : "—",
      "consensus agreement",
      "vs. other verified reviewers on identical pairs",
    ],
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
      <div className="card relative overflow-hidden p-8 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(124,92,255,0.15), transparent 70%)" }}
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-arena-bright">Reviewer record</p>
          <h1 className="mt-2 font-display text-3xl font-bold">{user.display_name}</h1>
          <p className="mt-1 text-sm text-ink-400">
            {user.role || "Reviewer"} · {user.vertical === "finance" ? "Finance / ERP" : user.vertical === "legal" ? "Legal" : "No vertical yet"} ·{" "}
            {TIER_LABELS[stats.tier] ?? "Reviewer"}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-5 py-2 font-display font-bold text-gold">
            🏅 {stats.badge}
            {stats.percentile != null && stats.percentile >= 50 && (
              <span className="text-xs font-normal text-ink-200">· top {Math.max(1, Math.round(100 - stats.percentile))}% of raters</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([v, l, sub]) => (
          <div key={l} className="card px-4 py-5 text-center">
            <div className="font-display text-2xl font-bold text-arena-bright">{v}</div>
            <div className="mt-0.5 text-xs font-semibold text-ink-200">{l}</div>
            <div className="mt-1 text-[11px] leading-snug text-ink-400">{sub}</div>
          </div>
        ))}
      </div>

      <div className="card mt-4 p-6 text-sm leading-relaxed text-ink-400">
        <h2 className="font-display text-lg font-bold text-ink-50">How your judgments count</h2>
        <p className="mt-2">
          Your credential tier sets the weight of every vote you cast: self-declared accounts are
          directional only, <b className="text-ink-200">verified work domains count at full weight</b>, and
          licensed / named reviewers count more. Hidden quality checks (one per session) feed your
          calibration score — the higher it is, the stronger your claim to the Calibrated Reviewer badge.
        </p>
        <p className="mt-2">
          License verification (bar number, CPA, SAP certification) is coming — it upgrades you to tier 2
          and 1.5× vote weight.
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="btn-primary">
          Judge more work →
        </Link>
      </div>
    </main>
  );
}
