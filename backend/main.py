from fastapi import FastAPI, APIRouter

from src.db import create_db_and_tables
from src.config import settings
from src.controllers.health import router as health_router
from src.controllers.restaurant import router as restaurant_router

app = FastAPI(title="Restaurant Ordering API")
prefix_router = APIRouter(prefix="" if settings.PROD_ENV else "/api")

@app.on_event("startup")
def on_startup() -> None:
    print("Starting up...")
    create_db_and_tables()
    print("Database and tables created!")


prefix_router.include_router(health_router)
prefix_router.include_router(restaurant_router)
app.include_router(prefix_router)