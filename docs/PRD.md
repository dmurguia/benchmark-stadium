# PRD — Benchmark Stadium

**Status:** v2 pivot shipped · **Owner:** David Murguia · **Author:** Claude (PM/eng pass)
**Date:** 2026-08-31 (v2) · 2026-08-30 (v1)

---

# v2 — The professional work arena (current)

## Thesis

Design Arena's primitive is cheap universal judgment at consumer scale; ours is the
opposite: **scarce, attributed, expert judgment on accountable work** — the quadrant
consumer arenas structurally cannot enter. The product is the arena loop applied to
professional work product, with a trust layer that makes every vote attributable and
weighable, in service of the larger strategy: certified custom benchmarks
(per-firm mini-arenas + benchmark certificates) sold to enterprises, with vendor-side
revenue later.

## Scope decisions (v2 prototype)

- **Two verticals, chosen by the "accountability filter"** (expert-only judgment ×
  high stakes): **Legal** (contract-redline, clause-risk) and **Finance/ERP**
  (journal-entry, coa-mapping). More verticals are a playbook, not a rebuild.
  Roadmap verticals 3–4 (decided): **medical coding & clinical documentation**
  (BS-14 — strongest certification culture, ICD-10/CPT-keyed scoring, churn-driven
  training demand) and **tax** (BS-15).
- **"We bring the doc."** All scenarios are synthetic matters with planted issues —
  the sensitivity objection is solved by never needing an upload. BYOD
  (describe-don't-disclose synthesis, sanitize-assist) is deliberately out of the MVP.
- **Session = 5 comparisons**: two opening rounds, one hidden calibration trap,
  top + consolation match. ~5 minutes for a professional.
- **The reviewer's payoff is baked in** (the "what's in it for her" answer):
  a calibration score from hidden gold-standard checks, a portable badge
  ("Calibrated Reviewer", percentile), consensus agreement vs. peers, and early
  intelligence on which models handle their work. Ten minutes a week maintains it.
- **Trust layer shipped, not promised**: credential tiers from email domain
  (free-mail = tier 0, directional only; work domain = tier 1, full weight; license =
  tier 2 and named reviewer = tier 3 as upgrade placeholders), weighted BT fit,
  behavioral timing floor, trap results per rater, verified-only published boards.
- **Work products are genuinely gradeable.** The offline generator gives each model a
  latent quality level that changes *substance* (issues caught, accounts chosen,
  ratings right) — so a professional's pick is a real judgment, and broken trap
  artifacts (unbalanced entries, swapped parties) are objectively wrong.

## Growth thesis (decided 2026-08-31)

The organic-growth mechanic is **release drama on company boards** (BS-16): the
roster grows beyond foundation models to vendor *products* (opt-in self-submission;
decliners listed; buyer-contributed outputs under the buyer's own license), foundation
rows re-run automatically on every model release, and a quarterly "State of
[vertical] AI" report is generated from board movement.

**BS-16 prototype scope shipped (2026-09-01):** vendor products (fictional personas)
compete on boards inside their vertical with PRODUCT badges and provenance
(self-submitted / buyer-contributed + version); invited vendors who declined render as
dashed empty-chair rows with a "submit your product" CTA — the deliberate FOMO surface;
a release engine re-runs a foundation model's rows across its boards and captures the
rank movement into a Release radar feed (one-click "simulate next release" stands in
for real release detection) plus a home-page drama banner. Company-as-cohort ideas are
explicitly *not* built as a feature — the empty chair is the only cohort mechanic kept.
Production remainder (real submission portal, release detection, quarterly report) is
BS-18.

**BS-13 + BS-19 shipped (2026-09-01):** the front door is now prompt-first — an open
"describe the work" box (keyword-routed to the right board) with work-type chips; a
guest gets one real blind comparison before the in-session auth gate, and signing in
mid-session claims the running bracket (guest votes carry zero board weight). The
entire UI was rebuilt from the Magic Patterns design on the corsac.ai design system
(`docs/magic-patterns-prompt.md` is the design source), wired screen-for-screen to the
live API. Gimmick-tier growth hacks
(daily puzzles, share cards) are explicitly rejected; the front door stays
**prompt-first** (BS-13): describe the work → one blind comparison before signup.
CE-credit (CPE/CLE) angles are rejected as non-durable; the durable adjacent wedge is
**training & ramp-up** (BS-17) — judging calibrated work as deliberate practice for
juniors in high-churn roles, sold per-seat into L&D/onboarding budgets, with trainee
votes gaining board weight only as calibration is earned.

## Focus decision (2026-09-02): accounting-first, calibrated judgment network

**Positioning:** "The calibrated judgment layer for professional AI — starting with
accounting." (Lab/investor framing: RL-grade human judgment network; practitioner
framing: get ranked, get calibrated, get paid. Never say "RL" to CPAs.) Legal is
demoted from launch vertical to fast-follow (Certera/Vals/Legora saturation); the
platform stays vertical-agnostic.

**Model (AfterQuery-adjacent, opposite surface):** AfterQuery et al. sell private
expert data upstream to labs; we produce a public trust-weighted market signal and a
**calibration-scored CPA panel**. Moat = continuously measured rater quality (trap
pass rates, consensus, percentile — refreshed weekly) vs. their résumé-vetting; plus
demand-side products (boards, State of Finance AI report) that data vendors can't
build without ranking their own customers.

**Supply ladder (novice → paid):** Guest (1 free comparison) → Verified (work email,
counted votes) → CPA-verified (NASBA CPAVerify lookup → tier 2, 1.5×) → Calibrated
Reviewer (≥80% traps over ≥5, consensus floor → paid-pool eligible) → **Panelist**
(contracted paid eval work, weekly payout) → Lead reviewer (authors rubrics/traps,
higher rate). Free work keeps public boards honest and builds the credential; paid
work is private gigs. Demand-first lesson from AfterQuery's genesis still applies:
line up 1–2 anchor design partners before scaling supply past ~200–500.

**ICPs (priority order):**
1. **Accounting-AI vendors** (Basis, Numeric, Rillet, Puzzle, Digits, Fieldguide,
   DataSnipper, Vic.ai…): credibility gap vs. skeptical controllers. Free board
   listing → paid certified evaluation ($10–40k, private-first with publish option)
   → quarterly monitoring. Rillet = design-partner #1 candidate (warm network).
2. **Labs + data vendors as channel** (Mercor/AfterQuery/Surge subcontracting
   calibrated CPA capacity; APEX-Accounting proves finance-eval demand): calibrated
   grading panels, gold-standard eval sets (Corsac pipeline), rubric authoring.
   Per-judgment $3–15; projects $25–250k.
3. **Enterprises/firms** (CAO/controller mid-ERP-decision; firm innovation leads):
   private bake-offs + know-before-you-buy reports ($15–50k); L&D calibration
   training per-seat (BS-17). Inbound via the board; pursue last.
Individual professionals never pay.

**Recruiting (community-first):** r/Accounting, Fishbowl Big-4 bowls, Going Concern
(earned media), CPA-exam communities (trainee tier), LinkedIn CPA-filtered outreach +
referral bounties, state societies; off-season timing (mid-Apr–Jun, post-Oct 15).
Tier-2 verification via CPAVerify.org. First public artifact: **"State of Finance AI,
Issue #1"** generated from captured `model_releases` board movement.

## Out of scope (v2, deliberate)

Bring-your-own-document; license-verification integrations (bar/CPA/SAP lookups);
rater-level Bradley–Terry reliability weighting (trap pass-rate stands in); vendor
astroturf detection beyond blindness + shuffling; per-firm private arenas (the
enterprise product this prototype rehearses); live model generation (adapters exist
behind placeholder keys).

## v2 success criteria (all verified)

- Full loop in a real browser: sign-in (work-domain → tier 1) → onboarding
  (vertical + role) → scenario battle → 5 comparisons incl. trap → reveal with
  calibration result → board moves → reviewer record page.
- 15/15 backend tests: flow, bracket order, trap accounting, tier detection,
  weighted verified snapshots, reviewer stats, catalog.
- Zero-credential demo from a clean checkout.

---

# v1 — Design Arena recreation (superseded)

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
  `ARENA_GENERATION_MODE=live` with placeholder keys.

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
| `PLACEHOLDER_ANTHROPIC_API_KEY` etc. | `backend/.env.example`, `app/config.py` | Real vendor keys + `ARENA_GENERATION_MODE=live` |
| Login code returned in API/UI | `auth.py` (`dev_return_login_code`) | Resend/SendGrid via `EMAIL_PROVIDER_API_KEY`, set `ARENA_DEV_LOGIN_CODE=0` |
| `dev-secret-change-me` session secret | `app/config.py` | Long random `ARENA_SECRET_KEY` |
| SQLite file DB | `app/db.py` | `ARENA_DATABASE_URL=postgresql+psycopg://…` (schema is Postgres-clean) |
| Open `/api/leaderboard/recompute` | `leaderboard.py` router | Admin auth or remove (batch job covers it) |
| Live adapters untested against real APIs | `providers/live.py` | One smoke run per vendor once keys exist |

## 7. Later (v2+ candidates, in priority order)

1. Real model generation (live mode) with streaming status + retry/fallback UX.
2. Tie/"both bad" vote options and the 5th tiebreaker match.
3. Public share pages per battle; gallery of recent winners.
4. Vote integrity: per-user rate limits, dedup, synthetic-vote decay schedule.
5. New-model onboarding flow (provisional ratings, min-vote thresholds before listing).
6. Image/slides categories once asset storage exists.
