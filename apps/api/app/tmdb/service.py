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

MOVIE_GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    53: "Thriller",
    10752: "War",
    37: "Western",
}

TV_GENRE_MAP = {
    10759: "Action & Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western",
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
    release_year: int | None


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
        genre_map = MOVIE_GENRE_MAP if kind == "movie" else TV_GENRE_MAP
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
                genres=[genre_map[gid] for gid in item.get("genre_ids", []) if gid in genre_map],
                release_year=int(date[:4]) if len(date) >= 4 else None,
            )
        )

    return results
