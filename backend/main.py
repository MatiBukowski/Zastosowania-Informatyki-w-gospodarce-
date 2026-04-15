from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
from posthog import Posthog

from src.config import settings
from src.services import run_seed
from src.controllers import (
    health_router,
    restaurant_router,
    table_router
)

posthog = Posthog(settings.POSTHOG_API_KEY, host=settings.POSTHOG_HOST)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    if settings.SEED_DATA:
        print("Seeding data...")
        run_seed()
    yield
    posthog.shutdown()

app = FastAPI(
    title="Restaurant Ordering API",
    lifespan=lifespan,
    version="0.1.0",
    openapi_url="/api/swagger.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def posthog_middleware(request: Request, call_next):
    response = await call_next(request)
    distinct_id = request.headers.get("x-posthog-distinct-id", "anonymous")
    posthog.capture(
        "$pageview",
        distinct_id=distinct_id,
        properties={
            "$current_url": str(request.url),
            "method": request.method,
            "status_code": response.status_code,
        },
    )
    return response

@app.exception_handler(Exception)
async def http_exception_handler(request, exc):
    posthog.capture_exception(exc)
    return JSONResponse(status_code=500, content={'message': str(exc)})

prefix_router = APIRouter(prefix="/api")

prefix_router.include_router(health_router)
prefix_router.include_router(restaurant_router)
prefix_router.include_router(table_router)
app.include_router(prefix_router)
