"""Battle orchestration (v2): model selection, work-product generation, the
tournament state machine, and the trust layer at the point of voting.

A battle is five comparisons: semi1, semi2, a calibration (trap) match, then
the final and third-place match. The calibration match pairs a real model
output against a deliberately broken one — it scores the *rater*, never the
models, and its outcome lands in trap_results instead of votes.
"""
from __future__ import annotations

import asyncio
import random

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..categories import CATEGORIES
from ..config import get_settings
from ..models import ArenaModel, Battle, Generation, Match, TrapResult, User, Vote, utcnow
from .providers import ProviderNotConfigured, get_provider_for, sample_provider

ROUNDS = ["semi1", "semi2", "calibration", "final", "third"]

# Vote weight by credential tier; anonymous votes carry zero weight (directional only).
TIER_WEIGHTS = {0: 0.25, 1: 1.0, 2: 1.5, 3: 2.0}
ANON_WEIGHT = 0.0


class ArenaError(Exception):
    pass


def eligible_models(db: Session, category: str) -> list[ArenaModel]:
    """Foundation models compete on every board; vendor products only inside
    their vertical; declined vendors are never drafted."""
    vertical = CATEGORIES.get(category, {}).get("vertical", "")
    active = db.scalars(select(ArenaModel).where(ArenaModel.active.is_(True)))
    return [m for m in active if m.kind != "declined" and m.vertical in ("", vertical)]


def pick_models(db: Session, count: int, category: str) -> list[ArenaModel]:
    pool = eligible_models(db, category)
    if len(pool) < count:
        raise ArenaError(f"Need at least {count} eligible models for '{category}'; found {len(pool)}. Run the seed script.")
    return random.sample(pool, count)


async def create_battle(db: Session, user: User | None, category: str, scenario: dict) -> Battle:
    # 4 bracket contestants + 1 extra whose output anchors the calibration match.
    models = pick_models(db, 5, category)
    bracket_models, trap_model = models[:4], models[4]
    prompt = scenario["brief"]
    battle = Battle(
        user_id=user.id if user else None,
        category=category,
        scenario_id=scenario["id"],
        prompt=prompt,
        status="generating",
    )
    db.add(battle)
    db.flush()

    calls = [get_provider_for(m).generate(m, prompt, category, scenario=scenario) for m in bracket_models]
    calls.append(get_provider_for(trap_model).generate(trap_model, prompt, category, scenario=scenario))
    results = await asyncio.gather(*calls, return_exceptions=True)

    failures = [r for r in results if isinstance(r, BaseException)]
    if failures:
        db.rollback()
        first = failures[0]
        if isinstance(first, ProviderNotConfigured):
            raise ArenaError(str(first))
        raise ArenaError(f"Generation failed: {first}")

    # Positions are shuffled so slot letters carry no information about models.
    order = list(range(4))
    random.shuffle(order)
    gens: list[Generation] = [None] * 4  # type: ignore[list-item]
    for model, result, pos in zip(bracket_models, results[:4], order):
        g = Generation(battle_id=battle.id, model_id=model.id, position=pos,
                       html=result.html, latency_ms=result.latency_ms)
        db.add(g)
        gens[pos] = g

    # Calibration pair: real output vs broken artifact, positions shuffled so
    # position number carries no signal about which is which.
    trap_positions = [4, 5]
    random.shuffle(trap_positions)
    trap_good = Generation(battle_id=battle.id, model_id=trap_model.id, position=trap_positions[0],
                           html=results[4].html, latency_ms=results[4].latency_ms)
    broken = sample_provider.generate_broken(category, scenario)
    trap_bad = Generation(battle_id=battle.id, model_id=trap_model.id, position=trap_positions[1],
                          html=broken.html, latency_ms=broken.latency_ms, is_trap=True)
    db.add(trap_good)
    db.add(trap_bad)
    db.flush()

    trap_slots = [trap_good.id, trap_bad.id]
    random.shuffle(trap_slots)

    db.add(Match(battle_id=battle.id, round="semi1", order_index=0, a_generation_id=gens[0].id, b_generation_id=gens[1].id))
    db.add(Match(battle_id=battle.id, round="semi2", order_index=1, a_generation_id=gens[2].id, b_generation_id=gens[3].id))
    db.add(Match(battle_id=battle.id, round="calibration", order_index=2, is_trap=True,
                 a_generation_id=trap_slots[0], b_generation_id=trap_slots[1]))
    db.add(Match(battle_id=battle.id, round="final", order_index=3))
    db.add(Match(battle_id=battle.id, round="third", order_index=4))

    battle.status = "voting"
    db.commit()
    db.refresh(battle)
    return battle


def current_match(battle: Battle) -> Match | None:
    for m in battle.matches:
        if m.winner_generation_id is None and m.a_generation_id and m.b_generation_id:
            return m
    return None


def _elapsed_ms(battle: Battle) -> int:
    """Time since the previous decision (or battle creation) — server-side, unspoofable."""
    anchors = [m.decided_at for m in battle.matches if m.decided_at is not None]
    start = max(anchors) if anchors else battle.created_at
    now = utcnow()
    if start.tzinfo is None:
        start = start.replace(tzinfo=now.tzinfo)
    return max(0, int((now - start).total_seconds() * 1000))


def record_vote(db: Session, battle: Battle, user: User | None, match_id: int, winner_generation_id: int) -> Battle:
    if battle.status != "voting":
        raise ArenaError("This battle is not accepting votes.")
    match = next((m for m in battle.matches if m.id == match_id), None)
    if match is None:
        raise ArenaError("Match not found in this battle.")
    active = current_match(battle)
    if active is None or active.id != match.id:
        raise ArenaError("Votes must be cast on the current match, in order.")
    if winner_generation_id not in (match.a_generation_id, match.b_generation_id):
        raise ArenaError("Winner must be one of the two work products in this match.")

    decision_ms = _elapsed_ms(battle)
    match.winner_generation_id = winner_generation_id
    match.decided_at = utcnow()

    gen_by_id = {g.id: g for g in battle.generations}
    winner_gen = gen_by_id[winner_generation_id]

    if match.is_trap:
        # Calibration: passed = picked the real work product, not the broken one.
        db.add(TrapResult(
            user_id=user.id if user else None,
            battle_id=battle.id,
            match_id=match.id,
            passed=not winner_gen.is_trap,
            decision_ms=decision_ms,
        ))
    else:
        loser_id = match.b_generation_id if winner_generation_id == match.a_generation_id else match.a_generation_id
        loser_gen = gen_by_id[loser_id]
        weight = TIER_WEIGHTS.get(user.tier, 0.25) if user else ANON_WEIGHT
        db.add(Vote(
            battle_id=battle.id,
            match_id=match.id,
            user_id=user.id if user else None,
            category=battle.category,
            winner_model_id=winner_gen.model_id,
            loser_model_id=loser_gen.model_id,
            weight=weight,
            decision_ms=decision_ms,
            # Behavioral floor: recorded but not counted when decided too fast.
            counted=decision_ms >= get_settings().min_decision_ms,
        ))

    _advance_bracket(battle)

    if all(m.winner_generation_id is not None for m in battle.matches):
        battle.status = "complete"
        battle.completed_at = utcnow()

    db.commit()
    db.refresh(battle)
    return battle


def _advance_bracket(battle: Battle) -> None:
    by_round = {m.round: m for m in battle.matches}
    semi1, semi2 = by_round.get("semi1"), by_round.get("semi2")
    final, third = by_round.get("final"), by_round.get("third")
    if not (semi1 and semi2 and final and third):
        return
    if semi1.winner_generation_id and semi2.winner_generation_id and final.a_generation_id is None:
        final.a_generation_id = semi1.winner_generation_id
        final.b_generation_id = semi2.winner_generation_id
        third.a_generation_id = _loser_of(semi1)
        third.b_generation_id = _loser_of(semi2)


def _loser_of(match: Match) -> int:
    return match.b_generation_id if match.winner_generation_id == match.a_generation_id else match.a_generation_id
