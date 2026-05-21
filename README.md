# KindaSeen

> Track everything you've watched — movies, varieties, dramas, anime, manga, and more.  
> Never lose track of where you left off again.

🔗 [KindaSeen Website](https://kindaseen.vercel.app)

## Structure

```
KindaSeen/
├── apps/
│   ├── web/          # Next.js (port 3000)
│   └── api/          # FastAPI (port 8000)
└── packages/
    └── shared/       # Shared types
```

## Development

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

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start both frontend and backend

```bash
# Run from root
pnpm dev
```

Next.js：http://localhost:3000  
FastAPI：http://localhost:8000  
API Doc：http://localhost:8000/docs

## Tech Stack

- **FrontEnd**: Next.js 16, TypeScript
- **BackEnd**: FastAPI, SQLAlchemy (async), Alembic
- **Database**: Supabase (PostgreSQL)
- **Search**: TMDB API
- **AI**: OpenAI Embeddings（planned）

## Deployment

- Frontend: Vercel
- Backend: Docker, Render
