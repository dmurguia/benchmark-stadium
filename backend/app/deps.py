from __future__ import annotations

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .security import verify_session

SESSION_COOKIE = "da_session"


def _token_from_request(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.removeprefix("Bearer ").strip()
    return request.cookies.get(SESSION_COOKIE)


def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> User | None:
    token = _token_from_request(request)
    if not token:
        return None
    payload = verify_session(token)
    if not payload:
        return None
    return db.get(User, payload.get("sub"))


def get_current_user(user: User | None = Depends(get_current_user_optional)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    return user
