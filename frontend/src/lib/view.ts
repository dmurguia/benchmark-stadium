// Adapters from API shapes (lib/api.ts) to the view shapes the redesign's
// board components consume. Live rows never mix with the demo data in
// src/data/competitors.ts.
import type { DeclinedVendorOut, LeaderboardEntryOut, ReleaseOut } from "./api";
import type { EmptyChair, ReleaseRadarEntry } from "../types/arena";

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
      if (w === "saas") return "SaaS";
      if (w === "erp") return "ERP";
      if (i > 0 && TITLE_SMALL_WORDS.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

/** A measured row from the live boards, in the shape the redesign renders. */
export interface LiveRow {
  rank: number;
  previousRank: number;
  name: string;
  org: string;
  kind: string;
  provenance?: string;
  score: number;
  ciLow: number;
  ciHigh: number;
  judgments: number;
  winRate: number;
}

export function toLiveRow(e: LeaderboardEntryOut): LiveRow {
  const isProduct = e.model.kind === "product";
  return {
    rank: e.rank,
    previousRank: e.rank + (e.rank_delta ?? 0),
    name: e.model.name,
    org: e.model.organization,
    kind: e.model.kind,
    provenance: isProduct
      ? `${e.model.provenance} · ${e.model.submitted_version}`
      : undefined,
    score: Math.round(e.rating),
    ciLow: Math.round(e.ci_low),
    ciHigh: Math.round(e.ci_high),
    judgments: e.votes,
    winRate: e.win_rate,
  };
}

export function toEmptyChair(d: DeclinedVendorOut): EmptyChair {
  return { name: d.name, note: `${d.organization} — ${d.note}` };
}

/** One release can move several boards; the radar shows one cell per move. */
export function toRadarEntries(r: ReleaseOut): ReleaseRadarEntry[] {
  const date = new Date(r.released_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const verb = r.model.kind === "product" ? "submitted" : "released";
  const label = r.version ? `${r.model.name} ${r.version}` : r.model.name;
  return r.movement
    .filter((m) => m.before_rank != null && m.before_rank !== m.after_rank)
    .map((m) => ({
      name: label,
      released: `${verb} ${date}`,
      primitive: m.category_name,
      from: m.before_rank as number,
      to: m.after_rank,
    }));
}
