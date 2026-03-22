from fastapi import APIRouter, Depends
from ..services import RestaurantService, MenuService, TableService

router = APIRouter(prefix="/restaurants")

@router.get("")
def get_restaurants_endpoint(service: RestaurantService = Depends()):
    return service.get_restaurants()

@router.get("/{restaurant_id}")
def get_restaurant_endpoint(restaurant_id: int, service: RestaurantService = Depends()):
    return service.get_restaurant(restaurant_id)

@router.get("/{restaurant_id}/menu")
def get_menu_endpoint(restaurant_id: int, service: MenuService = Depends()):
    return service.get_menu_for_restaurant(restaurant_id)

@router.get("/{restaurant_id}/tables")
def get_menu_endpoint(restaurant_id: int, service: TableService = Depends()):
    return service.get_tables_for_restaurant(restaurant_id)


