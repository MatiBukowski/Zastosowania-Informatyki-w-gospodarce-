from fastapi import FastAPI
from src.db import create_db_and_tables
from src.controllers.health import router as health_router
from src.controllers.restaurant import router as restaurant_router

app = FastAPI(title="Restaurant Ordering API")


@app.on_event("startup")
def on_startup() -> None:
    print("Starting up...")
    create_db_and_tables()
    print("Database and tables created!")


app.include_router(health_router)
app.include_router(restaurant_router)
