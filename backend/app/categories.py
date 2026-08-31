"""Verticals and task types (v2 pivot: professional work arena).

Two launch verticals — Legal and Finance/ERP — chosen because their work is
expert-judged, high-stakes, and document-shaped: exactly where crowd arenas
can't follow. Each category is a *task type* whose outputs a professional can
judge in 2–5 minutes.
"""
from __future__ import annotations

VERTICALS: dict[str, dict[str, str]] = {
    "legal": {
        "name": "Legal",
        "icon": "⚖️",
        "blurb": "Contract work judged the way a supervising partner would.",
    },
    "finance": {
        "name": "Finance / ERP",
        "icon": "🧾",
        "blurb": "Accounting operations judged the way a controller would.",
    },
}

CATEGORIES: dict[str, dict[str, str]] = {
    "contract-redline": {
        "vertical": "legal",
        "name": "Contract Redline",
        "blurb": "Markups of an NDA against standard positions — judged on issues caught and edit quality.",
    },
    "clause-risk": {
        "vertical": "legal",
        "name": "Clause Risk Review",
        "blurb": "Risk assessment of contract clauses — judged on ratings and rationale.",
    },
    "journal-entry": {
        "vertical": "finance",
        "name": "Journal Entries",
        "blurb": "Entries for a described transaction — judged on accounts, balance, and memos.",
    },
    "coa-mapping": {
        "vertical": "finance",
        "name": "Account Mapping",
        "blurb": "Legacy chart-of-accounts mapped to a new one — judged on mapping accuracy.",
    },
}

OVERALL = "overall"


def is_valid_category(slug: str) -> bool:
    return slug in CATEGORIES


def categories_for(vertical: str) -> list[str]:
    return [slug for slug, c in CATEGORIES.items() if c["vertical"] == vertical]
