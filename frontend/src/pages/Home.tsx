import { ArrowRightIcon, BadgeCheckIcon, EyeIcon, TargetIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PromptArena } from "../components/PromptArena";
import { Card, Chip, Eyebrow } from "../components/ui";
import { api, type BattleOut, type CategoryOut, type ReleaseOut, type ScenarioOut } from "../lib/api";
import { VERTICAL_LABELS } from "../lib/view";

const PAYOFFS = [
  {
    icon: TargetIcon,
    title: "Prove your eye",
    body: "Hidden calibration checks are seeded into every session. Catch the flawed draft and your reviewer weight holds.",
  },
  {
    icon: BadgeCheckIcon,
    title: "A portable credential",
    body: "Earn the Calibrated Reviewer badge and a percentile against verified peers in your vertical.",
  },
  {
    icon: EyeIcon,
    title: "Know before your boss buys",
    body: "See which foundation models and vendor products actually hold up on the work you do every week.",
  },
];

interface StatsOut {
  votes: number;
  human_votes: number;
  battles: number;
  models: number;
  categories: number;
}

type ScenarioCard = ScenarioOut & { category: string; vertical: string };

export function Home() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<ScenarioCard[]>([]);
  const [release, setRelease] = useState<ReleaseOut | null>(null);
  const [stats, setStats] = useState<StatsOut | null>(null);
  const [busyCard, setBusyCard] = useState<string | null>(null);

  useEffect(() => {
    api<ReleaseOut[]>("/api/releases?limit=1")
      .then((rs) => setRelease(rs[0] ?? null))
      .catch(() => {});
    api<StatsOut>("/api/stats").then(setStats).catch(() => {});
    api<CategoryOut[]>("/api/categories")
      .then(async (cats) => {
        // One card per vertical flavor: a redline, a risk review, a finance task.
        const picks = ["contract-redline", "clause-risk", "journal-entry"].filter((slug) =>
          cats.some((c) => c.slug === slug),
        );
        const results = await Promise.all(
          picks.map(async (slug) => {
            const scenarios = await api<ScenarioOut[]>(`/api/scenarios/${slug}`);
            const cat = cats.find((c) => c.slug === slug)!;
            return scenarios[0]
              ? [{ ...scenarios[0], category: slug, vertical: VERTICAL_LABELS[cat.vertical] ?? cat.vertical }]
              : [];
          }),
        );
        setCards(results.flat());
      })
      .catch(() => {});
  }, []);

  async function judgeScenario(card: ScenarioCard) {
    setBusyCard(card.id);
    try {
      const battle = await api<BattleOut>("/api/battles", {
        method: "POST",
        body: JSON.stringify({ category: card.category, scenario_id: card.id }),
      });
      navigate(`/judge/${battle.public_id}`);
    } catch {
      setBusyCard(null);
    }
  }

  return (
    <div>
      <section className="pt-4 text-center">
        <Eyebrow>The arena for work you sign your name to</Eyebrow>
        <h1 className="mx-auto mt-4 max-w-2xl text-[42px] font-extrabold leading-[1.1] tracking-tight text-ink">
          Which AI is actually good at your job?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-muted">
          Describe the work. We stage it blind against {stats ? stats.models : "18"} competitors and you call the
          winner.
        </p>
      </section>

      <PromptArena />

      <section aria-labelledby="examples-heading">
        <Eyebrow className="mb-4">
          <span id="examples-heading">Or start from a live scenario</span>
        </Eyebrow>
        <ul className="grid gap-4 md:grid-cols-3">
          {cards.map((scenario) => (
            <Card as="li" key={scenario.id} className="flex flex-col p-5">
              <Chip tone="neutral" className="self-start">
                {scenario.vertical}
              </Chip>
              <h3 className="mt-3 text-[15px] font-bold text-ink">{scenario.title}</h3>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">{scenario.brief}</p>
              <button
                type="button"
                onClick={() => judgeScenario(scenario)}
                disabled={busyCard !== null}
                className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg border border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-panel disabled:opacity-60"
              >
                {busyCard === scenario.id ? "Staging…" : "Judge this"}{" "}
                <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </Card>
          ))}
        </ul>
      </section>

      {release ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e0c4b9] bg-rust-tint px-5 py-4">
            <p className="flex items-center gap-2.5 text-[13.5px] text-ink">
              <ZapIcon className="h-4 w-4 shrink-0 text-rust" aria-hidden="true" />
              <span>
                <strong className="font-bold">{release.model.name}</strong> shipped a {release.version} — every
                board it competes on just re-ran.
              </span>
            </p>
            <Link
              to="/leaderboards"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-rust hover:underline"
            >
              See the movement <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mt-12" aria-labelledby="payoff-heading">
        <Eyebrow className="mb-4">
          <span id="payoff-heading">Why judge</span>
        </Eyebrow>
        <ul className="grid gap-4 md:grid-cols-3">
          {PAYOFFS.map(({ icon: Icon, title, body }) => (
            <Card as="li" key={title} className="p-5">
              <Icon className="h-5 w-5 text-forest" aria-hidden="true" />
              <h3 className="mt-3 text-[15px] font-bold text-ink">{title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{body}</p>
            </Card>
          ))}
        </ul>
      </section>

      <footer className="mt-12 border-t border-hairline pt-5">
        <p className="text-[12.5px] font-semibold tracking-wide text-muted">
          {stats
            ? `${stats.votes.toLocaleString("en-US")} judgments · ${stats.models} competitors · ${stats.categories} boards`
            : "Loading the season…"}
        </p>
      </footer>
    </div>
  );
}
