# apps/api/app/core/auth.py
import uuid

import httpx
import jwt
from cachetools import TTLCache
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

security = HTTPBearer()

_jwks_cache: TTLCache = TTLCache(maxsize=1, ttl=3600)


def get_jwks() -> dict:
    if "jwks" in _jwks_cache:
        return _jwks_cache["jwks"]

    url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    with httpx.Client() as client:
        response = client.get(url)
        response.raise_for_status()
        jwks = response.json()
        _jwks_cache["jwks"] = jwks
        return jwks


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> uuid.UUID:
    token = credentials.credentials

    try:
        jwks = get_jwks()
        public_keys = jwks.get("keys", [])

        header = jwt.get_unverified_header(token)
        key = next((k for k in public_keys if k["kid"] == header.get("kid")), None)

        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token key"
            )

        public_key = jwt.algorithms.ECAlgorithm.from_jwk(key)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["ES256"],
            audience="authenticated",
        )

        return uuid.UUID(payload["sub"])

    except jwt.ExpiredSignatureError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired"
        ) from err
    except jwt.InvalidTokenError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        ) from err


async def get_optional_user_id(
    authorization: str | None = Header(None),
) -> uuid.UUID | None:
    if not authorization:
        return None
    try:
        return await get_current_user_id(authorization=authorization)
    except Exception:
        return None
