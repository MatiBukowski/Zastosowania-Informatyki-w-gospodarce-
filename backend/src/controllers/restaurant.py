from fastapi import APIRouter, Depends
from ..schemas import (
    RestaurantPublicResponse,
    SingleRestaurantPublicResponse,
    MenuItemResponse
)
from ..services import RestaurantService, MenuService


router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.get(
    "",
    response_model=list[RestaurantPublicResponse],
    summary="Get all restaurants",
    description="Retrieve a list of all available restaurants"
)
def get_restaurants_endpoint(service: RestaurantService = Depends()):
    return service.get_restaurants()

@router.get(
        "/{restaurant_id}",
        summary="Get specific restaurant details",
        description="Get information about specific restaurant",
        response_model=SingleRestaurantPublicResponse
        )
def get_restaurant_endpoint(restaurant_id: int, service: RestaurantService = Depends()):
    return service.get_restaurant(restaurant_id)

@router.get(
        "/{restaurant_id}/menu",
        summary="Get specific restaurant menu",
        description="Retrieve a list of all available menu ites for specific restaurant",
        response_model=list[MenuItemResponse]
        )
def get_menu_endpoint(restaurant_id: int, service: MenuService = Depends()):
    return service.get_menu_for_restaurant(restaurant_id)
