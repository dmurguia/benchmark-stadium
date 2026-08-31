from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from fastapi import HTTPException

from ..categories import CATEGORIES, VERTICALS
from ..db import get_db
from ..models import ArenaModel, Battle, Vote
from ..scenarios import SCENARIOS
from ..schemas import ArenaModelOut, CategoryOut, ScenarioOut, StatsOut, VerticalOut

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/verticals", response_model=list[VerticalOut])
def verticals() -> list[VerticalOut]:
    return [VerticalOut(slug=slug, name=v["name"], icon=v["icon"], blurb=v["blurb"]) for slug, v in VERTICALS.items()]


@router.get("/categories", response_model=list[CategoryOut])
def categories() -> list[CategoryOut]:
    return [
        CategoryOut(slug=slug, vertical=c["vertical"], name=c["name"], blurb=c["blurb"])
        for slug, c in CATEGORIES.items()
    ]


@router.get("/scenarios/{category}", response_model=list[ScenarioOut])
def scenarios(category: str) -> list[ScenarioOut]:
    if category not in SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Unknown category '{category}'.")
    return [ScenarioOut(id=s["id"], title=s["title"], brief=s["brief"]) for s in SCENARIOS[category]]


@router.get("/models", response_model=list[ArenaModelOut])
def models(db: Session = Depends(get_db)) -> list[ArenaModelOut]:
    rows = db.scalars(select(ArenaModel).order_by(ArenaModel.organization, ArenaModel.name)).all()
    return [ArenaModelOut.model_validate(m) for m in rows]


@router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db)) -> StatsOut:
    return StatsOut(
        votes=db.scalar(select(func.count(Vote.id))) or 0,
        human_votes=db.scalar(select(func.count(Vote.id)).where(Vote.synthetic.is_(False))) or 0,
        battles=db.scalar(select(func.count(Battle.id))) or 0,
        models=db.scalar(select(func.count(ArenaModel.id)).where(ArenaModel.active.is_(True))) or 0,
        categories=len(CATEGORIES),
    )
