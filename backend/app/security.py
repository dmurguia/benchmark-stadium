"""Stdlib-only session tokens (HMAC-SHA256, JWT-shaped) and login-code helpers.

We deliberately avoid pyjwt/cryptography so the app has zero native deps.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from .config import get_settings


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def sign_session(user_id: int, ttl_seconds: int | None = None) -> str:
    settings = get_settings()
    payload = {
        "sub": user_id,
        "exp": int(time.time()) + (ttl_seconds or settings.session_ttl_seconds),
    }
    body = _b64(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(settings.secret_key.encode(), body.encode(), hashlib.sha256).digest()
    return f"{body}.{_b64(sig)}"


def verify_session(token: str) -> dict[str, Any] | None:
    settings = get_settings()
    try:
        body, sig = token.split(".", 1)
        expected = hmac.new(settings.secret_key.encode(), body.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(expected, _unb64(sig)):
            return None
        payload = json.loads(_unb64(body))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def generate_login_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"
