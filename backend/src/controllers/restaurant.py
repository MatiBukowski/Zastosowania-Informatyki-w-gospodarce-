from fastapi import APIRouter, Depends
from ..schemas import (
    RestaurantPublicResponse,
    SingleRestaurantPublicResponse,
    MenuItemResponse,
    RestaurantTableResponse,
    ReservationPublicResponse
)
from ..services import RestaurantService, MenuService, RestaurantTableService, ReservationService


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

@router.get(
        "/{restaurant_id}/tables",
        summary="Get specific restaurant tables",
        description="Retrieve a list of all available tables for specific restaurant",
        response_model=list[RestaurantTableResponse]
        )
def get_restaurant_tables_endpoint(restaurant_id: int, service: RestaurantTableService = Depends()):
    return service.get_tables_for_restaurant(restaurant_id)

@router.get(
        "/{restaurant_id}/tables/{table_id}/reservations",
        summary="Get specific table reservations",
        description="Retrieve a list of all reservations for specific table",
        response_model=list[ReservationPublicResponse]
        )
def get_table_reservations_endpoint(restaurant_id: int, table_id: int, service: ReservationService = Depends()):
    return service.get_reservations_for_table(table_id)
