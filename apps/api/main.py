# apps/api/main.py
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import init_db
from app.health.router import router as health_router
from app.records.router import router as records_router

logger = logging.getLogger(__name__)

app = FastAPI(title="KindaSeen API", version="1.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://kindaseen.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()
    logger.info("Database connected and tables created")


app.include_router(records_router)
app.include_router(health_router)


@app.get("/")
def root():
    return {"message": "KindaSeen API is running"}
