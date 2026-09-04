# Magic Patterns prompt — Benchmark Stadium front end

Paste everything below the rule into Magic Patterns.

---

Build a multi-screen web app called **Benchmark Stadium** — the arena for professional
work you sign your name to. Professionals (lawyers, accountants) blind-judge AI-drafted
work product head-to-head; their credential-weighted votes drive live leaderboards where
foundation models AND vendor products compete. Tone: quiet, credible, editorial — a
research instrument that happens to be fun, not a game.

## Design system (follow exactly)

Warm paper-and-ink palette, matching corsac.ai: page background `#f6f1e8`, alternate
panel background `#eee8de`, hairline borders `#d8d0c4`, primary text (ink) `#272a24`,
muted text `#6f6a61`, primary accent dark green `#2f3a31` (hover `#455443`), secondary
accent rust `#9b4e35` used sparingly for emphasis chips and warnings. Typeface:
**Manrope** everywhere in the UI. Inside document preview panels only, use a serif stack
(Georgia) so the work products read like paper. Cards are white-ish (`#fbf8f2`) with
`rounded-xl` corners, 1px quiet borders, generous padding, and at most a whisper of
shadow. No gradients, no glassmorphism, no neon, no dark mode. Buttons: dark green fill
with cream text for primary; ghost with hairline border for secondary. Small caps /
letter-spaced uppercase micro-labels in muted ink for section eyebrows.

## Layout

Slim fixed left sidebar (≈220px, alt-panel background, hairline right border): wordmark
"Benchmark Stadium" with a small 🏟️ mark and a tiny "PROTOTYPE" pill, then nav — Judge,
Leaderboards, My Sessions, My Record — and a bottom-pinned Sign in / avatar block.
Content area max-width ~1080px, left-aligned headings.

## Screen 1 — Home (prompt-first front door)

Eyebrow: "THE ARENA FOR WORK YOU SIGN YOUR NAME TO". H1: "Which AI is actually good at
your job?" Below it, the front door is an **open prompt box**, not a menu: a large
textarea, placeholder "Describe the work — e.g. 'Redline this vendor NDA, we're the
receiving party' or 'Draft the journal entries for a deferred revenue release'…", with
two small vertical chips under it (⚖️ Legal · 🧾 Finance/ERP) and a dark green "Judge
this →" button. Beneath, a row of three example scenario cards (title, two-line brief,
ghost "Judge this →"), e.g. "One-sided vendor NDA", "Mutual NDA for an acquisition
talk", "Q3 accrual journal entries". Then a slim drama banner in rust-tinted card:
"⚡ Claude Opus 4.8 shipped a Sep 2026 refresh — every board it competes on just re-ran.
See the movement →". Then a three-up payoff strip: "Prove your eye" (hidden calibration
checks score you), "A portable credential" (Calibrated Reviewer badge + percentile),
"Know before your boss buys" (see which tools actually handle your work). Footer stat
line: "2,650 verified judgments · 18 competitors · 4 boards". Anonymous visitors can
start judging immediately; the gate comes later.

## Screen 2 — Blind judging session

Header: scenario title + one-line brief, and "Comparison 2 of 5" with five small
progress chips (done/current/todo). Two document panels side by side, each a white card
with serif typographic work product inside (a redlined NDA with struck-through and
inserted text; or a journal-entry table with debit/credit columns and totals). Above
each panel only "Draft A" / "Draft B — author hidden". Under the panels: two wide vote
buttons ("Draft A is better" / "Draft B is better") plus a muted "expand" icon on each
panel. Never hint which comparison is the calibration check — all five look identical.
After an anonymous visitor's first comparison, show a centered auth-gate card over the
next one: "Keep judging — make it count. Sign in with your work email so your votes
carry weight on the boards." (email field + "Send code" primary button, note: "Free
email = directional only. Work domain = full weight.")

## Screen 3 — Reveal

"Session complete." Podium strip (🥇🥈🥉 with model names + orgs revealed). A calibration
result card in green-tinted or rust-tinted variant: "Calibration check: passed — you
caught the flawed draft. Your reviewer weight holds." Bracket recap (semis → final →
third place) with the revealed names, and a "Your judgment moved these boards" list
with small Δ arrows (e.g. "Clause Risk Review: GavelPoint Drafts 5 → 4 ▲"). CTAs:
"Judge another" (primary), "See the boards" (ghost).

## Screen 4 — Leaderboards (company boards)

Sub-nav chips: Overall · LEGAL: Contract Redline, Clause Risk Review · FINANCE/ERP:
Journal Entries, Account Mapping. Top of page, a "⚡ Release radar" card: two recent
release entries (model name + "Sep 2026 refresh" + date + "600 re-run judgments") each
with movement chips — green "Contract Redline 8 → 4 ▲", rust "Account Mapping 6 → 10 ▼"
— and microcopy "When a model ships, its rows re-run on every board it competes on. The
movement is the story." Main board: ranked table with columns Rank, Δ, Competitor,
Score (with a thin dark-green bar), 95% CI, Judgments, Win rate. Rows mix foundation
models (Claude Sonnet 4.6 — Anthropic; GPT-5.5 — OpenAI; Gemini 3 Pro — Google; Qwen3
Max — Alibaba…) with **vendor products** marked by a small rust "PRODUCT" chip and a
provenance sub-line ("GavelPoint Legal AI · self-submitted · v3.2 · Aug 2026" or
"Briefly · buyer-contributed · build 2026.07"). Scores ~950–1360. Below the table, a
dashed-border card "Not on this board": two grayed empty-chair rows with a dashed "?"
avatar — "Atticus Counsel — Atticus AI · Invited for the Q3 board · declined to
participate", "Veritas Draft — Veritas Legal · Invited · no response" — and the line
"Vendor of one of these? Submit your product for the next board cut → Your buyers are
already comparing you here — with or without your best version." Close with a
three-column "How this board stays honest" methodology strip (verified votes only ·
hidden quality checks · weighted Bradley–Terry, snapshotted).

## Screen 5 — My Record (reviewer profile)

Header with the reviewer's name, role + vertical ("CPA / Accountant · Finance"), tier
pill ("Tier 1 · Work-domain verified"), and badge ("Calibrated Reviewer"). Four stat
cards: Calibration score (e.g. 92% · "11 of 12 hidden checks caught"), Percentile
("Top 18% of finance reviewers"), Consensus agreement (84% vs verified peers),
Judgments (47 cast · 44 counted). A quiet progress rail showing the badge ladder
Apprentice → Calibrated Reviewer → Top Reviewer, and an upgrade card: "Verify your CPA
license to reach Tier 2 — your votes would carry 1.5× weight." Recent sessions list
(scenario, date, result chip).

## Rules

Use realistic, specific data everywhere (no lorem ipsum). Vendor names must stay
fictional (GavelPoint, Briefly, LedgerPilot, Balancr, Atticus AI, Veritas Legal,
Recono, CloseWise). Keep the interface calm: the drama lives in the data (movement
chips, empty chairs), never in the styling. No emojis in body copy beyond the
specified marks. Desktop-first, but the board table should scroll horizontally
inside its card on small screens.
