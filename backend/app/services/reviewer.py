"""Reviewer trust layer: credential tiers and rater reliability stats.

The reviewer's payoff loop lives here too — calibration score, consensus
agreement, and percentile are what a rater *gets back* for judging: a
portable, evidence-backed signal that their professional eye is sharp.
"""
from __future__ import annotations

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from ..models import Battle, TrapResult, User, Vote

# Common consumer mail providers → tier 0 (self-declared). Anything else is
# treated as a work domain → tier 1. License verification (tier 2) and named
# invited reviewers (tier 3) are upgraded by ops; PLACEHOLDER for a real
# verification integration (e.g. bar-number lookup, cert APIs).
FREE_MAIL_DOMAINS = {
    "gmail.com", "googlemail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "live.com", "icloud.com", "me.com", "aol.com", "proton.me", "protonmail.com",
    "gmx.com", "mail.com", "msn.com", "yandex.com", "example.org",
}

BADGES = {
    "apprentice": "Apprentice Reviewer",
    "reviewer": "Reviewer",
    "calibrated": "Calibrated Reviewer",
    "top": "Top Reviewer",
}


def tier_for_email(email: str) -> int:
    domain = email.rsplit("@", 1)[-1].lower()
    return 0 if domain in FREE_MAIL_DOMAINS else 1


def reviewer_stats(db: Session, user: User) -> dict:
    votes_cast = db.scalar(
        select(func.count(Vote.id)).where(Vote.user_id == user.id)
    ) or 0
    counted_votes = db.scalar(
        select(func.count(Vote.id)).where(Vote.user_id == user.id, Vote.counted.is_(True))
    ) or 0
    traps_total = db.scalar(
        select(func.count(TrapResult.id)).where(TrapResult.user_id == user.id)
    ) or 0
    traps_passed = db.scalar(
        select(func.count(TrapResult.id)).where(TrapResult.user_id == user.id, TrapResult.passed.is_(True))
    ) or 0
    calibration_pct = round(100 * traps_passed / traps_total, 1) if traps_total else None

    consensus_pct = _consensus_agreement(db, user)
    percentile = _calibration_percentile(db, user, traps_total, traps_passed)

    if votes_cast < 5:
        badge = BADGES["apprentice"]
    elif calibration_pct is not None and calibration_pct >= 80:
        badge = BADGES["top"] if (percentile or 0) >= 90 else BADGES["calibrated"]
    else:
        badge = BADGES["reviewer"]

    return {
        "votes_cast": votes_cast,
        "counted_votes": counted_votes,
        "traps_total": traps_total,
        "traps_passed": traps_passed,
        "calibration_pct": calibration_pct,
        "consensus_pct": consensus_pct,
        "percentile": percentile,
        "badge": badge,
        "tier": user.tier,
    }


def _consensus_agreement(db: Session, user: User) -> float | None:
    """% of this rater's votes that match the majority of other verified raters
    on the same scenario + model pair (outputs are deterministic per pair, so
    the comparison is apples-to-apples)."""
    mine = db.execute(
        select(Vote.winner_model_id, Vote.loser_model_id, Battle.scenario_id, Vote.category)
        .join(Battle, Vote.battle_id == Battle.id)
        .where(Vote.user_id == user.id, Vote.counted.is_(True))
    ).all()
    comparable = 0
    agree = 0
    for winner, loser, scenario_id, category in mine:
        same_dir = db.scalar(
            select(func.count(Vote.id))
            .join(Battle, Vote.battle_id == Battle.id)
            .where(
                Battle.scenario_id == scenario_id,
                Vote.category == category,
                Vote.user_id != user.id,
                Vote.counted.is_(True), Vote.weight >= 1.0,
                Vote.winner_model_id == winner, Vote.loser_model_id == loser,
            )
        ) or 0
        opp_dir = db.scalar(
            select(func.count(Vote.id))
            .join(Battle, Vote.battle_id == Battle.id)
            .where(
                Battle.scenario_id == scenario_id,
                Vote.category == category,
                Vote.user_id != user.id,
                Vote.counted.is_(True), Vote.weight >= 1.0,
                Vote.winner_model_id == loser, Vote.loser_model_id == winner,
            )
        ) or 0
        if same_dir + opp_dir >= 2 and same_dir != opp_dir:
            comparable += 1
            if same_dir > opp_dir:
                agree += 1
    return round(100 * agree / comparable, 1) if comparable else None


def _calibration_percentile(db: Session, user: User, traps_total: int, traps_passed: int) -> float | None:
    """Where this rater's trap pass-rate sits among raters with >= 3 traps."""
    if traps_total < 3:
        return None
    rows = db.execute(
        select(
            TrapResult.user_id,
            func.count(TrapResult.id),
            func.sum(case((TrapResult.passed.is_(True), 1), else_=0)),
        ).where(TrapResult.user_id.is_not(None)).group_by(TrapResult.user_id)
    ).all()
    rates = []
    for uid, total, passed in rows:
        if total and total >= 3:
            rates.append((uid, (passed or 0) / total))
    if not rates:
        return None
    my_rate = traps_passed / traps_total
    at_or_below = sum(1 for _, r in rates if r <= my_rate)
    return round(100 * at_or_below / len(rates), 1)
