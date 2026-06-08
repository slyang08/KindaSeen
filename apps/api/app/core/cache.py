# apps/api/app/core/cache.py
import json
import logging
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
    return _redis


async def cache_ping() -> bool:
    try:
        await get_redis().ping()
        return True
    except Exception:
        return False


async def cache_get(key: str) -> Any | None:
    try:
        value = await get_redis().get(key)
        return json.loads(value) if value else None
    except Exception:
        logger.warning("cache_get failed for key=%s", key)
        return None


async def cache_set(key: str, value: Any, ttl: int) -> None:
    try:
        await get_redis().set(key, json.dumps(value), ex=ttl)
    except Exception:
        logger.warning("cache_set failed for key=%s", key)


async def cache_delete(key: str) -> None:
    try:
        await get_redis().delete(key)
    except Exception:
        logger.warning("cache_delete failed for key=%s", key)
