from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..categories import OVERALL, is_valid_category
from ..db import get_db
from ..schemas import ArenaModelOut, LeaderboardEntryOut, LeaderboardOut
from ..services.leaderboard import compute_all_snapshots, latest_snapshot, previous_ranks

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("/{category}", response_model=LeaderboardOut)
def leaderboard(category: str, db: Session = Depends(get_db)) -> LeaderboardOut:
    if category != OVERALL and not is_valid_category(category):
        raise HTTPException(status_code=404, detail=f"Unknown category '{category}'.")
    snap = latest_snapshot(db, category)
    if snap is None:
        return LeaderboardOut(category=category, algo="bradley-terry", computed_at=None, vote_count=0, entries=[])
    prev = previous_ranks(db, category)
    return LeaderboardOut(
        category=category,
        algo=snap.algo,
        computed_at=snap.computed_at,
        vote_count=snap.vote_count,
        entries=[
            LeaderboardEntryOut(
                rank=e.rank,
                model=ArenaModelOut.model_validate(e.model),
                rating=e.rating,
                ci_low=e.ci_low,
                ci_high=e.ci_high,
                wins=e.wins,
                losses=e.losses,
                votes=e.votes,
                win_rate=round(e.wins / e.votes, 3) if e.votes else 0.0,
                rank_delta=(prev[e.model_id] - e.rank) if e.model_id in prev else None,
                is_new=bool(prev) and e.model_id not in prev,
            )
            for e in snap.entries
        ],
    )


@router.post("/recompute")
def recompute(db: Session = Depends(get_db)) -> dict:
    """Recompute all snapshots on demand (dev convenience; the batch pipeline
    in pipeline/compute_ratings.py is the production path)."""
    computed = compute_all_snapshots(db)
    return {"ok": True, "computed": computed}
