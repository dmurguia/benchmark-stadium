"""Release drama (BS-16): a model release re-runs its board rows and the rank
movement becomes the story.

In production, a release is detected (vendor announcement / API version bump),
the model's rows are regenerated across every board it competes on, fresh
judgments accumulate, and the board movement feeds the release feed and the
quarterly State-of-the-vertical report. In the prototype, `simulate_release`
compresses that loop: it applies a strength shift to one foundation model,
simulates a batch of re-run judgments against the current field, recomputes the
affected snapshots, and captures the before/after ranks.
"""
from __future__ import annotations

import json
import math
import random

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..categories import CATEGORIES, OVERALL
from ..models import ArenaModel, ModelRelease, Vote, utcnow
from .leaderboard import compute_snapshot, latest_snapshot


class ReleaseError(Exception):
    pass


def _implied_strengths(db: Session, category: str) -> dict[int, float]:
    """model_id → BT strength implied by the latest snapshot's ratings."""
    snap = latest_snapshot(db, category)
    if snap is None:
        return {}
    return {e.model_id: 10 ** ((e.rating - 1200.0) / 400.0) for e in snap.entries}


def _board_position(db: Session, category: str, model_id: int) -> tuple[int, float] | None:
    snap = latest_snapshot(db, category)
    if snap is None:
        return None
    for e in snap.entries:
        if e.model_id == model_id:
            return e.rank, e.rating
    return None


def simulate_release(
    db: Session,
    model_slug: str | None = None,
    version: str | None = None,
    notes: str = "",
    votes_per_board: int = 150,
    seed: int | None = None,
) -> ModelRelease:
    rng = random.Random(seed)

    q = select(ArenaModel).where(ArenaModel.active.is_(True), ArenaModel.kind == "foundation")
    if model_slug:
        q = q.where(ArenaModel.slug == model_slug)
    candidates = list(db.scalars(q))
    if not candidates:
        raise ReleaseError(
            f"No active foundation model matching '{model_slug}'." if model_slug
            else "No active foundation models in the roster."
        )
    model = rng.choice(candidates)

    # A release usually improves the model, sometimes regresses it — that
    # variance is exactly what makes the feed worth watching.
    shift = math.exp(rng.gauss(0.30, 0.35))

    categories = list(CATEGORIES.keys())
    before = {cat: _board_position(db, cat, model.id) for cat in [*categories, OVERALL]}

    eligible: dict[str, list[ArenaModel]] = {}
    all_active = list(db.scalars(select(ArenaModel).where(
        ArenaModel.active.is_(True), ArenaModel.kind != "declined")))
    for cat in categories:
        vertical = CATEGORIES[cat]["vertical"]
        eligible[cat] = [m for m in all_active
                         if m.id != model.id and m.vertical in ("", vertical)]

    total_votes = 0
    for cat in categories:
        strengths = _implied_strengths(db, cat)
        own = strengths.get(model.id, 1.0) * shift
        opponents = eligible[cat]
        if not opponents:
            continue
        for _ in range(votes_per_board):
            opp = rng.choice(opponents)
            opp_strength = strengths.get(opp.id, 1.0)
            p_win = own / (own + opp_strength)
            if rng.random() < p_win:
                winner_id, loser_id = model.id, opp.id
            else:
                winner_id, loser_id = opp.id, model.id
            db.add(Vote(category=cat, winner_model_id=winner_id, loser_model_id=loser_id, synthetic=True))
            total_votes += 1
        db.commit()
        compute_snapshot(db, cat)
    compute_snapshot(db, OVERALL)

    movement = []
    for cat in [*categories, OVERALL]:
        after = _board_position(db, cat, model.id)
        b = before.get(cat)
        if after is None:
            continue
        movement.append({
            "category": cat,
            "category_name": CATEGORIES[cat]["name"] if cat in CATEGORIES else "Overall",
            "before_rank": b[0] if b else None,
            "after_rank": after[0],
            "before_rating": round(b[1], 1) if b else None,
            "after_rating": round(after[1], 1),
        })

    if version is None:
        prior = db.scalar(select(ModelRelease.id).where(ModelRelease.model_id == model.id).limit(1))
        version = f"{utcnow():%b %Y} refresh" if prior is None else f"{utcnow():%b %Y} refresh #2"
    if not notes:
        direction = "climbing" if shift >= 1.0 else "slipping"
        notes = (f"{model.organization} shipped an update to {model.name}; its rows were re-run "
                 f"across every board it competes on — early re-runs have it {direction}.")

    release = ModelRelease(
        model_id=model.id,
        version=version,
        notes=notes,
        movement_json=json.dumps(movement),
        rerun_votes=total_votes,
    )
    db.add(release)
    db.commit()
    db.refresh(release)
    return release


def list_releases(db: Session, limit: int = 10) -> list[ModelRelease]:
    return list(db.scalars(
        select(ModelRelease)
        .order_by(ModelRelease.released_at.desc(), ModelRelease.id.desc())
        .options(selectinload(ModelRelease.model))
        .limit(limit)
    ))
