# Magic Patterns prompt — Calibrated Direction B ("Night Lab")

The A/B counterpart to `magic-patterns-brand-prompt.md` (Direction A · Slate
Daylight). Same brand idea, same references, same section structure — inverted
mood: dark carbon chrome where the paper documents are the light source
(anchored by the Giga dark product section, Harvey's painterly darks, Wild's
pixelation, Anima's single-atmosphere field, Zaro's madlib prompt). Type trio held
constant across A and B so the test isolates mood. All text/ground pairs
contrast-checked to WCAG AA. Run on Base. Paste everything below the rule.

---

Build a multi-screen web experience for **Calibrated** and its product **Calibration
Arena** — the rating agency for AI that does professional work, starting with
accounting. Working CPAs blind-judge AI-drafted accounting work; their
measured-accuracy votes drive public leaderboards where foundation models and vendor
products compete. Tone: a metrology lab at night — dark, precise, quietly luminous.
Minimalist and editorial; never neon, never sci-fi, never gamified.

## THE BRAND IDEA

**"Documents under the lamp."** The interface is the darkened lab; the work product
is the light. Everything chrome is carbon-dark and recedes; every document, board,
and measurement glows paper-bright. Hidden things (model identities during blind
judging) render as coarse pixel-dither in bone; revealed and measured things are
crisp.

## DESIGN SYSTEM (follow exactly)

Night Lab palette: page background #141715 (carbon, green-tinged near-black —
never pure #000), raised panels #1c201d, elevated cards #1f2421, hairline borders
#2e3430, primary text bone #e8e6df, muted text #9aa096, steel-dark #565c56 for
de-emphasized chart bars. The ONE light family is **paper**: #f4f2ec surfaces with
ink #1a1d1c text — used exclusively for document panels, the two audience cards,
and the report cover, so paper always means "the work itself." Amber instrument
glow #e0862a (dark tint #3a2a18) reserved for the gauge needle, PRODUCT chips,
downward movement, the "uncalibrated" state, and the primary CTA (carbon text on
amber). Sage glow #93b89e for pass states and upward movement.

Typography, three voices:
1. **Newsreader (serif, 500–700)** for landing H1/H2 and big statistic numerals.
2. **Schibsted Grotesk (400–700)** for all UI, buttons, navigation, body.
3. **IBM Plex Mono** for bracketed "specimen label" chips: thin low-alpha-bordered
   rectangles, letter-spaced uppercase, e.g. [ AUTHORS HIDDEN ] · [ CPA VERIFIED ]
   · [ MEASURED JUDGMENT ].

Surfaces: flat carbon with 1px hairlines — depth comes from tonal steps
(#141715 → #1c201d → #1f2421), not shadows. Rounded-xl (12px). No gradients, no
glassmorphism, no glow halos or bloom effects, no stock photos, no emoji. Paper
cards may carry a whisper shadow, as if lit from above.

Logo: a circular gauge dial — thin bone circle, fine rim ticks, an amber needle
just off twelve o'clock — beside "Calibrated" in Schibsted Grotesk 700, bone.
Product lockup: "Calibration Arena · by Calibrated".

Signature motion: one entrance behavior — "resolve": key elements appear as 8px
bone pixel-mosaic for ~250ms then sharpen. No bounces, no floating.

Page texture: carbon grounds carry faint scattered **pixel-dither clusters** near
page edges — small groups of 4–8px bone squares at 5–7% opacity, denser toward
corners, never behind body text.

Charts: flat and editorial. Big serif numerals (64–96px) in bone over one-line
muted captions separated by low-alpha hairline rules; bar charts as flat steel-dark
bars with the highlighted competitor in amber, values labeled directly on bars, a
single baseline hairline, no gridlines.

## SCREEN 1 — LANDING PAGE

- **Hero (the object-interleave move)**: a deep carbon field holding ONE object —
  a crisp sheet of paper lit as if under an examination lamp, a steel caliper
  measuring its edge, the only bright thing in the frame — with the serif H1 in
  bone **interleaved through the object** (words passing behind and in front):
  "Which AI is actually good at your job?" Mono specimen chips float at the edges:
  [ AUTHORS HIDDEN ], [ MEASURED JUDGMENT ], [ CPA VERIFIED ]. Eyebrow above: "THE
  RATING AGENCY FOR AI PROFESSIONAL WORK". Beneath the subhead ("CPAs judge AI's
  accounting work blind. The boards decide.") sits the primary interaction — **a
  madlib prompt card** on raised carbon: a structured sentence with inline
  dotted-border token chips, "Have [ Journal Entries ] for [ a Q3 accrual
  scenario ] judged blind by [ calibrated CPAs ]" — a "⇄ New suggestion" shuffle
  control cycling the chips (Account Mapping / a legacy-ERP migration / the
  verified panel …), and an amber circular submit arrow. Beneath, a mono trust
  strip: EVERY DOCUMENT SYNTHETIC · AUTHORS HIDDEN UNTIL REVEAL · CPAS VERIFIED
  VIA CPAVERIFY. The H1 enters with the resolve effect.
- **Cohort strip**: a hairline row of boxed cells, mono eyebrow "COMPETING THIS
  SEASON": Claude Opus 4.8 · GPT-5.5 · Gemini 3 Pro · LedgerPilot [PRODUCT] ·
  GavelPoint [PRODUCT] · +13 more — products carrying a tiny amber chip.
- **01 · How it works (the stepper product tour — the Giga move, its home
  territory)**: left column vertical stage list in bone — "Describe the work" /
  "Judge five drafts, blind" / "The calibration check" / "The boards move" / "Get
  paid to judge" — active stage expanded, inactive collapsed with hairline
  separators. Right: a large framed product panel that swaps per stage — stage 2
  shows two PAPER document panels glowing against the dark; stage 4 the board
  chart. A mono chip on the frame corner labels the stage.
- **02 · The boards**: board preview on carbon — steel-dark bars, one amber bar
  for a vendor product with "PRODUCT" chip and provenance sub-line
  ("self-submitted · v3.2 · Aug 2026"); beneath, two dim dashed "empty chair"
  rows: "Atticus AI — invited · declined to participate". Caption: "Foundation
  models and vendor products, same blind panel."
- **03 · Measured judges**: serif stat band in bone — "94%" (panel accuracy on
  known-answer items), "1,240" (calibration checks this season), "Top 18%" (what a
  reviewer earns) — over low-alpha rules, with "Everyone else vets experts by
  résumé. We measure the judges."
- **04 · Two audiences (the paired-card move, inverted)**: centered serif H2 "One
  arena, two sides." Two large PAPER cards side by side — the only big light
  surfaces on the page, lit like documents on a bench — ink text, product
  screenshots emerging from their bottom edges:
  - **For CPAs** — "Get ranked. Get calibrated. Get paid." Three short payoffs
    (portable credential, paid panel work for top calibration scores, see which
    tools handle your work) + a work-email input "Join the calibrated panel" +
    note "CPA verified via CPAVerify. Every document is synthetic — nothing
    confidential, ever." Emerging screenshot: the My Record page.
  - **For vendors & labs** — "Your buyers are already comparing you here."
    Certified evaluation, private-first results, publish is your call + outlined
    button "Claim a founding seat". Emerging screenshot: the board with an amber
    PRODUCT bar.
- **05 · The calibration loop (the framed art-video move)**: centered copy ("Five
  comparisons. One hidden check. A board that moves.") above a large framed
  animation — a minimal bone line-drawing on carbon (gauge needle sweeping,
  documents resolving from dither to sharp) with a small play/pause control. An
  art piece in a frame, not a screen recording.
- **06 · State of Finance AI**: a PAPER report cover mock (masthead rules, serif
  title) floating on the carbon ground — "Issue #2 adds vendor products. Five
  founding seats." and "Read Issue #1 →".
- **Footer**: dial mark, one-line mission, quiet link columns, "a Corsac company"
  in small muted text.

## SCREEN 2 — BLIND JUDGING (app)

Slim left sidebar (220px, raised carbon #1c201d, hairline border): dial mark +
"Calibration Arena" lockup, nav (Judge, Leaderboards, My Sessions, My Record),
bottom sign-in block. Main on carbon: scenario title + brief in bone, "Comparison
2 of 5" progress ticks, and the page's whole point — **two PAPER document panels
glowing side by side** (serif journal-entry tables with debit/credit columns, ink
on paper), each header carrying an 8px bone-pixelated author chip beside a mono
[ AUTHOR HIDDEN ] label. Two wide vote buttons (bone outline; amber fill on
hover). All five comparisons look identical — never hint which is the calibration
check.

## SCREEN 3 — LEADERBOARD (app)

Same sidebar. Vertical tabs (Overall · Finance/ERP · more coming). Release radar
strip: recent releases with movement chips ("Journal Entries 8 → 4 ▲" in sage
glow, "▼" in amber). Main board chart per the chart law, toggle to a dense table
(Rank, Δ, Competitor, Score, 95% CI, Judgments, Win rate) on raised carbon.
Below: the dim dashed empty-chair block with vendor CTA. Methodology strip:
verified votes only · hidden quality checks · weighted Bradley–Terry.

## SCREEN 4 — MY RECORD (app)

Reviewer profile in bone: name, "CPA / Accountant · Finance", tier chip,
Calibrated Reviewer seal (bone tick-ring badge, amber needle detail). Four stat
cards on raised carbon with serif numerals (Calibration score 92%, Top 18%,
Consensus 84%, 47 judgments). Badge ladder rail (Apprentice → Calibrated Reviewer
→ Lead Reviewer). An amber-tinted card (#3a2a18, amber text): "Your calibration
qualifies you for paid panel work — 2 open engagements." The percentile numeral
loads with the de-pixelation effect.

## RULES

Realistic specific data everywhere; fictional vendor names only (GavelPoint,
LedgerPilot, Balancr, Atticus AI, CloseWise). The drama lives in data (movement,
empty chairs, pixelated reveals) — never in styling. Desktop-first; tables scroll
inside their cards on small screens. Discipline: paper surfaces ONLY for
documents, the two audience cards, and the report cover; amber only for needle,
PRODUCT, CTA, downward movement, and the uncalibrated state; pixel-dither only for
hidden authors, the resolve entrance, section numerals, and faint edge clusters.
No pure black, no glow effects — the "lamp" is implied by contrast, never drawn.
