from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Health check",
    description="Check if the application is healthy"
)
def health() -> dict:
    return {"status": "ok"}
