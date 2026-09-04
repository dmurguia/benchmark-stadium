const TOKEN_KEY = "da_token";

// In dev the Vite proxy forwards /api to the local backend, so paths stay
// relative. In hosted builds (Vercel), set VITE_API_URL to the backend origin
// (e.g. https://api.calibrationarena.ai or the Railway URL) and every request
// — fetches and document iframes alike — gets prefixed through apiUrl().
const RAW_API_BASE = ((import.meta.env.VITE_API_URL as string | undefined) ?? "").trim().replace(/\/+$/, "");
// A schemeless value ("foo.up.railway.app") would resolve as a relative path
// against the frontend origin — normalize it so the env var forgives that.
export const API_BASE =
  RAW_API_BASE && !/^https?:\/\//i.test(RAW_API_BASE) ? `https://${RAW_API_BASE}` : RAW_API_BASE;

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const resp = await fetch(apiUrl(path), { ...options, headers: { ...headers, ...(options.headers as object) } });
  if (!resp.ok) {
    let detail = resp.statusText;
    try {
      const body = await resp.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      /* non-json error */
    }
    throw new ApiError(resp.status, detail);
  }
  return resp.json() as Promise<T>;
}

// ---- types mirrored from the backend schemas ----

export interface UserOut {
  id: number;
  email: string;
  display_name: string;
  vertical: string;
  role: string;
  tier: number;
}

export interface VerticalOut {
  slug: string;
  name: string;
  icon: string;
  blurb: string;
}

export interface CategoryOut {
  slug: string;
  vertical: string;
  name: string;
  blurb: string;
}

export interface ScenarioOut {
  id: string;
  title: string;
  brief: string;
}

export interface ReviewerStatsOut {
  votes_cast: number;
  counted_votes: number;
  traps_total: number;
  traps_passed: number;
  calibration_pct: number | null;
  consensus_pct: number | null;
  percentile: number | null;
  badge: string;
  tier: number;
}

export interface ArenaModelOut {
  id: number;
  slug: string;
  name: string;
  organization: string;
  provider: string;
  active: boolean;
  // Company boards: foundation | product | declined.
  kind: string;
  vertical: string;
  provenance: string;
  submitted_version: string;
}

export interface DeclinedVendorOut {
  name: string;
  organization: string;
  vertical: string;
  note: string;
}

export interface ReleaseMovementOut {
  category: string;
  category_name: string;
  before_rank: number | null;
  after_rank: number;
  before_rating: number | null;
  after_rating: number;
}

export interface ReleaseOut {
  id: number;
  model: ArenaModelOut;
  version: string;
  notes: string;
  rerun_votes: number;
  released_at: string;
  movement: ReleaseMovementOut[];
}

export interface GenerationOut {
  id: number;
  position: number;
  status: string;
  latency_ms: number;
  model: ArenaModelOut | null;
  is_trap: boolean;
}

export interface MatchOut {
  id: number;
  round: string;
  order_index: number;
  is_trap: boolean;
  a_generation_id: number | null;
  b_generation_id: number | null;
  winner_generation_id: number | null;
}

export interface BattleOut {
  public_id: string;
  category: string;
  scenario_id: string;
  prompt: string;
  status: string;
  created_at: string;
  generations: GenerationOut[];
  matches: MatchOut[];
  current_match_id: number | null;
  trap_outcome: { passed: boolean } | null;
}

export interface BattleSummaryOut {
  public_id: string;
  category: string;
  prompt: string;
  status: string;
  created_at: string;
  winner_model: ArenaModelOut | null;
}

export interface LeaderboardEntryOut {
  rank: number;
  model: ArenaModelOut;
  rating: number;
  ci_low: number;
  ci_high: number;
  wins: number;
  losses: number;
  votes: number;
  win_rate: number;
  rank_delta: number | null;
  is_new: boolean;
}

export interface LeaderboardOut {
  category: string;
  algo: string;
  computed_at: string | null;
  vote_count: number;
  entries: LeaderboardEntryOut[];
  declined: DeclinedVendorOut[];
}
