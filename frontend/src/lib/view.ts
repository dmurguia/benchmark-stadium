// Adapters from API shapes (lib/api.ts) to the view types the design's board
// components consume (src/data/leaderboards.ts).
import type { Competitor, EmptyChair, ReleaseView } from "../data/leaderboards";
import type { ArenaModelOut, DeclinedVendorOut, LeaderboardEntryOut, ReleaseOut } from "./api";

export const VERTICAL_LABELS: Record<string, string> = {
  legal: "Legal",
  finance: "Finance/ERP",
};

export const CATEGORY_META: Record<string, { label: string; vertical: string }> = {
  "contract-redline": { label: "Contract Redline", vertical: "Legal" },
  "clause-risk": { label: "Clause Risk Review", vertical: "Legal" },
  "journal-entry": { label: "Journal Entries", vertical: "Finance/ERP" },
  "coa-mapping": { label: "Account Mapping", vertical: "Finance/ERP" },
};

const TITLE_SMALL_WORDS = new Set(["a", "an", "and", "for", "of", "the", "to", "with"]);

export function scenarioTitle(scenarioId: string): string {
  if (!scenarioId) return "";
  return scenarioId
    .split("-")
    .map((w, i) => {
      const upper = w.toUpperCase();
      if (["nda", "msa", "coa", "gl", "ip", "s4", "q3"].includes(w)) return upper;
      if (i > 0 && TITLE_SMALL_WORDS.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

export function productProvenance(model: ArenaModelOut): string {
  return `${model.organization} · ${model.provenance} · ${model.submitted_version}`;
}

export function toCompetitor(e: LeaderboardEntryOut): Competitor {
  const isProduct = e.model.kind === "product";
  return {
    rank: e.rank,
    delta: e.rank_delta ?? 0,
    name: e.model.name,
    org: e.model.organization,
    isProduct,
    provenance: isProduct ? productProvenance(e.model) : undefined,
    score: Math.round(e.rating),
    ci: `±${Math.max(1, Math.round((e.ci_high - e.ci_low) / 2))}`,
    judgments: e.votes,
    winRate: Math.round(e.win_rate * 100),
  };
}

export function toEmptyChair(d: DeclinedVendorOut): EmptyChair {
  return { name: d.name, org: d.organization, note: d.note };
}

export function toReleaseView(r: ReleaseOut): ReleaseView {
  return {
    id: r.id,
    competitor: r.model.name,
    label: r.version,
    org: r.model.organization,
    date: new Date(r.released_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    reruns: `${r.rerun_votes.toLocaleString("en-US")} re-run judgments`,
    movements: r.movement
      .filter((m) => m.before_rank != null)
      .map((m) => ({ board: m.category_name, from: m.before_rank as number, to: m.after_rank })),
  };
}
