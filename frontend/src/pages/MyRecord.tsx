import { ArrowRightIcon, BadgeCheckIcon, CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { OnboardingCard } from "../components/OnboardingCard";
import { Button, Card, Chip, Eyebrow } from "../components/ui";
import { api, type BattleSummaryOut, type ReviewerStatsOut } from "../lib/api";
import { useAuth } from "../lib/auth";
import { CATEGORY_META, VERTICAL_LABELS } from "../lib/view";

const LADDER = ["Apprentice", "Calibrated Reviewer", "Top Reviewer"];

const TIER_LABELS: Record<number, string> = {
  0: "Tier 0 · Self-declared",
  1: "Tier 1 · Work-domain verified",
  2: "Tier 2 · License verified",
  3: "Tier 3 · Named reviewer",
};

function initials(name: string) {
  return (
    name
      .replace(/[^A-Za-z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function MyRecord() {
  const { user, loading, signIn } = useAuth();
  const [stats, setStats] = useState<ReviewerStatsOut | null>(null);
  const [sessions, setSessions] = useState<BattleSummaryOut[]>([]);

  useEffect(() => {
    if (!user) return;
    api<ReviewerStatsOut>("/api/auth/reviewer").then(setStats).catch(() => {});
    api<BattleSummaryOut[]>("/api/battles")
      .then((b) => setSessions(b.slice(0, 5)))
      .catch(() => {});
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="flex justify-center pt-10">
        <AuthCard
          eyebrow="My Record"
          title="Your calibration lives here."
          body="Sign in to see your calibration score, percentile, and badge progress."
        />
      </div>
    );
  }
  if (user && !user.vertical) {
    return (
      <div className="flex justify-center pt-10">
        <OnboardingCard
          onDone={(updated) => {
            const token = localStorage.getItem("da_token") ?? "";
            signIn(token, updated);
          }}
        />
      </div>
    );
  }
  if (!user) return null;

  const ladderIndex = stats?.badge.includes("Top") ? 2 : stats?.badge.includes("Calibrated") ? 1 : 0;
  const cards = [
    {
      label: "Calibration score",
      value: stats?.calibration_pct != null ? `${Math.round(stats.calibration_pct)}%` : "—",
      note: stats
        ? `${stats.traps_passed} of ${stats.traps_total} hidden checks caught`
        : "Judge a session to start",
    },
    {
      label: "Percentile",
      value: stats?.percentile != null ? `Top ${Math.max(1, Math.round(100 - stats.percentile))}%` : "—",
      note: `Of ${VERTICAL_LABELS[user.vertical] ?? user.vertical} reviewers this season`,
    },
    {
      label: "Consensus agreement",
      value: stats?.consensus_pct != null ? `${Math.round(stats.consensus_pct)}%` : "—",
      note: "Against verified peers on identical comparisons",
    },
    {
      label: "Judgments",
      value: stats ? `${stats.votes_cast}` : "—",
      note: stats ? `${stats.votes_cast} cast · ${stats.counted_votes} counted` : "",
    },
  ];

  const upgrade =
    user.tier < 2
      ? user.vertical === "finance"
        ? { title: "Verify your CPA license to reach Tier 2", body: "Your votes would carry 1.5× weight on the Finance/ERP boards." }
        : { title: "Verify your bar admission to reach Tier 2", body: "Your votes would carry 1.5× weight on the Legal boards." }
      : null;

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-5 border-b border-hairline pb-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-forest text-[16px] font-bold text-paper"
          >
            {initials(user.display_name || user.email)}
          </span>
          <div>
            <Eyebrow>Reviewer profile</Eyebrow>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">
              {user.display_name || user.email}
            </h1>
            <p className="mt-1 text-[14px] text-muted">
              {user.role || "Reviewer"} · {VERTICAL_LABELS[user.vertical] ?? user.vertical}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="solid">{TIER_LABELS[user.tier] ?? `Tier ${user.tier}`}</Chip>
          {stats ? (
            <Chip tone="green">
              <BadgeCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {stats.badge}
            </Chip>
          ) : null}
        </div>
      </header>

      <section aria-label="Reviewer statistics">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((stat) => (
            <Card as="li" key={stat.label} className="p-5">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
              <p className="mt-2.5 text-2xl font-extrabold tabular-nums tracking-tight text-ink">{stat.value}</p>
              <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{stat.note}</p>
            </Card>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="ladder-heading">
        <Eyebrow className="mb-4">
          <span id="ladder-heading">Badge ladder</span>
        </Eyebrow>
        <Card className="p-6">
          <ol className="flex items-center">
            {LADDER.map((name, i) => {
              const state = i < ladderIndex ? "done" : i === ladderIndex ? "current" : "todo";
              return (
                <li key={name} className="flex flex-1 items-center last:flex-none">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                        state === "done"
                          ? "border-forest bg-forest text-paper"
                          : state === "current"
                            ? "border-forest bg-moss-tint text-forest"
                            : "border-hairline bg-paper text-muted"
                      }`}
                    >
                      {state === "done" ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className={`text-[13.5px] ${state === "todo" ? "text-muted" : "font-bold text-ink"}`}>
                      {name}
                    </span>
                  </div>
                  {i < LADDER.length - 1 ? (
                    <span aria-hidden="true" className={`mx-4 h-px flex-1 ${state === "done" ? "bg-forest" : "bg-hairline"}`} />
                  ) : null}
                </li>
              );
            })}
          </ol>
          <p className="mt-5 border-t border-hairline pt-4 text-[12.5px] text-muted">
            Calibrated Reviewer unlocks at an 80% calibration score across 3 checks; Top Reviewer at 90% across 10
            with a top-quartile consensus record.
          </p>
        </Card>
      </section>

      {upgrade ? (
        <section className="mt-6">
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h2 className="text-[15px] font-bold text-ink">{upgrade.title}</h2>
              <p className="mt-1 text-[13.5px] text-muted">{upgrade.body}</p>
            </div>
            <Button title="License verification is a placeholder in the prototype">
              Verify license <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Card>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="recent-heading">
        <Eyebrow className="mb-4">
          <span id="recent-heading">Recent sessions</span>
        </Eyebrow>
        <Card className="overflow-hidden">
          {sessions.length === 0 ? (
            <p className="p-6 text-center text-[13.5px] text-muted">
              No sessions yet —{" "}
              <Link to="/" className="font-bold text-forest hover:underline">
                judge your first
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {sessions.map((session) => {
                const meta = CATEGORY_META[session.category];
                return (
                  <li key={session.public_id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-[14px] font-bold text-ink">{session.prompt}</p>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {meta?.label ?? session.category} ·{" "}
                        {new Date(session.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <Chip tone={session.status === "complete" ? "green" : "neutral"}>
                      {session.status === "complete" ? "Complete" : "In progress"}
                    </Chip>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
