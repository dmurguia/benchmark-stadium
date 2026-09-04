"""Live provider adapters.

These implement the real vendor HTTP APIs via httpx, but every key defaults to a
PLACEHOLDER_* value (see app/config.py and .env.example). Until real keys are
swapped in, calling them raises ProviderNotConfigured with a clear message —
the app runs in `sample` generation mode by default so this never blocks the
core experience.

NOTE: exercised only against the documented API shapes, not real keys — verify
each adapter once credentials are added (DESIGNARENA_GENERATION_MODE=live).
"""
from __future__ import annotations

import re
import time

import httpx

from ...config import get_settings
from ...models import ArenaModel
from .base import CATEGORY_SYSTEM_PROMPTS, GenerationResult, ProviderNotConfigured

_HTML_FENCE = re.compile(r"```(?:html)?\s*(.*?)```", re.DOTALL)


def _extract_html(text: str) -> str:
    m = _HTML_FENCE.search(text)
    if m:
        return m.group(1).strip()
    return text.strip()


def _require_key(key: str, provider: str) -> str:
    if not key or key.startswith("PLACEHOLDER"):
        raise ProviderNotConfigured(
            f"{provider} API key is a placeholder. Set the real key in the environment "
            f"(see backend/.env.example) or keep DESIGNARENA_GENERATION_MODE=sample."
        )
    return key


def _user_prompt(prompt: str, category: str) -> str:
    return f"Category: {category}\nRequest: {prompt}"


class AnthropicProvider:
    async def generate(self, model: ArenaModel, prompt: str, category: str, scenario: dict | None = None) -> GenerationResult:
        key = _require_key(get_settings().anthropic_api_key, "Anthropic")
        start = time.monotonic()
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={"x-api-key": key, "anthropic-version": "2023-06-01"},
                json={
                    "model": model.provider_model_id or model.slug,
                    "max_tokens": 8192,
                    "system": CATEGORY_SYSTEM_PROMPTS.get(category, CATEGORY_SYSTEM_PROMPTS["website"]),
                    "messages": [{"role": "user", "content": _user_prompt(prompt, category)}],
                },
            )
            resp.raise_for_status()
            text = "".join(b.get("text", "") for b in resp.json().get("content", []))
        return GenerationResult(html=_extract_html(text), latency_ms=int((time.monotonic() - start) * 1000))


class OpenAIProvider:
    async def generate(self, model: ArenaModel, prompt: str, category: str, scenario: dict | None = None) -> GenerationResult:
        key = _require_key(get_settings().openai_api_key, "OpenAI")
        start = time.monotonic()
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "model": model.provider_model_id or model.slug,
                    "messages": [
                        {"role": "system", "content": CATEGORY_SYSTEM_PROMPTS.get(category, CATEGORY_SYSTEM_PROMPTS["website"])},
                        {"role": "user", "content": _user_prompt(prompt, category)},
                    ],
                },
            )
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
        return GenerationResult(html=_extract_html(text), latency_ms=int((time.monotonic() - start) * 1000))


class GoogleProvider:
    async def generate(self, model: ArenaModel, prompt: str, category: str, scenario: dict | None = None) -> GenerationResult:
        key = _require_key(get_settings().google_api_key, "Google")
        start = time.monotonic()
        model_id = model.provider_model_id or model.slug
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent",
                params={"key": key},
                json={
                    "systemInstruction": {"parts": [{"text": CATEGORY_SYSTEM_PROMPTS.get(category, CATEGORY_SYSTEM_PROMPTS["website"])}]},
                    "contents": [{"parts": [{"text": _user_prompt(prompt, category)}]}],
                },
            )
            resp.raise_for_status()
            text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        return GenerationResult(html=_extract_html(text), latency_ms=int((time.monotonic() - start) * 1000))


class OpenRouterProvider:
    """Catch-all for models without a first-party adapter (GLM, DeepSeek, Qwen, ...)."""

    async def generate(self, model: ArenaModel, prompt: str, category: str, scenario: dict | None = None) -> GenerationResult:
        key = _require_key(get_settings().openrouter_api_key, "OpenRouter")
        start = time.monotonic()
        async with httpx.AsyncClient(timeout=180) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}"},
                json={
                    "model": model.provider_model_id or model.slug,
                    "messages": [
                        {"role": "system", "content": CATEGORY_SYSTEM_PROMPTS.get(category, CATEGORY_SYSTEM_PROMPTS["website"])},
                        {"role": "user", "content": _user_prompt(prompt, category)},
                    ],
                },
            )
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
        return GenerationResult(html=_extract_html(text), latency_ms=int((time.monotonic() - start) * 1000))
