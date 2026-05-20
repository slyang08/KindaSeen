# apps/api/app/tmdb/service.py
from dataclasses import dataclass

import httpx

from app.core.config import settings

TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

HEADERS = {
    "Authorization": f"Bearer {settings.tmdb_api_token}",
    "accept": "application/json",
}


@dataclass
class TMDBResult:
    tmdb_id: int
    title: str
    media_type: str  # "movie" | "tv"
    poster_url: str | None
    overview: str
    tmdb_rating: float | None
    genres: list[str]
    release_year: str | None


async def search_tmdb(query: str, media_type: str | None = None) -> list[TMDBResult]:
    """
    media_type: "movie" | "tv" | None (None = multi search)
    """
    if media_type == "movie":
        url = f"{TMDB_BASE}/search/movie"
    elif media_type == "tv":
        url = f"{TMDB_BASE}/search/tv"
    else:
        url = f"{TMDB_BASE}/search/multi"

    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=HEADERS, params={"query": query, "language": "zh-TW"})
        resp.raise_for_status()
        data = resp.json()

    results = []
    for item in data.get("results", [])[:10]:
        kind = item.get("media_type", media_type or "movie")
        if kind not in ("movie", "tv"):
            continue

        title = item.get("title") or item.get("name") or ""
        poster = item.get("poster_path")
        date = item.get("release_date") or item.get("first_air_date") or ""

        results.append(
            TMDBResult(
                tmdb_id=item["id"],
                title=title,
                media_type=kind,
                poster_url=f"{TMDB_IMAGE_BASE}{poster}" if poster else None,
                overview=item.get("overview") or "",
                tmdb_rating=round(item["vote_average"], 1) if item.get("vote_average") else None,
                genres=[],  # genre_ids only has id, which needs to be checked separately; leave it blank first and can be expanded later.
                release_year=date[:4] if date else None,
            )
        )

    return results
