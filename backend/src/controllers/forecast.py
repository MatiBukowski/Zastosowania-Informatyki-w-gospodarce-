from fastapi import APIRouter
from ..services.forecast import ForecastService

router = APIRouter(tags=["Forecast"])


@router.get(
    "/forecast",
    summary="Forecast",
    description=""
)
def health() -> dict:
    return ForecastService().get_forecast()
