from fastapi import APIRouter, Depends, Request

from ..schemas import ForecastBase
from ..services.forecast import ForecastService
from ..security import RoleChecker
from ..models import UserRoleEnum
from ..middleware.rate_limit import limiter

router = APIRouter(tags=["Forecast"])


@router.get(
    "/forecast/{restaurant_id}",
    summary="Forecast",
    description="",
    dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]))]
)
@limiter.limit("10/minute")
def get_forecast_endpoint(request: Request, restaurant_id: int, service: ForecastService = Depends()) -> ForecastBase:
    return service.get_forecast(restaurant_id)
