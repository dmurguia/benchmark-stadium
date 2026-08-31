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
    "website": (
        "You are competing in a blind design arena. Produce a single self-contained HTML file "
        "(inline CSS/JS, no external requests) implementing the user's website request. "
        "Prioritize visual hierarchy, typography, and polish. Return ONLY the HTML."
    ),
    "ui-component": (
        "Produce a single self-contained HTML file showcasing the requested UI component, centered "
        "on a neutral page, production-quality craft. Return ONLY the HTML."
    ),
    "dataviz": (
        "Produce a single self-contained HTML file with the requested data visualization rendered as "
        "inline SVG or canvas, with clear axes/labels. Invent plausible data if none given. Return ONLY the HTML."
    ),
    "game": (
        "Produce a single self-contained HTML file with a playable browser mini-game per the request "
        "(keyboard or mouse controls, score, restart). Return ONLY the HTML."
    ),
    "svg-logo": (
        "Produce a single self-contained HTML file that displays the requested logo as inline SVG on a "
        "clean backdrop, plus a small dark/light preview strip. Return ONLY the HTML."
    ),
    "ascii-art": (
        "Produce a single self-contained HTML file that displays the requested ASCII art in a <pre> block, "
        "terminal-styled. Return ONLY the HTML."
    ),
}


class GenerationProvider(Protocol):
    async def generate(self, model: ArenaModel, prompt: str, category: str) -> GenerationResult: ...
