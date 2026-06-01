# apps/api/app/core/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    supabase_url: str
    supabase_anon_key: str
    supabase_webhook_secret: str
    tmdb_api_token: str
    base_url: str

    model_config = {"env_file": ".env"}


settings = Settings()
