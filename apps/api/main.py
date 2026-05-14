# apps/api/main.py
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import init_db
from app.records.router import router as records_router

logger = logging.getLogger(__name__)

app = FastAPI(title="KindaSeen API", version="0.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()
    logger.info("Database connected and tables created")


app.include_router(records_router)


@app.get("/")
def root():
    return {"message": "KindaSeen API is running"}
