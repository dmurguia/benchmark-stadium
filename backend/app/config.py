"""Application configuration.

Every value can be overridden via environment variables. Placeholder values are
clearly marked so real credentials can be swapped in later (see .env.example).
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings:
    def __init__(self) -> None:
        self.app_name = "Benchmark Stadium"
        # SQLite by default so the app runs with zero infra; swap for Postgres
        # by setting DESIGNARENA_DATABASE_URL=postgresql+psycopg://...
        self.database_url = os.getenv(
            "DESIGNARENA_DATABASE_URL",
            f"sqlite:///{BACKEND_DIR / 'designarena.db'}",
        )
        # Session token signing secret. PLACEHOLDER — set a real secret in prod.
        self.secret_key = os.getenv("DESIGNARENA_SECRET_KEY", "dev-secret-change-me")
        self.session_ttl_seconds = int(os.getenv("DESIGNARENA_SESSION_TTL", str(60 * 60 * 24 * 30)))

        # Generation mode:
        #   sample — offline, deterministic-but-varied designs (default; no keys needed)
        #   live   — route each arena model to its provider adapter (requires API keys)
        self.generation_mode = os.getenv("DESIGNARENA_GENERATION_MODE", "sample")

        # PLACEHOLDER credentials for live providers. The adapters read these and
        # fail with a clear message until real keys are supplied.
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY", "PLACEHOLDER_ANTHROPIC_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "PLACEHOLDER_OPENAI_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_API_KEY", "PLACEHOLDER_GOOGLE_API_KEY")
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "PLACEHOLDER_OPENROUTER_API_KEY")

        # PLACEHOLDER for a transactional email provider (magic-link/code emails).
        # In dev mode the login code is returned directly in the API response.
        self.email_provider_api_key = os.getenv("EMAIL_PROVIDER_API_KEY", "PLACEHOLDER_RESEND_OR_SENDGRID_KEY")
        self.dev_return_login_code = os.getenv("DESIGNARENA_DEV_LOGIN_CODE", "1") == "1"

        # How many models compete per battle (the tournament bracket assumes 4).
        self.models_per_battle = 4

        # Bootstrap resamples for leaderboard confidence intervals.
        self.ci_bootstrap_rounds = int(os.getenv("DESIGNARENA_CI_ROUNDS", "40"))

        # Behavioral floor: votes decided faster than this many ms are recorded
        # but excluded from published boards.
        self.min_decision_ms = int(os.getenv("DESIGNARENA_MIN_DECISION_MS", "4000"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
