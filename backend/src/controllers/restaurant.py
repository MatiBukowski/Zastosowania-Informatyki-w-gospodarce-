from fastapi import APIRouter, Depends
from ..schemas import RestaurantPublicResponse, SingleRestaurantPublicResponse
from ..services import RestaurantService


router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.get(
    "",
    response_model=list[RestaurantPublicResponse],
    summary="Get all restaurants",
    description="Retrieve a list of all available restaurants"
)
def get_restaurants_endpoint(service: RestaurantService = Depends()):
    return service.get_restaurants()

@router.get("/{restaurant_id}", response_model=SingleRestaurantPublicResponse)
def get_restaurant_endpoint(restaurant_id: int, service: RestaurantService = Depends()):
    return service.get_restaurant(restaurant_id)
