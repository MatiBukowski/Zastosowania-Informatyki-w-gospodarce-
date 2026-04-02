from fastapi import FastAPI, APIRouter
from contextlib import asynccontextmanager
from src.config import settings
from src.services import run_seed
from src.controllers.health import router as health_router
from src.controllers.restaurant import router as restaurant_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    if settings.SEED_DATA:
        print("Seeding data...")
        run_seed()
    yield

app = FastAPI(
    title="Restaurant Ordering API",
    lifespan=lifespan,
    version="0.1.0",
    openapi_url="/api/swagger.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)
prefix_router = APIRouter(prefix="/api")

prefix_router.include_router(health_router)
prefix_router.include_router(restaurant_router)
app.include_router(prefix_router)
