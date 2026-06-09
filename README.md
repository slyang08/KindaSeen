# KindaSeen

> Track everything you've watched — movies, varieties, dramas, anime, manga, and more.  
> Never lose track of where you left off again.

🔗 [KindaSeen Website](https://kindaseen.vercel.app)

A full-stack media tracking app built as a portfolio project to explore modern web architecture — featuring TMDB integration, optimistic UI, and a shareable Favorites system.

## Features

- **Media Tracking** — Add, edit, and soft-delete records across movies, varieties, dramas, anime, manga, and more
- **TMDB Search** — Search and auto-fill metadata (poster, title, genre) via a proxied TMDB API
- **Favorites & Sharing** — Curate a Favorites list with public profile links (`/u/{username}`) and private share tokens (`/share/p/{token}`)
- **Filter, Sort & Search** — Client-side filtering and sorting across all records
- **Statistics** — Visual breakdown of your watching habits with charts
- **Optimistic UI** — Instant feedback on record mutations with automatic rollback on failure
- **Trash & Restore** — Soft delete with a recoverable Trash page

## Tech Stack

| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| Frontend     | Next.js 16, React 19, TypeScript                 |
| UI           | shadcn/ui, Radix UI, Tailwind CSS v4             |
| State / Data | TanStack Query v5, React Hook Form, Zod          |
| Backend      | FastAPI, SQLAlchemy (async), Alembic             |
| Database     | Supabase (PostgreSQL)                            |
| Auth         | Supabase JWT (ES256 / JWKS via PyJWT)            |
| External API | TMDB API (proxied through FastAPI)               |
| Deployment   | Vercel (web), Render via Docker (API)            |
| CI/CD        | GitHub Actions → Docker Hub → Render deploy hook |
| Cache        | Redis (Upstash)                                  |
| Jobs         | Celery, Celery Beat                              |

## Architecture Highlights

- **Monorepo** — pnpm workspaces with `apps/web`, `apps/api`, `packages/shared`
- **Feature-based structure** — FastAPI backend organized by domain module (records, tmdb, favorites, auth), mirroring NestJS module patterns
- **TMDB proxy** — All TMDB requests routed through the FastAPI backend to protect the API token and enable future caching
- **Supabase JWT auth** — Token verified server-side via JWKS with TTLCache to avoid redundant key fetches
- **Optimistic mutations** — TanStack Query mutations update the cache immediately and roll back on API failure
- **pgvector groundwork** — DB schema prepared for future OpenAI embedding-based recommendations
- **Redis caching** — Two-tier cache strategy: TTL + event-based invalidation for user stats; TTL-only for TMDB search results (external API, no write hook)
- **Background jobs** — Celery worker for async task execution; Celery Beat for scheduled jobs (daily TMDB metadata sync); countdown tasks for deferred permanent deletion after soft delete

## Project Structure

```
KindaSeen/
├── apps/
│   ├── web/          # Next.js (port 3000)
│   └── api/          # FastAPI (port 8000)
└── packages/
    └── shared/       # Shared TypeScript types
```

## Local Development

### 1. Install Node dependencies

```bash
pnpm install
```

### 2. Set up Python environment

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment variables

```bash
# apps/api/.env
DATABASE_URL=your_supabase_db_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
TMDB_API_TOKEN=your_tmdb_bearer_token
REDIS_URL=your_upstash_redis_url

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start dev servers

\```bash

# Run from root

pnpm dev

# Run Celery worker (separate terminal, from apps/api)

celery -A app.core.celery worker --loglevel=info

# Run Celery Beat scheduler (separate terminal, from apps/api)

celery -A app.core.celery beat --loglevel=info
\```

| Service       | URL                        |
| ------------- | -------------------------- |
| Next.js       | http://localhost:3000      |
| FastAPI       | http://localhost:8000      |
| API Docs      | http://localhost:8000/docs |
| Celery Worker | (background process)       |
| Celery Beat   | (background process)       |

## Roadmap

- [x] Rating system with stats (avg score, distribution charts)
- [x] Review / comment system
- [ ] Infinite scroll & pagination
- [x] Redis caching — TTL + event-based invalidation for stats; TTL-only for TMDB search
- [x] Background jobs — Celery Beat for daily TMDB sync; countdown tasks for deferred deletion
- [ ] Recommendation engine (OpenAI embeddings + pgvector)
