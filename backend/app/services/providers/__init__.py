from __future__ import annotations

from ...config import get_settings
from ...models import ArenaModel
from .base import GenerationProvider, GenerationResult, ProviderNotConfigured
from .live import AnthropicProvider, GoogleProvider, OpenAIProvider, OpenRouterProvider
from .sample import SampleProvider

__all__ = [
    "GenerationProvider",
    "GenerationResult",
    "ProviderNotConfigured",
    "get_provider_for",
]

_sample = SampleProvider()
_live: dict[str, GenerationProvider] = {
    "anthropic": AnthropicProvider(),
    "openai": OpenAIProvider(),
    "google": GoogleProvider(),
    "openrouter": OpenRouterProvider(),
}


def get_provider_for(model: ArenaModel) -> GenerationProvider:
    """Route a model to its execution provider.

    In `sample` mode (default) everything goes to the offline sample provider;
    in `live` mode each model routes by its `provider` column, falling back to
    OpenRouter for anything without a first-party adapter.
    """
    if get_settings().generation_mode != "live":
        return _sample
    return _live.get(model.provider, _live["openrouter"])
