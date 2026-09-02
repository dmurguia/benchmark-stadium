# Magic Patterns prompt — Calibrated brand v2.1 ("Coming into focus")

v2.1 after reviewing all reference screenshots (Anima hero-object interleaving +
monospace specimen chips; Giga's stepper product tour; Harvey's serif display,
painterly texture cards, framed art-video, flat micro-charts; Wild pixelation; Zaro's
madlib token-chip prompt, mono trust strip, and pixel-cluster page texture — which
confirms the dither motif from two independent references). Paste everything below
the rule into Magic Patterns.

---

Build a multi-screen web experience for **Calibrated** and its product **Calibration
Arena** — the rating agency for AI that does professional work, starting with
accounting. Working CPAs blind-judge AI-drafted accounting work; their
measured-accuracy votes drive public leaderboards where foundation models and vendor
products compete. Tone: a precision instrument with warmth — editorial, credible,
quietly alive. Never gamified, never corporate-gray.

## THE BRAND IDEA

**"Coming into focus."** Calibration means resolving noise into signal. Hidden things
(model identities during blind judging) render as coarse pixel-dither; revealed and
measured things are crisp ink. Use this motif in exactly three places: hidden-author
chips, the resolve entrance animation, and section index numerals — nowhere else.

## DESIGN SYSTEM (follow exactly)

Warm paper-and-ink palette: page background #f6f1e8, alternate panel #eee8de, cards
#fbf8f2, hairline borders #d8d0c4, primary ink #272a24, muted text #6f6a61, forest
green #2f3a31 (hover #455443), rust #9b4e35 (tint #f3e7e1) for emphasis and the
"uncalibrated" state, moss tint #e6ede4 for pass states.

Typography, three voices:
1. **Serif display (Georgia or similar modern serif)** for landing-page H1/H2 and big
   statistic numerals — the Harvey register.
2. **Manrope (400–800)** for all UI, buttons, navigation, body.
3. **Monospace (IBM Plex Mono)** for small bracketed "specimen label" annotation
   chips: thin-bordered rectangles with letter-spaced uppercase mono text, e.g.
   [ AUTHORS HIDDEN ] · [ CPA VERIFIED ] · [ MEASURED JUDGMENT ] — used sparingly as
   measurement callouts on the hero and on framed product panels.

Texture: the ONE dark element family is Harvey-style **painterly ink-wash cards** —
deep forest-green/near-black brushed texture backgrounds with white serif titles and
outlined ghost buttons. Page grounds stay paper; no other dark sections. Cards are
rounded-xl (12px), 1px hairline borders, whisper shadows. No gradients, no
glassmorphism, no stock photos, no emoji.

Logo: a circular gauge dial — thin ink circle, fine rim ticks, a rust needle just off
twelve o'clock — beside "Calibrated" in Manrope 800. Product lockup: "Calibration
Arena · by Calibrated".

Signature motion: one entrance behavior — "resolve": key elements appear as 8px
pixel-mosaic for ~250ms then sharpen. No bounces, no floating.

Page texture (the Zaro/Wild move): paper grounds carry faint scattered
**pixel-dither clusters** near the page edges — small groups of 4–8px ink squares at
4–6% opacity, denser toward corners, never behind body text. This is the brand's
ambient texture; it replaces any dot-grid or mesh.

Charts: flat and editorial (Harvey/Legora register). Big serif numerals (64–96px)
over one-line muted captions separated by hairline rules; bar charts as flat ink-gray
bars with the highlighted competitor in rust, values labeled directly on bars, a
single baseline hairline, no gridlines or shadows. Dashboards may use Harvey-style
micro bar charts (thin dense vertical bars, tiny labels).

## SCREEN 1 — LANDING PAGE

- **Hero (the Anima move, translated)**: a muted paper field holding ONE large
  rendered object — a precision caliper measuring a crisp sheet of paper, in soft
  ink/bone/moss tones — with the serif H1 **interleaved through the object** (words
  passing behind and in front of it): "Which AI is actually good at your job?"
  Small bracketed mono specimen chips float at the edges: [ AUTHORS HIDDEN ],
  [ MEASURED JUDGMENT ], [ CPA VERIFIED ]. Eyebrow above: "THE RATING AGENCY FOR AI
  PROFESSIONAL WORK". Directly beneath the subhead ("CPAs judge AI's accounting work
  blind. The boards decide.") sits the primary interaction — **a madlib prompt card
  (the Zaro move)**: a structured sentence with inline bordered token chips, each
  chip carrying a small icon and a dotted border, reading:
  "Have [ Journal Entries ] for [ a Q3 accrual scenario ] judged blind by
  [ calibrated CPAs ]" — with a "⇄ New suggestion" shuffle control that cycles the
  chips through other combinations (Account Mapping / a legacy-ERP migration /
  the verified panel …), and a dark circular submit arrow at the right. Beneath the
  card, a mono trust strip in the specimen-chip voice:
  EVERY DOCUMENT SYNTHETIC · AUTHORS HIDDEN UNTIL REVEAL · CPAS VERIFIED VIA
  CPAVERIFY. The H1 enters with the resolve effect.
- **Cohort strip (the boxed-logo-row move)**: directly under the hero, a hairline
  row of boxed cells with the mono eyebrow "COMPETING THIS SEASON": Claude Opus 4.8 ·
  GPT-5.5 · Gemini 3 Pro · LedgerPilot [PRODUCT] · GavelPoint [PRODUCT] · +13 more —
  each name in its own hairline cell, products carrying a tiny rust chip.
- **01 · How it works (the stepper product tour)**: left column is a vertical stage
  list — "Describe the work" / "Judge five drafts, blind" / "The calibration check" /
  "The boards move" / "Get paid to judge" — active stage expanded with a two-line
  description, inactive stages collapsed to titles with hairline separators. Right
  side: a large framed product panel (thin ink frame, subtle browser chrome) that
  swaps content per active stage — stage 2 shows two document panels with pixelated
  author chips; stage 4 shows the board chart. A mono chip on the frame corner labels
  the current stage.
- **02 · The boards**: live board preview — flat bar chart, ink bars, one rust bar
  for a vendor product with a "PRODUCT" chip and provenance sub-line
  ("self-submitted · v3.2 · Aug 2026"); beneath it two grayed dashed "empty chair"
  rows: "Atticus AI — invited · declined to participate". Caption: "Foundation
  models and vendor products, same blind panel."
- **03 · Measured judges (the differentiator)**: serif stat band — "94%" (panel
  accuracy on known-answer items), "1,240" (calibration checks this season),
  "Top 18%" (what a reviewer earns) — over hairline rules, with the line "Everyone
  else vets experts by résumé. We measure the judges."
- **04 · Two audiences (the Harvey paired-card move)**: centered serif H2 "One arena,
  two sides." Two large painterly ink-wash cards side by side, product screenshots
  emerging from their bottom edges:
  - **For CPAs** — "Get ranked. Get calibrated. Get paid." Three short payoffs
    (portable credential, paid panel work for top calibration scores, see which tools
    handle your work) + a work-email input "Join the calibrated panel" + note "CPA
    verified via CPAVerify. Every document is synthetic — nothing confidential,
    ever." The emerging screenshot: the My Record page.
  - **For vendors & labs** — "Your buyers are already comparing you here." Certified
    evaluation, private-first results, publish is your call + ghost button "Claim a
    founding seat". The emerging screenshot: the board with a rust PRODUCT bar.
- **05 · The calibration loop (the framed art-video move)**: on a muted gray-paper
  field, centered copy ("Five comparisons. One hidden check. A board that moves.")
  above a large framed animation — a minimal line-drawn art piece (gauge needle
  sweeping, documents resolving from dither to sharp) with a small play/pause
  control. An art piece in a frame, not a screen recording.
- **06 · State of Finance AI**: report teaser — a paper report cover mock (masthead
  rules, serif title) with "Issue #2 adds vendor products. Five founding seats." and
  "Read Issue #1 →".
- **Footer**: dial mark, one-line mission, quiet link columns, "a Corsac company" in
  small muted text.

## SCREEN 2 — BLIND JUDGING (app)

Slim left sidebar (220px, panel background, hairline border): dial mark +
"Calibration Arena" lockup, nav (Judge, Leaderboards, My Sessions, My Record),
bottom sign-in block. Main: scenario title + brief, "Comparison 2 of 5" progress
ticks, two document panels side by side (serif content — a journal-entry table with
debit/credit columns), each panel header carrying an **8px-pixelated author chip**
beside a mono [ AUTHOR HIDDEN ] label, two wide vote buttons. All five comparisons
look identical — never hint which is the calibration check.

## SCREEN 3 — LEADERBOARD (app)

Same sidebar. Vertical tabs (Overall · Finance/ERP · more coming). Release radar
strip: recent model releases with movement chips ("Journal Entries 8 → 4 ▲" in moss,
"▼" in rust). Main board in chart view per the chart law, toggle to a dense table
(Rank, Δ, Competitor, Score, 95% CI, Judgments, Win rate). Below: the dashed
empty-chair block with vendor CTA. Methodology strip: verified votes only · hidden
quality checks · weighted Bradley–Terry.

## SCREEN 4 — MY RECORD (app)

Reviewer profile: name, "CPA / Accountant · Finance", tier chip, Calibrated Reviewer
seal (circular tick-ring badge with a check). Four stat cards with serif numerals
(Calibration score 92%, Top 18%, Consensus 84%, 47 judgments). Badge ladder rail
(Apprentice → Calibrated Reviewer → Lead Reviewer). A rust-tinted card: "Your
calibration qualifies you for paid panel work — 2 open engagements." The percentile
numeral loads with the de-pixelation effect.

## RULES

Realistic specific data everywhere; fictional vendor names only (GavelPoint,
LedgerPilot, Balancr, Atticus AI, CloseWise). The drama lives in data (movement,
empty chairs, pixelated reveals) — never in styling. Desktop-first; tables scroll
inside their cards on small screens. Motif discipline: pixel-dither only for hidden
authors, the resolve entrance, section numerals, and the faint edge clusters on page
grounds; painterly texture only on the two dark audience cards; mono specimen chips
only on the hero, the trust strip, and product frames.
