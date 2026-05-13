# KindaSeen

Keep track of the videos you've watched — you'll never forget them again.

## Structure

```
KindaSeen/
├── apps/
│   ├── web/          # Next.js (port 3000)
│   └── api/          # FastAPI (port 8000)
└── packages/         # Shared
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

### 3. Starts both frontend and backend

```bash
# Execute in root
pnpm dev
```

Next.js：http://localhost:3000
FastAPI：http://localhost:8000
API Doc：http://localhost:8000/docs

## Tech Stack

- **FrontEnd**: Next.js 15, TypeScript
- **BackEnd**: FastAPI, SQLAlchemy (async), Alembic
- **Database**: PostgreSQL + pgvector
- **AI**: OpenAI Embeddings（Planning）
- **Video Searching**: TMDB API（Planning）
