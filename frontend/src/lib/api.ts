const TOKEN_KEY = "da_token";

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
  const resp = await fetch(path, { ...options, headers: { ...headers, ...(options.headers as object) } });
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
}

export interface CategoryOut {
  slug: string;
  name: string;
  blurb: string;
}

export interface ArenaModelOut {
  id: number;
  slug: string;
  name: string;
  organization: string;
  provider: string;
  active: boolean;
}

export interface GenerationOut {
  id: number;
  position: number;
  status: string;
  latency_ms: number;
  model: ArenaModelOut | null;
}

export interface MatchOut {
  id: number;
  round: string;
  order_index: number;
  a_generation_id: number | null;
  b_generation_id: number | null;
  winner_generation_id: number | null;
}

export interface BattleOut {
  public_id: string;
  category: string;
  prompt: string;
  status: string;
  created_at: string;
  generations: GenerationOut[];
  matches: MatchOut[];
  current_match_id: number | null;
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
}
