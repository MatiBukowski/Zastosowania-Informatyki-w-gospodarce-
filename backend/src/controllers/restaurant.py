from fastapi import APIRouter, Depends
from ..schemas import RestaurantPublicResponse
from ..services import RestaurantService


router = APIRouter(prefix="/restaurants")

@router.get("", response_model=list[RestaurantPublicResponse])
def get_restaurants_endpoint(service: RestaurantService = Depends()):
    return service.get_restaurants()
