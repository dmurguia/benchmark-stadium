from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from ...models import ArenaModel


class ProviderNotConfigured(Exception):
    """Raised when a live provider is selected but its API key is a placeholder."""


@dataclass
class GenerationResult:
    html: str
    latency_ms: int = 0


CATEGORY_SYSTEM_PROMPTS: dict[str, str] = {
    "contract-redline": (
        "You are a senior associate competing in a blind professional-work arena. Produce a single "
        "self-contained HTML document: a redline of the described NDA using <del>/<ins> markup, with a "
        "short cover note summarizing your changes. Represent the instructing party's interests. "
        "Return ONLY the HTML."
    ),
    "clause-risk": (
        "Produce a single self-contained HTML document: a clause-by-clause risk review table "
        "(clause, High/Medium/Low rating, rationale, recommended pushback) for the described contract, "
        "from the instructing party's perspective, plus a two-sentence summary. Return ONLY the HTML."
    ),
    "journal-entry": (
        "You are a senior accountant. Produce a single self-contained HTML document with properly "
        "formatted journal entries (account, debit, credit columns; balanced totals; memos) for the "
        "described transaction under US GAAP. Return ONLY the HTML."
    ),
    "coa-mapping": (
        "Produce a single self-contained HTML document: a migration mapping table from the described "
        "legacy general-ledger accounts to the target chart of accounts, with a confidence column and "
        "a short note on approach. Return ONLY the HTML."
    ),
}


class GenerationProvider(Protocol):
    async def generate(
        self, model: ArenaModel, prompt: str, category: str, scenario: dict | None = None
    ) -> GenerationResult: ...
