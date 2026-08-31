"""Seed the arena: model roster + synthetic bootstrap votes + first snapshots.

Synthetic votes exist so the leaderboard is meaningful on day one (the
cold-start problem every arena has). They are flagged `synthetic=True` and can
be aged out once real human votes accumulate. Each model gets a latent
per-category strength; simulated matchups sample winners from the
Bradley-Terry probability those strengths imply, so the fitted leaderboard
recovers a plausible ordering with realistic noise.

Usage: python -m pipeline.seed [--votes-per-category N] [--reset]
"""
from __future__ import annotations

import argparse
import math
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import delete, select  # noqa: E402

from app.categories import CATEGORIES  # noqa: E402
from app.db import SessionLocal, init_db  # noqa: E402
from app.models import ArenaModel, ModelRating, RatingSnapshot, Vote  # noqa: E402
from app.services.leaderboard import compute_all_snapshots  # noqa: E402

# (slug, name, organization, provider, provider_model_id, baseline strength)
# Baseline strength drives synthetic vote simulation only — real votes take
# over as they accumulate. provider_model_id is what the live adapter sends.
ROSTER: list[tuple[str, str, str, str, str, float]] = [
    ("gpt-5-5", "GPT-5.5", "OpenAI", "openai", "gpt-5.5", 1.9),
    ("gpt-5-mini", "GPT-5 Mini", "OpenAI", "openai", "gpt-5-mini", 0.9),
    ("claude-opus-4-8", "Claude Opus 4.8", "Anthropic", "anthropic", "claude-opus-4-8", 2.1),
    ("claude-sonnet-4-6", "Claude Sonnet 4.6", "Anthropic", "anthropic", "claude-sonnet-4-6", 1.5),
    ("gemini-3-pro", "Gemini 3 Pro", "Google", "google", "gemini-3-pro", 1.8),
    ("gemini-3-flash", "Gemini 3 Flash", "Google", "google", "gemini-3-flash", 1.0),
    ("glm-5-2", "GLM 5.2", "Zhipu AI", "openrouter", "z-ai/glm-5.2", 1.7),
    ("deepseek-v4", "DeepSeek V4", "DeepSeek", "openrouter", "deepseek/deepseek-v4", 1.3),
    ("grok-4-1", "Grok 4.1", "xAI", "openrouter", "x-ai/grok-4.1", 1.2),
    ("llama-4-maverick", "Llama 4 Maverick", "Meta", "openrouter", "meta-llama/llama-4-maverick", 0.7),
    ("qwen3-max", "Qwen3 Max", "Alibaba", "openrouter", "qwen/qwen3-max", 1.1),
    ("kimi-k2-5", "Kimi K2.5", "Moonshot AI", "openrouter", "moonshotai/kimi-k2.5", 1.0),
    ("mistral-large-3", "Mistral Large 3", "Mistral AI", "openrouter", "mistralai/mistral-large-3", 0.8),
    ("minimax-m2-5", "MiniMax M2.5", "MiniMax", "openrouter", "minimax/minimax-m2.5", 0.6),
]


def seed_models(db) -> dict[str, ArenaModel]:
    existing = {m.slug: m for m in db.scalars(select(ArenaModel))}
    for slug, name, org, provider, pmid, _ in ROSTER:
        if slug in existing:
            continue
        m = ArenaModel(slug=slug, name=name, organization=org, provider=provider, provider_model_id=pmid, active=True)
        db.add(m)
        existing[slug] = m
    db.commit()
    return {m.slug: m for m in db.scalars(select(ArenaModel))}


def category_strength(slug: str, base: float, category: str) -> float:
    """Latent strength = baseline, warped per category so each board differs."""
    rng = random.Random(f"skill::{slug}::{category}")
    return max(0.05, base * math.exp(rng.gauss(0, 0.45)))


def seed_votes(db, models: dict[str, ArenaModel], votes_per_category: int) -> int:
    rng = random.Random(20260830)
    strengths = {
        cat: {slug: category_strength(slug, base, cat) for slug, _, _, _, _, base in ROSTER}
        for cat in CATEGORIES
    }
    slugs = [r[0] for r in ROSTER]
    total = 0
    for cat in CATEGORIES:
        for _ in range(votes_per_category):
            a, b = rng.sample(slugs, 2)
            pa = strengths[cat][a] / (strengths[cat][a] + strengths[cat][b])
            winner, loser = (a, b) if rng.random() < pa else (b, a)
            db.add(
                Vote(
                    category=cat,
                    winner_model_id=models[winner].id,
                    loser_model_id=models[loser].id,
                    synthetic=True,
                )
            )
            total += 1
        db.commit()
    return total


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--votes-per-category", type=int, default=500)
    parser.add_argument("--reset", action="store_true", help="delete existing synthetic votes and snapshots first")
    args = parser.parse_args()

    init_db()
    db = SessionLocal()
    try:
        if args.reset:
            db.execute(delete(ModelRating))
            db.execute(delete(RatingSnapshot))
            db.execute(delete(Vote).where(Vote.synthetic.is_(True)))
            db.commit()

        models = seed_models(db)
        print(f"roster: {len(models)} models")

        existing_synthetic = db.scalars(select(Vote).where(Vote.synthetic.is_(True)).limit(1)).first()
        if existing_synthetic:
            print("synthetic votes already present — skipping vote seed (use --reset to regenerate)")
        else:
            n = seed_votes(db, models, args.votes_per_category)
            print(f"seeded {n} synthetic votes")

        computed = compute_all_snapshots(db)
        print(f"computed snapshots: {', '.join(computed)}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
