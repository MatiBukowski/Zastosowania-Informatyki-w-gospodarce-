import pytest
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient
from main import app
from src.db import Base, get_session


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

def get_test_db():
     with Session(test_engine) as session:
        yield session

@pytest.fixture
def db():
    Base.metadata.create_all(bind=test_engine)

    with Session(test_engine) as session:
        yield session

    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def client(db):
    app.dependency_overrides[get_session] = get_test_db

    client = TestClient(app)
    yield client

    app.dependency_overrides.clear()
