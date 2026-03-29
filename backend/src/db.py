from sqlalchemy import create_engine
from sqlalchemy.orm import Session, DeclarativeBase
from .config import settings

engine = create_engine(
    settings.database_url,
    echo=settings.POSTGRES_ECHO,
)


class Base(DeclarativeBase):
    pass


def get_session():
    with Session(engine) as session:
        yield session
