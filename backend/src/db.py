from sqlmodel import SQLModel, Session, create_engine
from .config import settings
from .models import *

engine = create_engine(
    settings.database_url,
    echo=settings.POSTGRES_ECHO,
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
