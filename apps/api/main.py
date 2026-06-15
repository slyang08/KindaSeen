# apps/api/main.py
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.activity.router import router as activity_router
from app.core.database import init_db
from app.favorites.router import router as favorite_router
from app.health.router import router as health_router
from app.records.router import router as records_router
from app.reviews.router import router as reviews_router
from app.social.router import router as social_router
from app.tmdb.router import router as tmdb_router
from app.users.router import router as users_router
from app.users.stats_router import router as stats_router

logger = logging.getLogger(__name__)

app = FastAPI(title="KindaSeen API", version="1.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://kindaseen.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()
    logger.info("Database connected and tables created")


app.include_router(activity_router)
app.include_router(favorite_router)
app.include_router(health_router)
app.include_router(records_router)
app.include_router(reviews_router)
app.include_router(social_router)
app.include_router(tmdb_router)
app.include_router(users_router)
app.include_router(stats_router)


@app.get("/")
def root():
    return {"message": "KindaSeen API is running"}
