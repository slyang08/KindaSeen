# apps/api/app/core/database.py
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    from app.favorites import model as favorites_model  # noqa: F401
    from app.favorites import share_model  # noqa: F401
    from app.records import model as records_model  # noqa: F401
    from app.users import model as users_model  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
