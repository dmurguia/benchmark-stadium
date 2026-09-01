from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..categories import OVERALL, is_valid_category
from ..db import SessionLocal, get_db
from ..deps import get_current_user, get_current_user_optional
from ..models import ArenaModel, Battle, Generation, TrapResult, User
from ..scenarios import get_scenario
from ..schemas import (
    ArenaModelOut,
    BattleCreateIn,
    BattleOut,
    BattleSummaryOut,
    GenerationOut,
    MatchOut,
    TrapOutcomeOut,
    VoteIn,
)
from ..services import arena
from ..services.leaderboard import compute_snapshot

router = APIRouter(prefix="/api/battles", tags=["battles"])


def _load_battle(db: Session, public_id: str) -> Battle:
    battle = db.scalars(
        select(Battle)
        .where(Battle.public_id == public_id)
        .options(
            selectinload(Battle.generations).selectinload(Generation.model),
            selectinload(Battle.matches),
        )
    ).first()
    if battle is None:
        raise HTTPException(status_code=404, detail="Battle not found.")
    return battle


def _serialize(battle: Battle, db: Session | None = None) -> BattleOut:
    revealed = battle.status == "complete"
    current = arena.current_match(battle)
    trap_outcome = None
    if revealed and db is not None:
        tr = db.scalars(select(TrapResult).where(TrapResult.battle_id == battle.id)).first()
        if tr is not None:
            trap_outcome = TrapOutcomeOut(passed=tr.passed)
    return BattleOut(
        public_id=battle.public_id,
        category=battle.category,
        scenario_id=battle.scenario_id,
        prompt=battle.prompt,
        status=battle.status,
        created_at=battle.created_at,
        generations=[
            GenerationOut(
                id=g.id,
                position=g.position,
                status=g.status,
                latency_ms=g.latency_ms,
                model=ArenaModelOut.model_validate(g.model) if revealed else None,
                is_trap=g.is_trap if revealed else False,
            )
            for g in battle.generations
        ],
        matches=[
            MatchOut(
                id=m.id,
                round=m.round,
                order_index=m.order_index,
                is_trap=m.is_trap,
                a_generation_id=m.a_generation_id,
                b_generation_id=m.b_generation_id,
                winner_generation_id=m.winner_generation_id,
            )
            for m in battle.matches
        ],
        current_match_id=current.id if current else None,
        trap_outcome=trap_outcome,
    )


@router.post("", response_model=BattleOut)
async def create_battle(
    payload: BattleCreateIn,
    db: Session = Depends(get_db),
    # Prompt-first front door (BS-13): guests get a real blind session with no
    # signup; their votes carry zero board weight until they verify.
    user: User | None = Depends(get_current_user_optional),
) -> BattleOut:
    if not is_valid_category(payload.category):
        raise HTTPException(status_code=400, detail=f"Unknown category '{payload.category}'.")
    try:
        scenario = get_scenario(payload.category, payload.scenario_id)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e))
    try:
        battle = await arena.create_battle(db, user, payload.category, scenario)
    except arena.ArenaError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return _serialize(_load_battle(db, battle.public_id), db)


@router.get("", response_model=list[BattleSummaryOut])
def my_battles(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[BattleSummaryOut]:
    battles = db.scalars(
        select(Battle)
        .where(Battle.user_id == user.id)
        .order_by(Battle.created_at.desc())
        .options(selectinload(Battle.generations).selectinload(Generation.model), selectinload(Battle.matches))
        .limit(50)
    ).all()
    out = []
    for b in battles:
        winner_model: ArenaModel | None = None
        if b.status == "complete":
            final = next((m for m in b.matches if m.round == "final"), None)
            if final and final.winner_generation_id:
                gen = next((g for g in b.generations if g.id == final.winner_generation_id), None)
                winner_model = gen.model if gen else None
        out.append(
            BattleSummaryOut(
                public_id=b.public_id,
                category=b.category,
                prompt=b.prompt,
                status=b.status,
                created_at=b.created_at,
                winner_model=ArenaModelOut.model_validate(winner_model) if winner_model else None,
            )
        )
    return out


@router.get("/{public_id}", response_model=BattleOut)
def get_battle(public_id: str, db: Session = Depends(get_db)) -> BattleOut:
    return _serialize(_load_battle(db, public_id), db)


@router.get("/{public_id}/generations/{position}/html", response_class=HTMLResponse)
def generation_html(public_id: str, position: int, db: Session = Depends(get_db)) -> HTMLResponse:
    battle = _load_battle(db, public_id)
    gen = next((g for g in battle.generations if g.position == position), None)
    if gen is None:
        raise HTTPException(status_code=404, detail="Generation not found.")
    return HTMLResponse(
        content=gen.html,
        headers={
            # Rendered inside a sandboxed iframe; keep it self-contained.
            "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'unsafe-inline'; media-src data:",
            "X-Frame-Options": "SAMEORIGIN",
        },
    )


def _recompute_after_battle(category: str) -> None:
    db = SessionLocal()
    try:
        compute_snapshot(db, category)
        compute_snapshot(db, OVERALL)
    finally:
        db.close()


@router.post("/{public_id}/votes", response_model=BattleOut)
def vote(
    public_id: str,
    payload: VoteIn,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user_optional),
) -> BattleOut:
    battle = _load_battle(db, public_id)
    try:
        battle = arena.record_vote(db, battle, user, payload.match_id, payload.winner_generation_id)
    except arena.ArenaError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # The completed battle's votes flow straight into a fresh leaderboard
    # snapshot — same computation the batch pipeline runs.
    if battle.status == "complete":
        background.add_task(_recompute_after_battle, battle.category)

    return _serialize(_load_battle(db, public_id), db)
