"""Offline professional work-product generator (v2 pivot).

Produces the four task types' deliverables — contract redlines, clause risk
memos, journal entries, chart-of-accounts mappings — as self-contained HTML
documents. Each arena model has a latent quality level, so outputs differ in
*substance* (issues caught, accounts chosen, ratings right), not just style:
judging is a real professional judgment. Deterministic per (model, scenario).

Also builds gold-standard trap outputs: plausible-looking work that is
objectively wrong (unbalanced entries, swapped parties), used to score rater
reliability — never model skill.

Swap for live model output with DESIGNARENA_GENERATION_MODE=live once keys
exist; the scenario brief is the prompt live models receive.
"""
from __future__ import annotations

import random

from ...models import ArenaModel
from .base import GenerationResult

# Latent quality per model (mirrors the seed roster's strength tiers).
QUALITY: dict[str, float] = {
    "claude-opus-4-8": 0.92, "gpt-5-5": 0.88, "gemini-3-pro": 0.85,
    "claude-sonnet-4-6": 0.80, "glm-5-2": 0.78, "deepseek-v4": 0.74,
    "kimi-k2-5": 0.72, "grok-4-1": 0.70, "gemini-3-flash": 0.66,
    "qwen3-max": 0.64, "mistral-large-3": 0.62, "gpt-5-mini": 0.60,
    "minimax-m2-5": 0.55, "llama-4-maverick": 0.50,
}

_FONTS = ["Georgia, 'Times New Roman', serif", "'Palatino Linotype', Palatino, serif",
          "'Cambria', Georgia, serif", "'Book Antiqua', Palatino, serif"]


class ProfessionalSampleProvider:
    async def generate(self, model: ArenaModel, prompt: str, category: str, scenario: dict | None = None) -> GenerationResult:
        scenario = scenario or {}
        rng = random.Random(f"{model.slug}::{category}::{scenario.get('id', prompt)}")
        q = max(0.1, min(0.98, QUALITY.get(model.slug, 0.6) + rng.gauss(0, 0.07)))
        gen = {
            "contract-redline": _redline,
            "clause-risk": _clause_risk,
            "journal-entry": _journal_entry,
            "coa-mapping": _coa_mapping,
        }.get(category, _redline)
        html = gen(scenario, q, rng)
        return GenerationResult(html=html, latency_ms=rng.randint(1400, 4600))

    def generate_broken(self, category: str, scenario: dict, seed: str = "trap") -> GenerationResult:
        rng = random.Random(f"broken::{category}::{scenario.get('id', '')}::{seed}")
        gen = {
            "contract-redline": _broken_redline,
            "clause-risk": _broken_clause_risk,
            "journal-entry": _broken_journal_entry,
            "coa-mapping": _broken_coa_mapping,
        }.get(category, _broken_redline)
        html = gen(scenario, rng)
        return GenerationResult(html=html, latency_ms=rng.randint(1400, 4600))


# ---------------------------------------------------------------------------
# Document chrome
# ---------------------------------------------------------------------------

def _doc(title: str, subtitle: str, body: str, rng: random.Random) -> str:
    font = rng.choice(_FONTS)
    return f"""<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<style>
*{{box-sizing:border-box;margin:0}}
body{{background:#eceae4;font-family:{font};color:#1c1b18;padding:22px 14px;-webkit-font-smoothing:antialiased}}
.page{{max-width:760px;margin:0 auto;background:#fffdf9;border:1px solid #d9d5ca;box-shadow:0 8px 30px rgba(40,35,20,.12);padding:44px 52px}}
h1{{font-size:19px;letter-spacing:.08em;text-transform:uppercase;text-align:center;margin-bottom:6px}}
.sub{{text-align:center;color:#6d675a;font-size:13px;margin-bottom:26px;border-bottom:1px solid #d9d5ca;padding-bottom:16px}}
h2{{font-size:14px;margin:20px 0 8px}}
p,li,td,th{{font-size:13.5px;line-height:1.62}}
del{{color:#a02020;text-decoration:line-through}}
ins{{color:#1a6b2f;text-decoration:none;border-bottom:1px dotted #1a6b2f;font-weight:600}}
table{{border-collapse:collapse;width:100%;margin:10px 0}}
th,td{{border:1px solid #d9d5ca;padding:7px 10px;text-align:left;vertical-align:top}}
th{{background:#f4f1e8;font-size:11.5px;text-transform:uppercase;letter-spacing:.06em}}
td.num{{text-align:right;font-variant-numeric:tabular-nums}}
.chip{{display:inline-block;padding:1px 10px;border-radius:999px;font-size:11.5px;font-weight:700}}
.high{{background:#fbe3e3;color:#8f1d1d}} .med{{background:#fdf0d7;color:#8a5a00}} .low{{background:#e2f2e4;color:#1c5c2a}}
.note{{background:#f6f4ec;border-left:3px solid #b9b29e;padding:10px 14px;margin:16px 0;font-size:12.5px}}
.sig{{margin-top:30px;color:#6d675a;font-size:12px;border-top:1px solid #d9d5ca;padding-top:12px}}
</style></head><body><div class='page'>
<h1>{title}</h1><div class='sub'>{subtitle}</div>
{body}
<div class='sig'>Prepared for review &middot; draft work product</div>
</div></body></html>"""


# ---------------------------------------------------------------------------
# Contract redline
# ---------------------------------------------------------------------------

_CLAUSE_TEXT = {
    "Term": ("The obligations herein shall continue for a period of {bad}.",
             "five (5) years from the date of disclosure", "two (2) years from the date of disclosure"),
    "Definition": ("“Confidential Information” means {bad}.",
                   "any and all information related to the Disclosing Party's business",
                   "information that is marked confidential or would reasonably be understood to be confidential"),
    "Carve-outs": ("Confidential Information shall not include information that {bad}.",
                   "is or becomes publicly available through no fault of the Receiving Party",
                   "is or becomes publicly available through no fault of the Receiving Party, was lawfully known prior to disclosure, or is independently developed without use of Confidential Information"),
    "Remedies": ("{bad} shall be entitled to seek injunctive relief for any breach hereof.",
                 "The Disclosing Party", "Either party"),
    "Non-solicit": ("For {bad}, neither party shall solicit for employment any employee of the other party.",
                    "two (2) years following termination, any employee",
                    "one (1) year following termination, any senior employee with whom it had material contact, except through general solicitations"),
    "Residuals": ("Each party {bad} retained in the unaided memory of its personnel.",
                  "shall be free to use any information, including technical specifications,",
                  "may use general know-how (excluding technical specifications and identified trade secrets)"),
    "Return": ("Upon termination, the Receiving Party shall {bad}.",
               "have no obligation with respect to materials received",
               "return or destroy all Confidential Information within thirty (30) days and certify the same in writing"),
    "IP Assignment": ("All work product and intellectual property {bad}.",
                      "conceived by the Receiving Party during the term is hereby assigned to the Disclosing Party",
                      "matters are governed exclusively by the Master Services Agreement; nothing herein effects any assignment"),
    "Publicity": ("The Receiving Party {bad} reference the existence of this engagement.",
                  "may publicly", "shall not, without prior written consent,"),
}


def _redline(scenario: dict, q: float, rng: random.Random) -> str:
    parties = scenario.get("parties", {"disclosing": "Party A", "receiving": "Party B"})
    issues = scenario.get("issues", [])
    n_fix = 4 if q >= 0.82 else 3 if q >= 0.62 else 2
    fixed = set(rng.sample(range(len(issues)), min(n_fix, len(issues))))

    rows = []
    for i, issue in enumerate(issues):
        tmpl, bad, good = _CLAUSE_TEXT.get(issue["clause"], ("{bad}", issue["problem"], issue["fix"]))
        if i in fixed:
            body = tmpl.format(bad=f"<del>{bad}</del> <ins>{good}</ins>")
        else:
            body = tmpl.format(bad=bad)  # missed issue — left standing
        rows.append(f"<h2>{i + 1}. {issue['clause']}</h2><p>{body}</p>")

    caught = [issues[i]["clause"] for i in sorted(fixed)]
    if q >= 0.82:
        note = f"Turned {len(caught)} provisions to our standard positions: {', '.join(caught)}. Balance of the agreement is acceptable as drafted."
    elif q >= 0.62:
        note = f"Key changes: {', '.join(caught)}. Recommend accepting remaining terms to keep momentum."
    else:
        note = "Made the edits shown above. Document otherwise looks standard."
    body = f"<div class='note'><b>Cover note:</b> {note}</div>" + "".join(rows)
    return _doc("Mutual Nondisclosure Agreement — Redline",
                f"{parties['disclosing']} · {parties['receiving']}", body, rng)


def _broken_redline(scenario: dict, rng: random.Random) -> str:
    parties = scenario.get("parties", {"disclosing": "Party A", "receiving": "Party B"})
    issues = scenario.get("issues", [])
    rows = []
    for i, issue in enumerate(issues):
        tmpl, bad, good = _CLAUSE_TEXT.get(issue["clause"], ("{bad}", issue["problem"], issue["fix"]))
        if i == 0:
            # "Fixes" the term by making it worse.
            rows.append(f"<h2>{i + 1}. {issue['clause']}</h2><p>{tmpl.format(bad=f'<del>{bad}</del> <ins>ten (10) years from the date of disclosure</ins>')}</p>")
        elif i == 1:
            rows.append(f"<h2>{i + 1}. {issue['clause']}</h2><p>{tmpl.format(bad=bad)}</p>")
        else:
            rows.append(f"<h2>{i + 1}. {issue['clause']}</h2><p>{tmpl.format(bad=bad)}</p>")
    # Swapped-party edit + deletes the confidentiality obligation.
    swap = (f"<h2>{len(issues) + 1}. Obligations</h2><p><del>The Receiving Party shall protect the Disclosing Party's "
            f"Confidential Information with reasonable care.</del> <ins>{parties['disclosing']} shall protect "
            f"{parties['receiving']}'s Confidential Information; {parties['receiving']} assumes no confidentiality "
            f"obligations hereunder.</ins></p>")
    note = "Streamlined the agreement and removed redundant obligations; extended the term for stability."
    body = f"<div class='note'><b>Cover note:</b> {note}</div>" + "".join(rows) + swap
    return _doc("Mutual Nondisclosure Agreement — Redline",
                f"{parties['disclosing']} · {parties['receiving']}", body, rng)


# ---------------------------------------------------------------------------
# Clause risk review
# ---------------------------------------------------------------------------

_RISK_ORDER = ["Low", "Medium", "High"]


def _chip(level: str) -> str:
    return f"<span class='chip {level.lower()[:4] if level != 'Medium' else 'med'}'>{level}</span>"


def _clause_risk(scenario: dict, q: float, rng: random.Random) -> str:
    clauses = scenario.get("clauses", [])
    n_right = len(clauses) if q >= 0.82 else len(clauses) - 1 if q >= 0.62 else len(clauses) - 2
    right = set(rng.sample(range(len(clauses)), max(n_right, 0)))
    rows = []
    for i, c in enumerate(clauses):
        if i in right:
            level = c["true_risk"]
            rationale = c["why"] if q >= 0.62 else "Terms diverge from customer-standard positions."
        else:
            idx = _RISK_ORDER.index(c["true_risk"])
            level = _RISK_ORDER[max(0, min(2, idx + rng.choice([-1, 1])))]
            rationale = "Language appears within market norms." if level == "Low" else "Some exposure; monitor in negotiation."
        rows.append(f"<tr><td><b>{c['name']}</b><br><span style='color:#6d675a;font-size:12px'>&ldquo;{c['text'][:110]}…&rdquo;</span></td>"
                    f"<td>{_chip(level)}</td><td>{rationale}</td></tr>")
    summary = ("Push hardest on the High items before signature; Medium items are calendar/negotiation issues."
               if q >= 0.62 else "Overall the agreement is broadly acceptable with minor negotiation points.")
    body = (f"<div class='note'><b>Summary:</b> {summary}</div>"
            f"<table><tr><th style='width:45%'>Clause</th><th>Risk</th><th>Rationale</th></tr>{''.join(rows)}</table>")
    return _doc("Clause Risk Review", scenario.get("title", "Contract review"), body, rng)


def _broken_clause_risk(scenario: dict, rng: random.Random) -> str:
    clauses = scenario.get("clauses", [])
    rows = []
    names = [c["name"] for c in clauses]
    swapped = names[1:] + names[:1]  # misattributed clause names
    for i, c in enumerate(clauses):
        level = "Low" if c["true_risk"] == "High" else "High" if c["true_risk"] == "Low" else "Medium"
        rationale = ("Standard boilerplate; no action needed." if level == "Low"
                     else "Unusual drafting; recommend striking entirely.")
        rows.append(f"<tr><td><b>{swapped[i]}</b><br><span style='color:#6d675a;font-size:12px'>&ldquo;{c['text'][:110]}…&rdquo;</span></td>"
                    f"<td>{_chip(level)}</td><td>{rationale}</td></tr>")
    body = ("<div class='note'><b>Summary:</b> Agreement is customer-favorable as drafted; recommend signing without changes.</div>"
            f"<table><tr><th style='width:45%'>Clause</th><th>Risk</th><th>Rationale</th></tr>{''.join(rows)}</table>")
    return _doc("Clause Risk Review", scenario.get("title", "Contract review"), body, rng)


# ---------------------------------------------------------------------------
# Journal entries
# ---------------------------------------------------------------------------

def _fmt(n: float) -> str:
    return f"{n:,.0f}" if n else ""


def _je_table(desc: str, lines: list[tuple[str, float, float]], memo: str) -> str:
    rows = "".join(
        f"<tr><td style='{'padding-left:28px' if dr == 0 else ''}'>{acct}</td>"
        f"<td class='num'>{_fmt(dr)}</td><td class='num'>{_fmt(cr)}</td></tr>"
        for acct, dr, cr in lines
    )
    total_dr = sum(l[1] for l in lines)
    total_cr = sum(l[2] for l in lines)
    return (f"<h2>{desc}</h2><table><tr><th>Account</th><th style='width:110px'>Debit</th><th style='width:110px'>Credit</th></tr>"
            f"{rows}<tr><td style='background:#f4f1e8'><b>Totals</b></td><td class='num' style='background:#f4f1e8'><b>{_fmt(total_dr)}</b></td>"
            f"<td class='num' style='background:#f4f1e8'><b>{_fmt(total_cr)}</b></td></tr></table>"
            f"<p style='color:#6d675a;font-size:12.5px'><i>Memo:</i> {memo}</p>")


def _journal_entry(scenario: dict, q: float, rng: random.Random) -> str:
    entries = scenario.get("entries", [])
    parts = []
    for i, e in enumerate(entries):
        lines = [list(l) for l in e["lines"]]
        if q < 0.62 and i == 0:
            # Conceptual miss: books to the wrong account (still balanced).
            wrong = scenario.get("wrong_account", "Miscellaneous Expense")
            worst = max(range(len(lines)), key=lambda j: lines[j][2])
            lines[worst][0] = wrong
        memo = (f"{e['desc']} per supporting schedule; reviewed against policy." if q >= 0.82
                else e["desc"] if q >= 0.62 else "As discussed.")
        parts.append(_je_table(e["desc"], [tuple(l) for l in lines], memo))
        if q < 0.82 and q >= 0.62 and len(entries) > 1 and i == 0 and rng.random() < 0.5:
            parts.append("<div class='note'>Second entry to be recorded at period close.</div>")
            break
    body = "".join(parts)
    return _doc("Journal Entries", scenario.get("title", "Proposed entries"), body, rng)


def _broken_journal_entry(scenario: dict, rng: random.Random) -> str:
    entries = scenario.get("entries", [])
    e = entries[0]
    lines = [list(l) for l in e["lines"]]
    # Flip debit/credit on the first line and fat-finger an amount: unbalanced AND backwards.
    lines[0][1], lines[0][2] = lines[0][2], lines[0][1]
    big = max(range(len(lines)), key=lambda j: lines[j][1] + lines[j][2])
    if lines[big][1]:
        lines[big][1] = round(lines[big][1] / 10)
    else:
        lines[big][2] = round(lines[big][2] / 10)
    body = _je_table(e["desc"], [tuple(l) for l in lines], "Recorded as instructed.")
    body += "<div class='note'>All entries verified and in balance.</div>"
    return _doc("Journal Entries", scenario.get("title", "Proposed entries"), body, rng)


# ---------------------------------------------------------------------------
# Chart-of-accounts mapping
# ---------------------------------------------------------------------------

def _coa_mapping(scenario: dict, q: float, rng: random.Random) -> str:
    legacy = scenario.get("legacy", [])
    target = scenario.get("target_coa", [])
    n_right = len(legacy) if q >= 0.85 else len(legacy) - rng.randint(1, 2) if q >= 0.62 else len(legacy) - rng.randint(3, 4)
    right = set(rng.sample(range(len(legacy)), max(n_right, 0)))
    rows = []
    for i, acct in enumerate(legacy):
        if i in right:
            mapped = acct["correct"]
            conf = "High" if q >= 0.62 else "Medium"
        else:
            wrong_pool = [t for t in target if t != acct["correct"]]
            mapped = rng.choice(wrong_pool)
            conf = "Medium"
        conf_cls = "low" if conf == "High" else "med"  # green chip for high confidence
        rows.append(f"<tr><td><b>{acct['code']}</b><br><span style='color:#6d675a;font-size:12px'>{acct['name']}</span></td>"
                    f"<td>{mapped}</td><td><span class='chip {conf_cls}'>{conf}</span></td></tr>")
    note = ("Mappings validated against account type and normal balance; exceptions flagged for controller sign-off."
            if q >= 0.82 else "Mappings drafted from account names; recommend spot-checking balances at cutover.")
    body = (f"<div class='note'><b>Approach:</b> {note}</div>"
            f"<table><tr><th style='width:38%'>Legacy account</th><th>Maps to</th><th style='width:110px'>Confidence</th></tr>{''.join(rows)}</table>")
    return _doc("Chart of Accounts Mapping", scenario.get("title", "Migration mapping"), body, rng)


def _broken_coa_mapping(scenario: dict, rng: random.Random) -> str:
    legacy = scenario.get("legacy", [])
    target = scenario.get("target_coa", [])
    absurd = {
        "1000": "4000", "1100": "2000", "2000": "1500", "4000": "1000",
    }
    rows = []
    for i, acct in enumerate(legacy):
        correct = acct["correct"]
        prefix = correct.split(" ")[0][:4]
        if prefix in absurd:
            mapped = next((t for t in target if t.startswith(absurd[prefix])), target[0])
        elif i % 3 == 0:
            mapped = rng.choice([t for t in target if t != correct])
        else:
            mapped = correct
        rows.append(f"<tr><td><b>{acct['code']}</b><br><span style='color:#6d675a;font-size:12px'>{acct['name']}</span></td>"
                    f"<td>{mapped}</td><td>High</td></tr>")
    body = ("<div class='note'><b>Approach:</b> Automated mapping complete; all accounts matched with high confidence, no review required.</div>"
            f"<table><tr><th style='width:38%'>Legacy account</th><th>Maps to</th><th style='width:110px'>Confidence</th></tr>{''.join(rows)}</table>")
    return _doc("Chart of Accounts Mapping", scenario.get("title", "Migration mapping"), body, rng)
