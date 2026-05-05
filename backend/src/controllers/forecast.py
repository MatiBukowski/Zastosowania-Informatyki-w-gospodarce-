from fastapi import APIRouter, Depends

from ..schemas import ForecastBase
from ..services.forecast import ForecastService
from ..security import RoleChecker
from ..models import UserRoleEnum

router = APIRouter(tags=["Forecast"])


@router.get(
    "/forecast/{restaurant_id}",
    summary="Forecast",
    description="",
    dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER]))]
)
def get_forecast_endpoint(restaurant_id: int, service: ForecastService = Depends()) -> ForecastBase:
    return service.get_forecast(restaurant_id)
