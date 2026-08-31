"""Batch ratings job: recompute leaderboard snapshots from the votes table.

This is the production path for the leaderboard — run it on a schedule (cron /
worker) or ad hoc after backfills. The API additionally triggers the same
computation in the background when a battle completes, so the board feels live.

Usage: python -m pipeline.compute_ratings [--category slug|overall] [--ci-rounds N]
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.categories import CATEGORIES, OVERALL  # noqa: E402
from app.db import SessionLocal, init_db  # noqa: E402
from app.services.leaderboard import compute_all_snapshots, compute_snapshot  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--category", default=None, help=f"one of {', '.join(CATEGORIES)} or '{OVERALL}' (default: all)")
    parser.add_argument("--ci-rounds", type=int, default=None, help="bootstrap resamples for confidence intervals")
    args = parser.parse_args()

    init_db()
    db = SessionLocal()
    start = time.monotonic()
    try:
        if args.category:
            snap = compute_snapshot(db, args.category, bootstrap_rounds=args.ci_rounds)
            if snap is None:
                print(f"no votes for '{args.category}' — nothing computed")
            else:
                print(f"{args.category}: snapshot #{snap.id} from {snap.vote_count} votes")
        else:
            computed = compute_all_snapshots(db, bootstrap_rounds=args.ci_rounds)
            print(f"computed snapshots: {', '.join(computed) or '(none — no votes yet)'}")
    finally:
        db.close()
    print(f"done in {time.monotonic() - start:.1f}s")


if __name__ == "__main__":
    main()
