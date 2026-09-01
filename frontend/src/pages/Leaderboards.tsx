import {
  ArrowRightIcon,
  CalculatorIcon,
  LayersIcon,
  ScaleIcon,
  TrophyIcon,
  ZapIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BoardChart, type Metric } from "../components/BoardChart";
import { BoardTable } from "../components/BoardTable";
import { Card, Chip, Eyebrow, PageHeader } from "../components/ui";
import { api, type LeaderboardOut, type ReleaseOut } from "../lib/api";
import type { Competitor, EmptyChair, ReleaseView } from "../data/leaderboards";
import { toCompetitor, toEmptyChair, toReleaseView } from "../lib/view";

const METHODOLOGY = [
  {
    title: "Verified votes only",
    body: "Only judgments from reviewers with a verified work domain are counted. Free-email votes are recorded as directional and excluded from scores.",
  },
  {
    title: "Hidden quality checks",
    body: "Every session seeds a calibration comparison with a known-flawed draft. Miss too many and your weight decays until you re-calibrate.",
  },
  {
    title: "Weighted Bradley–Terry, snapshotted",
    body: "Scores come from a credential-weighted Bradley–Terry fit, recomputed the moment a session closes and snapshotted so a board can always be reproduced.",
  },
];

const TABS = [
  { id: "Overall", label: "Overall", icon: LayersIcon },
  { id: "Legal", label: "Legal", icon: ScaleIcon },
  { id: "Finance/ERP", label: "Finance/ERP", icon: CalculatorIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

const GROUP_BOARDS: Record<TabId, { id: string; label: string; blurb: string }[]> = {
  Overall: [
    {
      id: "overall",
      label: "Overall",
      blurb: "All verticals pooled — every counted judgment across the boards feeds this fit.",
    },
  ],
  Legal: [
    {
      id: "contract-redline",
      label: "Contract Redline",
      blurb: "Markup quality on vendor agreements and NDAs: does the draft protect the stated party without over-lawyering?",
    },
    {
      id: "clause-risk",
      label: "Clause Risk Review",
      blurb: "Spotting and ranking risk in a counterparty draft: indemnity scope, liability caps, IP assignment, termination traps.",
    },
  ],
  "Finance/ERP": [
    {
      id: "journal-entry",
      label: "Journal Entries",
      blurb: "Accounting judgment on real postings: right accounts, balanced entries, clean support for the position taken.",
    },
    {
      id: "coa-mapping",
      label: "Account Mapping",
      blurb: "Legacy chart-of-accounts migration calls: which target account each balance actually belongs in.",
    },
  ],
};

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-hairline bg-panel p-0.5">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`rounded-md px-3 py-1.5 text-[12.5px] font-bold transition-colors ${
              active ? "bg-card text-ink shadow-whisper" : "text-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Leaderboards() {
  const [tab, setTab] = useState<TabId>("Overall");
  const [boardId, setBoardId] = useState("overall");
  const [metric, setMetric] = useState<Metric>("score");
  const [view, setView] = useState<"chart" | "table">("chart");
  const [rows, setRows] = useState<Competitor[]>([]);
  const [chairs, setChairs] = useState<EmptyChair[]>([]);
  const [judgments, setJudgments] = useState(0);
  const [releases, setReleases] = useState<ReleaseView[]>([]);
  const [simBusy, setSimBusy] = useState(false);

  const tabBoards = GROUP_BOARDS[tab];
  const board = tabBoards.find((b) => b.id === boardId) ?? tabBoards[0];
  const showRail = tabBoards.length > 1;

  const loadBoard = useCallback((id: string) => {
    api<LeaderboardOut>(`/api/leaderboard/${id}`)
      .then((data) => {
        setRows(data.entries.map(toCompetitor));
        setChairs(data.declined.map(toEmptyChair));
        setJudgments(data.vote_count);
      })
      .catch(() => {
        setRows([]);
        setChairs([]);
      });
  }, []);

  const loadReleases = useCallback(() => {
    api<ReleaseOut[]>("/api/releases?limit=3")
      .then((rs) => setReleases(rs.map(toReleaseView)))
      .catch(() => {});
  }, []);

  useEffect(() => loadBoard(board.id), [board.id, loadBoard]);
  useEffect(loadReleases, [loadReleases]);

  const selectTab = (id: TabId) => {
    setTab(id);
    setBoardId(GROUP_BOARDS[id][0].id);
  };

  const simulate = async () => {
    setSimBusy(true);
    try {
      await api("/api/releases/simulate", { method: "POST", body: JSON.stringify({}) });
      loadReleases();
      loadBoard(board.id);
    } catch {
      /* dev toy */
    } finally {
      setSimBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Company boards · Q3 2026"
        title="Leaderboards"
        description="Foundation models and vendor products, ranked by credential-weighted judgments from working professionals."
      />

      <div role="tablist" aria-label="Verticals" className="mb-6 flex flex-wrap items-center gap-2 border-b border-hairline pb-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => selectTab(id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-bold transition-colors ${
                active ? "bg-forest text-paper" : "bg-panel text-muted hover:bg-panel/70 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      {releases.length > 0 ? (
        <Card className="mb-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ZapIcon className="h-4 w-4 text-rust" aria-hidden="true" />
              <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink">Release radar</h2>
            </div>
            <button
              type="button"
              onClick={simulate}
              disabled={simBusy}
              className="rounded-lg border border-hairline px-3 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:bg-panel hover:text-ink disabled:opacity-50"
              title="Dev: fake the next model release and watch the boards re-run"
            >
              {simBusy ? "Re-running boards…" : "Simulate next release (dev)"}
            </button>
          </div>
          <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
            {releases.map((release) => (
              <li key={release.id} className="flex flex-wrap items-center gap-4 py-3.5">
                <div className="min-w-[240px] flex-1">
                  <p className="text-[14px] font-bold text-ink">
                    {release.competitor} <span className="font-semibold text-muted">— {release.label}</span>
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    {release.org} · {release.date} · {release.reruns}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {release.movements.filter((m) => m.to !== m.from).length === 0 ? (
                    <Chip tone="neutral">Held every rank</Chip>
                  ) : (
                    release.movements
                      .filter((m) => m.to !== m.from)
                      .map((m) => {
                        const up = m.to < m.from;
                        return (
                          <Chip key={m.board} tone={up ? "green" : "rust"}>
                            {m.board} {m.from} → {m.to} {up ? "▲" : "▼"}
                          </Chip>
                        );
                      })
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3.5 text-[12.5px] leading-relaxed text-muted">
            When a model ships, its rows re-run on every board it competes on. The movement is the story.
          </p>
        </Card>
      ) : null}

      <div className={showRail ? "grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]" : "grid items-start gap-6"}>
        {showRail ? (
          <nav aria-label={`${tab} boards`} className="lg:sticky lg:top-8">
            <Eyebrow className="mb-3">Boards</Eyebrow>
            <ul className="space-y-2">
              {tabBoards.map((b) => {
                const active = b.id === board.id;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => setBoardId(b.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-3 text-left text-[13.5px] font-bold transition-colors ${
                        active ? "border-forest bg-forest text-paper" : "border-hairline bg-card text-ink hover:border-forest/40"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                          active ? "border-paper" : "border-hairline"
                        }`}
                      >
                        {active ? <span className="h-1.5 w-1.5 rounded-full bg-paper" /> : null}
                      </span>
                      {b.label}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[12px] leading-relaxed text-muted">
              {tabBoards.length} boards in {tab}. Scores refit as sessions close.
            </p>
          </nav>
        ) : null}

        <div className="min-w-0">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline px-5 py-4">
              <div className="min-w-[260px] flex-1">
                <h2 className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-ink">
                  <TrophyIcon className="h-4 w-4 text-forest" aria-hidden="true" />
                  {board.label}
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{board.blurb}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="neutral">{judgments.toLocaleString("en-US")} judgments</Chip>
                <Segmented
                  label="Metric"
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { id: "score" as Metric, label: "Score" },
                    { id: "winRate" as Metric, label: "Win rate" },
                  ]}
                />
                <Segmented
                  label="View"
                  value={view}
                  onChange={setView}
                  options={[
                    { id: "chart" as const, label: "Chart" },
                    { id: "table" as const, label: "Table" },
                  ]}
                />
              </div>
            </div>

            {rows.length === 0 ? (
              <p className="px-5 py-10 text-center text-[14px] text-muted">
                No judgments on this board yet — run a session.
              </p>
            ) : view === "chart" ? (
              <BoardChart rows={rows} metric={metric} />
            ) : (
              <BoardTable rows={rows} />
            )}

            <p className="border-t border-hairline px-5 py-3 text-[12px] text-muted">
              {metric === "score"
                ? "Credential-weighted Bradley–Terry score (1200 anchor). Bars are scaled to the spread on this board; switch to the table for 95% CI and judgment counts."
                : "Share of head-to-head comparisons won against every other competitor on this board."}
            </p>
          </Card>

          {chairs.length > 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-hairline bg-transparent p-5">
              <Eyebrow>Not on this board</Eyebrow>
              <ul className="mt-4 divide-y divide-hairline/70">
                {chairs.map((chair) => (
                  <li key={chair.name} className="flex items-center gap-3 py-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-hairline text-[13px] font-bold text-hairline"
                    >
                      ?
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-muted/80">
                        {chair.name} <span className="font-semibold">— {chair.org}</span>
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-muted/80">{chair.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-hairline pt-4">
                <a
                  href="#submit"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-forest hover:underline"
                >
                  Vendor of one of these? Submit your product for the next board cut
                  <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <p className="mt-1.5 text-[12.5px] text-muted">
                  Your buyers are already comparing you here — with or without your best version.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-10 border-t border-hairline pt-6">
        <Eyebrow className="mb-4">How this board stays honest</Eyebrow>
        <ul className="grid gap-6 md:grid-cols-3">
          {METHODOLOGY.map((item) => (
            <li key={item.title}>
              <h3 className="text-[14px] font-bold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
