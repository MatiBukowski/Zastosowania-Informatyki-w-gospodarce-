import os
from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.db import create_db_and_tables
from src.controllers.health import router as health_router
from src.controllers.restaurant import router as restaurant_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    create_db_and_tables()
    print("Database and tables created!")
    yield

app = FastAPI(title="Restaurant Ordering API", lifespan=lifespan)

app.include_router(health_router)
app.include_router(restaurant_router)
