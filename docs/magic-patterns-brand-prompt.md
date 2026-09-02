# Magic Patterns prompt — Calibrated brand v1 ("Coming into focus")

Brand synthesis from the reference set (Anima interactive background, Harvey/Legora flat
stats, Wild pixelation, Zaro chat patterns, numbered sectioning, inline product demos).
Paste everything below the rule into Magic Patterns.

---

Build a multi-screen web experience for **Calibrated** and its product **Calibration
Arena** — the rating agency for AI that does professional work, starting with
accounting. Working CPAs blind-judge AI-drafted accounting work; their measured-accuracy
votes drive public leaderboards where foundation models and vendor products compete.
Tone: a precision instrument with warmth — quiet, credible, alive. Never gamified,
never corporate-gray.

## THE BRAND IDEA (drives every visual decision)

**"Coming into focus."** Calibration means resolving from noise to signal. The entire
brand behaves this way: key elements enter as coarse pixel-dither and resolve into
crisp ink. Hidden things (model identities during blind judging) are shown as
pixelated blocks; revealed things are sharp. This is the one motif — use it precisely
and sparingly, never as random decoration.

## DESIGN SYSTEM (follow exactly)

Warm paper-and-ink palette: page background #f6f1e8, alternate panel #eee8de, cards
#fbf8f2, hairline borders #d8d0c4, primary ink #272a24, muted text #6f6a61, primary
accent forest green #2f3a31 (hover #455443), secondary accent rust #9b4e35 (tint
#f3e7e1) used only for emphasis and the "uncalibrated" state, moss tint #e6ede4 for
positive/pass states. Typography: **Manrope** (400–800) for all UI; **Georgia serif**
for two things only — big statistic numerals and document content inside work-product
panels. Cards are rounded-xl (12px) with 1px hairline borders and at most a whisper of
shadow. No gradients, no glassmorphism, no dark sections, no stock photos, no emoji.

**Logo**: a circular gauge dial — thin ink circle with fine tick marks around the rim
and a rust needle pointing just off twelve o'clock — beside the wordmark "Calibrated"
in Manrope 800. Product lockup: "Calibration Arena · by Calibrated".

**Signature background (from the interactive-nature reference)**: sections sit on a
sparse field of tiny calibration tick marks (1px ink at 8% opacity, on a loose grid).
Ticks within ~80px of the cursor rotate subtly toward it and rise to 25% opacity —
alive but nearly subliminal. Never dots-and-lines "tech mesh"; these are instrument
ticks.

**Signature motion**: exactly one entrance behavior — "resolve": elements appear as
8px pixel-mosaic/dither for ~250ms then sharpen into place. Used on hero headline,
stat numerals, and reveal moments. No bounces, no floating, no parallax beyond the
tick field.

**Charts (from the Harvey/Legora/V7 references)**: flat and editorial. Big Georgia
serif numerals (64–96px) over one-line muted captions, separated by hairline rules.
Bar charts: flat ink-gray bars, the highlighted competitor's bar in rust, no
gridlines, no axes ticks beyond a baseline hairline, no shadows, values labeled
directly on bars.

**Sectioning**: every landing section opens with a pixel-glyph index number ("01",
"02" — rendered as small dithered numerals that sharpen on scroll-into-view), a
letter-spaced uppercase eyebrow, and a hairline rule. Generous whitespace; one idea
per section.

## SCREEN 1 — LANDING PAGE

- **Hero (chat-first, from the chatbot-pattern reference)**: the hero object IS the
  product's front door — a large chat-style input card on paper, typed rotating
  placeholder ("Redline this vendor NDA, we're the receiving party…" / "Draft the
  journal entries for a deferred revenue release…"), a forest circular submit arrow,
  and small work-type chips beneath (Journal Entries, Account Mapping, Contract
  Redline, Clause Risk). Above it: eyebrow "THE RATING AGENCY FOR AI PROFESSIONAL
  WORK", H1 "Which AI is actually good at your job?" — the H1 enters with the
  resolve/dither effect. The tick-field background responds to the cursor. Floating
  pixelated name-tags near the input (labeled "author hidden") hint at blind judging.
- **01 · How it works**: three numbered steps in one row — "Describe the work" /
  "Judge five drafts, blind" / "The boards move" — each with a small inline
  auto-playing demo loop in a paper-framed card (from the interactive-video
  reference): step 2's card shows two document panels side by side with pixelated
  author chips; hovering scrubs the loop.
- **02 · The boards**: a live board preview — flat bar chart, ink bars, one rust bar
  for the highlighted vendor product with a "PRODUCT" chip and provenance sub-line
  ("self-submitted · v3.2 · Aug 2026"); below it two grayed dashed "empty chair" rows:
  "Atticus AI — invited · declined to participate". Caption: "Foundation models and
  vendor products, same blind panel."
- **03 · Measured judges** (the differentiator): Legora-style stat band — three huge
  serif numerals over hairline rules: "94%" (panel accuracy on known-answer items),
  "1,240" (calibration checks run this season), "Top 18%" (what a reviewer earns) —
  with the line "Everyone else vets experts by résumé. We measure the judges."
- **04 · For CPAs — Get ranked. Get calibrated. Get paid.**: the reviewer offer with
  the Calibrated Reviewer seal (circular tick-ring badge with a check), three short
  payoffs (portable credential, paid panel work for top calibration scores, see which
  tools handle your work), and a work-email waitlist input: "Join the calibrated
  panel". Note: "CPA verified via CPAVerify. Every document is synthetic — nothing
  confidential, ever."
- **05 · State of Finance AI**: teaser for the quarterly report — a paper report
  cover mock (masthead rules, serif title) with "Issue #2 adds vendor products. Five
  founding seats." and a "Read Issue #1 →" link.
- **Footer**: dial mark, one-line mission, quiet link columns, "a Corsac company" in
  small muted text.

## SCREEN 2 — BLIND JUDGING (app)

Slim left sidebar (220px, panel background, hairline border): dial mark + "Calibration
Arena" lockup, nav (Judge, Leaderboards, My Sessions, My Record), bottom sign-in
block. Main: scenario title + brief, "Comparison 2 of 5" progress ticks, two
document panels side by side (Georgia serif content — a journal-entry table with
debit/credit columns), each header showing an **8px-pixelated author chip** (the
motif working as anonymity), two wide vote buttons. All five comparisons look
identical — never hint which is the calibration check.

## SCREEN 3 — LEADERBOARD (app)

Same sidebar. Vertical tabs (Overall · Finance/ERP · more coming). Release radar
strip: recent model releases with movement chips ("Journal Entries 8 → 4 ▲" in moss,
"▼" in rust). Main board in chart view per the chart law (flat bars, rust for
products), toggle to a dense table (Rank, Δ, Competitor, Score, 95% CI, Judgments,
Win rate). Below: the dashed empty-chair block with vendor CTA. Methodology strip:
verified votes only · hidden quality checks · weighted Bradley–Terry.

## SCREEN 4 — MY RECORD (app)

Reviewer profile: name, "CPA / Accountant · Finance", tier chip, Calibrated Reviewer
seal. Four stat cards using serif numerals (Calibration score 92%, Top 18%, Consensus
84%, 47 judgments). Badge ladder rail (Apprentice → Calibrated Reviewer → Lead
Reviewer). A rust-tinted card: "Your calibration qualifies you for paid panel work —
2 open engagements." The de-pixelation motif on the percentile numeral as it loads.

## RULES

Realistic specific data everywhere; fictional vendor names only (GavelPoint,
LedgerPilot, Balancr, Atticus AI, CloseWise). The drama lives in data (movement,
empty chairs, pixelated reveals) — never in styling. Desktop-first; tables scroll
inside their cards on small screens. The pixel motif appears ONLY for: hidden
authors, the resolve entrance, and section index numerals — nowhere else.
