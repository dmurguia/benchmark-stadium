from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---- auth ----

class RequestCodeIn(BaseModel):
    email: EmailStr


class RequestCodeOut(BaseModel):
    ok: bool = True
    # Only populated in dev mode (no email provider wired yet).
    dev_code: str | None = None


class VerifyCodeIn(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=12)


class SessionOut(BaseModel):
    token: str
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    vertical: str = ""
    role: str = ""
    tier: int = 0

    model_config = {"from_attributes": True}


class ProfileIn(BaseModel):
    vertical: str = Field(min_length=1, max_length=40)
    role: str = Field(min_length=1, max_length=80)


class ReviewerStatsOut(BaseModel):
    votes_cast: int
    counted_votes: int
    traps_total: int
    traps_passed: int
    calibration_pct: float | None
    consensus_pct: float | None
    percentile: float | None
    badge: str
    tier: int


# ---- catalog ----

class VerticalOut(BaseModel):
    slug: str
    name: str
    icon: str
    blurb: str


class CategoryOut(BaseModel):
    slug: str
    vertical: str
    name: str
    blurb: str


class ScenarioOut(BaseModel):
    id: str
    title: str
    brief: str


class StatsOut(BaseModel):
    votes: int
    human_votes: int
    battles: int
    models: int
    categories: int


class ArenaModelOut(BaseModel):
    id: int
    slug: str
    name: str
    organization: str
    provider: str
    active: bool

    model_config = {"from_attributes": True}


# ---- battles ----

class BattleCreateIn(BaseModel):
    category: str
    # Omit to draw a random scenario from the category's library.
    scenario_id: str | None = None


class GenerationOut(BaseModel):
    id: int
    position: int
    status: str
    latency_ms: int
    # Model identity is only revealed once the battle is complete.
    model: ArenaModelOut | None = None
    # Marks the broken calibration artifact — only serialized after reveal.
    is_trap: bool = False


class MatchOut(BaseModel):
    id: int
    round: str
    order_index: int
    is_trap: bool = False
    a_generation_id: int | None
    b_generation_id: int | None
    winner_generation_id: int | None


class TrapOutcomeOut(BaseModel):
    passed: bool


class BattleOut(BaseModel):
    public_id: str
    category: str
    scenario_id: str
    prompt: str
    status: str
    created_at: datetime
    generations: list[GenerationOut]
    matches: list[MatchOut]
    current_match_id: int | None = None
    # Calibration outcome, revealed only when the battle is complete.
    trap_outcome: TrapOutcomeOut | None = None


class VoteIn(BaseModel):
    match_id: int
    winner_generation_id: int


class BattleSummaryOut(BaseModel):
    public_id: str
    category: str
    prompt: str
    status: str
    created_at: datetime
    winner_model: ArenaModelOut | None = None


# ---- leaderboard ----

class LeaderboardEntryOut(BaseModel):
    rank: int
    model: ArenaModelOut
    rating: float
    ci_low: float
    ci_high: float
    wins: int
    losses: int
    votes: int
    win_rate: float
    # Movement vs. the previous snapshot: positive = climbed, None = no prior data.
    rank_delta: int | None = None
    is_new: bool = False


class LeaderboardOut(BaseModel):
    category: str
    algo: str
    computed_at: datetime | None
    vote_count: int
    entries: list[LeaderboardEntryOut]
