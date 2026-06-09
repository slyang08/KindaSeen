# apps/api/app/core/celery.py
import ssl

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

ssl_options = {
    "ssl_cert_reqs": ssl.CERT_NONE,
}


celery_app = Celery(
    "kindaseen",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.tmdb_sync",
        "app.tasks.cleanup",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    broker_use_ssl=ssl_options,
    redis_backend_use_ssl=ssl_options,
)

celery_app.conf.beat_schedule = {
    "tmdb-sync-daily": {
        "task": "app.tasks.tmdb_sync.sync_all_records",
        "schedule": crontab(hour=3, minute=0),  # 3:00 AM UTC daily
    },
}
