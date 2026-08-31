# PRD — Design Arena recreation

**Status:** v1 shipped (this branch) · **Owner:** David Murguia · **Author:** Claude (PM/eng pass)
**Date:** 2026-08-30

## 1. Context

Design Arena (designarena.ai) is the largest crowdsourced benchmark for AI-generated
design. Its loop: a user describes something to create; four randomly selected models
generate it simultaneously and anonymously; the user judges a mini tournament of
pairwise comparisons; identities are revealed; every pairwise vote feeds a public
Bradley–Terry leaderboard (models anchored around 1200, arena-style).

Goal of this project: recreate the **core product experience** — the logged-in
prompting flow, tournament voting, and a leaderboard backed by a **real, working data
pipeline** — not the full product breadth (15+ categories, agentic web-dev evals,
blogs, model pages).

## 2. Problem & goals

**Who it's for (recreation):** us — to have a live, end-to-end reference implementation
of an arena-style preference benchmark we fully control: real UX, real vote data model,
real ratings pipeline.

**Goals**
1. A user can sign in, prompt in a category, and judge a 4-model blind tournament.
2. Votes are first-class data that flow through a ratings pipeline into a public
   leaderboard — the same board updates from both seeded and live human votes.
3. Zero-credential demo: the entire experience must run with no API keys or infra.
4. Clean seams for later: real model APIs, real email, Postgres — all placeholder-swappable.

**Non-goals (v1)**
- Image/video/TTS categories (need binary asset storage + specialized models).
- Agentic web-dev evals (multi-file apps, tool-call traces) — designarena's newer tier.
- Public gallery, model detail pages, blog, social features, mobile apps.
- Anti-abuse (rate limits, dedup, vote-fraud detection) beyond bracket-order enforcement.
- Real-money/real-key live generation in this environment (adapters are in place).

## 3. Core experience (shipped)

### 3.1 Prompt ("What are you creating today?")
- Landing page with category chips (Website, UI Component, Data Viz, Game, Logo/SVG,
  ASCII Art), a prompt box with per-category example prompts, and a top-3 champions teaser.
- Prompting requires sign-in (battles are saved to the account); unauthenticated users
  are routed through login and back.

### 3.2 Generation
- Server picks 4 distinct active models at random from a 14-model roster; each
  generates a self-contained HTML design; results are shuffled into anonymous
  slots A–D so position carries no signal.
- **Sample mode (default):** an offline provider renders genuinely different designs per
  model persona (palette/typography/flavor), deterministic per (model, prompt). This is
  a deliberate scope call: it makes the demo playable end-to-end with no keys, while
  the live vendor adapters (Anthropic/OpenAI/Google/OpenRouter) sit behind
  `DESIGNARENA_GENERATION_MODE=live` with placeholder keys.

### 3.3 Tournament voting
- Bracket: Semifinal 1 (A vs B), Semifinal 2 (C vs D), Grand Final (winners),
  Third-place match (losers) — 4 pairwise votes, matching designarena's mini-tournament
  mechanic (their occasional 5th tiebreaker vote is out of scope).
- Side-by-side sandboxed live previews (interactive — games are playable before voting),
  vote buttons + arrow-key shortcuts, progress indicator, bracket order enforced server-side.
- Model identities hidden until the battle completes.

### 3.4 Reveal
- Podium standings (champion/runner-up/third/fourth) with model names, orgs, generation
  latency, and live previews; CTAs to a new battle or the leaderboard.

### 3.5 Leaderboard
- Category tabs (Overall + 6 categories); table with rank, model, org, score, 95% CI,
  vote count, win rate.
- Methodology surfaced in-product: Bradley–Terry on pairwise votes, 1200 anchor,
  bootstrap intervals.

### 3.6 Account
- Passwordless email-code auth (codes shown in-UI in dev; email provider is a
  placeholder). "My battles" history with prompt, status, resume-voting, and winner.

## 4. Data & pipeline (the part that has to be real)

- **Votes are the atomic unit.** Every pairwise choice inserts a `votes` row
  (winner_model, loser_model, category, user, battle, synthetic flag). Nothing else is
  ever used to rank models.
- **Ratings pipeline:** Bradley–Terry fit (MM algorithm) per category + overall →
  Elo-scaled scores (1200 anchor, 400/decade) → bootstrap CIs → materialized
  `rating_snapshots` / `model_ratings`. The API serves only snapshots (never ranks
  on the fly).
- **Three triggers, one computation:** CLI batch job (`pipeline/compute_ratings.py`,
  the "nightly" path), background recompute on battle completion (the "live" feel),
  and the seed script.
- **Cold start:** `pipeline/seed.py` generates latent per-category model strengths and
  simulates ~3,000 BT-distributed synthetic votes (flagged `synthetic=true`) so the
  board is credible on day one and can be aged out later.

## 5. Success criteria (all verified)

- Full flow (sign in → prompt → 4 votes → reveal) exercised by automated browser run.
- A completed battle's votes visibly move snapshot counts (500 → 504 website votes in QA).
- Backend test suite: rating math recovers known orderings; bracket order enforced;
  auth gates prompting; leaderboard reflects new votes. 10/10 passing.
- Whole app runs from a clean checkout with `pip install`, `seed`, `uvicorn`, `npm run build`.

## 6. Placeholders to swap for production

| Placeholder | Where | Swap with |
|---|---|---|
| `PLACEHOLDER_ANTHROPIC_API_KEY` etc. | `backend/.env.example`, `app/config.py` | Real vendor keys + `DESIGNARENA_GENERATION_MODE=live` |
| Login code returned in API/UI | `auth.py` (`dev_return_login_code`) | Resend/SendGrid via `EMAIL_PROVIDER_API_KEY`, set `DESIGNARENA_DEV_LOGIN_CODE=0` |
| `dev-secret-change-me` session secret | `app/config.py` | Long random `DESIGNARENA_SECRET_KEY` |
| SQLite file DB | `app/db.py` | `DESIGNARENA_DATABASE_URL=postgresql+psycopg://…` (schema is Postgres-clean) |
| Open `/api/leaderboard/recompute` | `leaderboard.py` router | Admin auth or remove (batch job covers it) |
| Live adapters untested against real APIs | `providers/live.py` | One smoke run per vendor once keys exist |

## 7. Later (v2+ candidates, in priority order)

1. Real model generation (live mode) with streaming status + retry/fallback UX.
2. Tie/"both bad" vote options and the 5th tiebreaker match.
3. Public share pages per battle; gallery of recent winners.
4. Vote integrity: per-user rate limits, dedup, synthetic-vote decay schedule.
5. New-model onboarding flow (provisional ratings, min-vote thresholds before listing).
6. Image/slides categories once asset storage exists.
