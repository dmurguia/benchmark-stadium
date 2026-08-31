# Design Arena — recreation

A working recreation of the core [designarena.ai](https://www.designarena.ai) experience:
**prompt → four anonymous AI models generate designs → tournament voting → reveal →
Bradley–Terry leaderboard.**

Runs fully offline out of the box — no API keys needed (see *Generation modes* below).

## Quickstart

```bash
# from the repo root

# 1. Backend deps (Python 3.11+)
pip install -r backend/requirements.txt

# 2. Seed the arena: 14-model roster + synthetic bootstrap votes + first leaderboard
cd backend && python -m pipeline.seed

# 3. Run the API (http://localhost:8000)
uvicorn app.main:app --reload --port 8000

# 4. Frontend dev server (http://localhost:5173, proxies /api to :8000)
cd ../frontend && npm install && npm run dev
```

Single-process deploy: `npm run build` in `frontend/`, then the FastAPI app serves the
built SPA itself at `:8000`.

Sign-in uses email one-time codes. Email delivery is a placeholder — in dev mode the
code is shown in the UI (`DESIGNARENA_DEV_LOGIN_CODE=1`).

## Generation modes

- `DESIGNARENA_GENERATION_MODE=sample` (default): the offline sample provider renders
  real, varied HTML designs per model persona — deterministic per (model, prompt), so
  the whole arena is playable with zero credentials.
- `DESIGNARENA_GENERATION_MODE=live`: each model routes to its vendor adapter
  (Anthropic / OpenAI / Google / OpenRouter). Swap the `PLACEHOLDER_*` keys in
  `backend/.env.example` for real ones first.

## The leaderboard pipeline

Votes are the source of truth (`votes` table). Ratings are Bradley–Terry (MM fit),
anchored at 1200 Elo-style, with bootstrap confidence intervals, materialized as
snapshots that the API reads:

```bash
python -m pipeline.compute_ratings              # recompute all categories + overall
python -m pipeline.compute_ratings --category website
python -m pipeline.seed --reset                 # rebuild roster + synthetic votes
```

Snapshots are also recomputed automatically in the background whenever a battle
completes, so human votes show up on the board immediately.

## Tests

```bash
cd backend && python -m pytest tests/
```

## Docs

- `docs/PRD.md` — product requirements & scope decisions
- `docs/ARCHITECTURE.md` — engineering architecture write-up
- `docs/TICKETS.md` + `docs/tickets.csv` — Linear-ready work log
