from fastapi import FastAPI
from sqlmodel import Session, select

from src.db import create_db_and_tables, engine
from src.models import Restaurant

app = FastAPI(title="Restaurant Ordering API")


@app.on_event("startup")
def on_startup() -> None:
    print("Starting up...")
    create_db_and_tables()
    print("Database and tables created!")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/restaurants")
def get_restaurants():
    with Session(engine) as session:
        restaurants = session.exec(select(Restaurant)).all()
        return restaurants
