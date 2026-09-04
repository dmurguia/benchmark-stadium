from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_public_id() -> str:
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120), default="")
    # Reviewer identity: which vertical they judge in and what they do.
    vertical: Mapped[str] = mapped_column(String(40), default="")
    role: Mapped[str] = mapped_column(String(80), default="")
    # Credential tier: 0 self-declared (free-mail) · 1 verified work domain ·
    # 2 verified license/cert · 3 named invited reviewer. Published boards use
    # tier >= 1 votes only.
    tier: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    battles: Mapped[list["Battle"]] = relationship(back_populates="user")


class AuthCode(Base):
    __tablename__ = "auth_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    code: Mapped[str] = mapped_column(String(12))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used: Mapped[bool] = mapped_column(Boolean, default=False)


class ArenaModel(Base):
    """A competing AI model in the arena roster."""

    __tablename__ = "arena_models"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    organization: Mapped[str] = mapped_column(String(120))
    provider: Mapped[str] = mapped_column(String(40))  # anthropic | openai | google | openrouter | sample
    provider_model_id: Mapped[str] = mapped_column(String(120), default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    description: Mapped[str] = mapped_column(Text, default="")
    # Company boards (BS-16): the roster holds foundation models AND vendor
    # products. kind: foundation | product | declined. A "declined" row is an
    # invited vendor with no outputs — shown as an empty chair on boards, never
    # drafted into battles (active=False).
    kind: Mapped[str] = mapped_column(String(20), default="foundation")
    # Products compete only inside their vertical; "" = all (foundation models).
    vertical: Mapped[str] = mapped_column(String(40), default="")
    # How the product's outputs reach the arena: self-submitted | buyer-contributed.
    provenance: Mapped[str] = mapped_column(String(40), default="")
    submitted_version: Mapped[str] = mapped_column(String(60), default="")


class Battle(Base):
    """One prompt submission: four anonymized generations + a mini tournament."""

    __tablename__ = "battles"

    id: Mapped[int] = mapped_column(primary_key=True)
    public_id: Mapped[str] = mapped_column(String(32), unique=True, index=True, default=new_public_id)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    scenario_id: Mapped[str] = mapped_column(String(80), default="", index=True)
    prompt: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="voting")  # generating | voting | complete
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User | None] = relationship(back_populates="battles")
    generations: Mapped[list["Generation"]] = relationship(back_populates="battle", order_by="Generation.position")
    matches: Mapped[list["Match"]] = relationship(back_populates="battle", order_by="Match.order_index")


class Generation(Base):
    __tablename__ = "generations"
    __table_args__ = (UniqueConstraint("battle_id", "position"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    battle_id: Mapped[int] = mapped_column(ForeignKey("battles.id"), index=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("arena_models.id"))
    position: Mapped[int] = mapped_column(Integer)  # 0..3 → shown as A..D
    html: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="complete")  # pending | complete | failed
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    # True only for the deliberately-broken calibration artifact in a trap match.
    is_trap: Mapped[bool] = mapped_column(Boolean, default=False)

    battle: Mapped[Battle] = relationship(back_populates="generations")
    model: Mapped[ArenaModel] = relationship()


class Match(Base):
    """A pairwise round in the battle's bracket.

    Rounds: semi1, semi2 (openers), final (winners' match), third (losers' match).
    """

    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("battle_id", "round"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    battle_id: Mapped[int] = mapped_column(ForeignKey("battles.id"), index=True)
    round: Mapped[str] = mapped_column(String(16))
    order_index: Mapped[int] = mapped_column(Integer)
    # Calibration match: scores the rater, never the models.
    is_trap: Mapped[bool] = mapped_column(Boolean, default=False)
    a_generation_id: Mapped[int | None] = mapped_column(ForeignKey("generations.id"), nullable=True)
    b_generation_id: Mapped[int | None] = mapped_column(ForeignKey("generations.id"), nullable=True)
    winner_generation_id: Mapped[int | None] = mapped_column(ForeignKey("generations.id"), nullable=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    battle: Mapped[Battle] = relationship(back_populates="matches")


class Vote(Base):
    """One pairwise human preference — the raw input to the ratings pipeline."""

    __tablename__ = "votes"

    id: Mapped[int] = mapped_column(primary_key=True)
    battle_id: Mapped[int | None] = mapped_column(ForeignKey("battles.id"), nullable=True, index=True)
    match_id: Mapped[int | None] = mapped_column(ForeignKey("matches.id"), nullable=True, unique=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    winner_model_id: Mapped[int] = mapped_column(ForeignKey("arena_models.id"), index=True)
    loser_model_id: Mapped[int] = mapped_column(ForeignKey("arena_models.id"), index=True)
    synthetic: Mapped[bool] = mapped_column(Boolean, default=False)  # seeded vs. real human vote
    # Trust layer: weight comes from the rater's credential tier at cast time;
    # counted=False marks votes that failed a behavioral floor (too fast).
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    decision_ms: Mapped[int] = mapped_column(Integer, default=0)
    counted: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)


class TrapResult(Base):
    """Outcome of one calibration (gold-standard) match for one rater."""

    __tablename__ = "trap_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    battle_id: Mapped[int] = mapped_column(ForeignKey("battles.id"), index=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), unique=True)
    passed: Mapped[bool] = mapped_column(Boolean)
    decision_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ModelRelease(Base):
    """A model release event — the trigger for automatic board re-runs.

    When a foundation model ships a new version, its rows are re-run across the
    boards it competes on; the rank movement captured here feeds the release
    feed ("release drama") and the periodic State-of-the-vertical reports.
    """

    __tablename__ = "model_releases"

    id: Mapped[int] = mapped_column(primary_key=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("arena_models.id"), index=True)
    version: Mapped[str] = mapped_column(String(60))
    notes: Mapped[str] = mapped_column(Text, default="")
    # Per-board movement captured right after the re-run, as JSON:
    # [{"category", "before_rank", "after_rank", "before_rating", "after_rating"}]
    movement_json: Mapped[str] = mapped_column(Text, default="[]")
    rerun_votes: Mapped[int] = mapped_column(Integer, default=0)
    released_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

    model: Mapped[ArenaModel] = relationship()


class RatingSnapshot(Base):
    """Output of one ratings pipeline run for one category."""

    __tablename__ = "rating_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[str] = mapped_column(String(40), index=True)
    algo: Mapped[str] = mapped_column(String(40), default="bradley-terry")
    vote_count: Mapped[int] = mapped_column(Integer, default=0)
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

    entries: Mapped[list["ModelRating"]] = relationship(back_populates="snapshot", order_by="ModelRating.rank")


class ModelRating(Base):
    __tablename__ = "model_ratings"

    id: Mapped[int] = mapped_column(primary_key=True)
    snapshot_id: Mapped[int] = mapped_column(ForeignKey("rating_snapshots.id"), index=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("arena_models.id"))
    rank: Mapped[int] = mapped_column(Integer)
    rating: Mapped[float] = mapped_column(Float)
    ci_low: Mapped[float] = mapped_column(Float, default=0.0)
    ci_high: Mapped[float] = mapped_column(Float, default=0.0)
    wins: Mapped[int] = mapped_column(Integer, default=0)
    losses: Mapped[int] = mapped_column(Integer, default=0)
    votes: Mapped[int] = mapped_column(Integer, default=0)

    snapshot: Mapped[RatingSnapshot] = relationship(back_populates="entries")
    model: Mapped[ArenaModel] = relationship()
