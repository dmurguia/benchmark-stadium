from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ModelRelease
from ..schemas import ArenaModelOut, ReleaseMovementOut, ReleaseOut, SimulateReleaseIn
from ..services.releases import ReleaseError, list_releases, simulate_release

router = APIRouter(prefix="/api/releases", tags=["releases"])


def _serialize(r: ModelRelease) -> ReleaseOut:
    return ReleaseOut(
        id=r.id,
        model=ArenaModelOut.model_validate(r.model),
        version=r.version,
        notes=r.notes,
        rerun_votes=r.rerun_votes,
        released_at=r.released_at,
        movement=[ReleaseMovementOut(**m) for m in json.loads(r.movement_json or "[]")],
    )


@router.get("", response_model=list[ReleaseOut])
def releases(limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db)) -> list[ReleaseOut]:
    return [_serialize(r) for r in list_releases(db, limit=limit)]


@router.post("/simulate", response_model=ReleaseOut)
def simulate(body: SimulateReleaseIn | None = None, db: Session = Depends(get_db)) -> ReleaseOut:
    """Dev convenience: fake a model release and re-run its boards. In
    production this fires off vendor release detection instead."""
    body = body or SimulateReleaseIn()
    try:
        release = simulate_release(db, model_slug=body.model_slug, version=body.version)
    except ReleaseError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return _serialize(release)
